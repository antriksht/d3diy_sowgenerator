import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ConfigurationTab } from '../components/ConfigurationTab';
import { SectionGeneratorTab } from '../components/SectionGeneratorTab';
import { SettingsTab } from '../components/SettingsTab';
import { aiService } from '../services/aiService';
import { docxService } from '../services/docxService';
import { validateConfiguration } from '../utils/validation';
import { populatePromptTemplate } from '../utils/promptUtils';
import { ProposalState, ProposalSection, ProposalConfig, AISettings } from '../types/proposal';
import { defaultSectionPrompts, defaultFallbackPrompt } from '../data/defaultSections';

const defaultConfig: ProposalConfig = {
  yourCompany: {
    name: '',
    website: '',
    logoUrl: '',
    description: ''
  },
  clientCompany: {
    name: '',
    website: '',
    logoUrl: '',
    description: ''
  },
  project: {
    title: '',
    serviceDescription: '',
    annualBudget: '',
    targetGeo: ''
  },
  sections: defaultSectionPrompts.map(prompt => prompt.sectionTitle),
  isConfigurationComplete: false
};

const defaultSettings: AISettings = {
  useSystemKeys: true,
  openaiApiKey: '',
  geminiApiKey: '',
  autoSave: true,
  showProgress: true,
  sectionPrompts: defaultSectionPrompts,
  fallbackPrompt: defaultFallbackPrompt
};

export default function ProposalGenerator() {
  const { toast } = useToast();
  
  // State management with localStorage
  const [config, setConfig] = useLocalStorage<ProposalConfig>('proposal-config', defaultConfig);
  const [sections, setSections] = useLocalStorage<ProposalSection[]>('proposal-sections', []);
  const [settings, setSettings] = useLocalStorage<AISettings>('proposal-settings', defaultSettings);
  const [lastSaved, setLastSaved] = useLocalStorage<string>('proposal-last-saved', '');
  
  // UI state
  const [activeTab, setActiveTab] = useState<'configuration' | 'generator' | 'settings'>('configuration');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize sections when config sections change
  useEffect(() => {
    if (config.sections.length > 0) {
      const newSections = config.sections.map((title, index) => {
        const existingSection = sections.find(s => s.title === title);
        return existingSection || {
          id: `section-${index}`,
          title,
          content: '',
          status: 'idle' as const
        };
      });
      setSections(newSections);
    }
  }, [config.sections]);

  // Validation
  const validateForm = useCallback(() => {
    const result = validateConfiguration(config);
    if ('errors' in result) {
      const errorMap: Record<string, string> = {};
      result.errors.forEach((error: any) => {
        const path = error.path.join('.');
        errorMap[path] = error.message;
      });

      setValidationErrors(errorMap);
      return false;
    }
    setValidationErrors({});
    return true;
  }, [config]);

  // Initial validation and auto-save functionality
  useEffect(() => {
    validateForm();
    if (settings.autoSave) {
      const timestamp = new Date().toLocaleString();
      setLastSaved(timestamp);
    }
  }, [config, sections, settings.autoSave, validateForm]);

  const isConfigValid = Object.keys(validationErrors).length === 0;

  // Configuration handlers
  const handleConfigChange = (newConfig: ProposalConfig) => {
    setConfig(newConfig);
    validateForm();
  };

  const handleStartGeneration = () => {
    if (validateForm()) {
      setConfig({ ...config, isConfigurationComplete: true });
      setActiveTab('generator');
      toast({
        title: "Configuration Locked",
        description: "Configuration is now locked. You can generate proposal sections.",
      });
    } else {
      toast({
        title: "Validation Error",
        description: "Please fix the configuration errors before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handleUnlockConfiguration = () => {
    setConfig({ ...config, isConfigurationComplete: false });
    setSections([]); // Clear all generated sections
    setActiveTab('configuration');
    toast({
      title: "Configuration Unlocked",
      description: "Configuration is unlocked. All generated content has been cleared.",
      variant: "destructive",
    });
  };

  const handleStartFresh = () => {
    setConfig(defaultConfig);
    setSections([]);
    setSettings(defaultSettings);
    setLastSaved('');
    setActiveTab('configuration');
    toast({
      title: "Reset Complete",
      description: "All data has been cleared. Starting fresh.",
    });
  };

  // Section generation handlers
  const handleGenerateSection = async (sectionId: string) => {
    if (!config.isConfigurationComplete || isGenerating) return;

    setIsGenerating(true);
    
    // Update section status to generating
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, status: 'generating', errorMessage: undefined }
        : section
    ));

    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) throw new Error('Section not found');

      // Find custom prompt and example for this section
      const sectionPrompt = settings.sectionPrompts.find(p => p.sectionTitle === section.title);
      
      // Populate custom prompt if it exists, otherwise use fallback
      let finalCustomPrompt: string | undefined;
      if (sectionPrompt?.customPrompt) {
        finalCustomPrompt = populatePromptTemplate(
          sectionPrompt.customPrompt,
          config.yourCompany,
          config.clientCompany,
          config.project,
          section.title
        );
      }
      
      const content = await aiService.generateSection({
        sectionTitle: section.title,
        yourCompany: config.yourCompany,
        clientCompany: config.clientCompany,
        project: config.project,
        useSystemKeys: settings.useSystemKeys,
        openaiApiKey: settings.openaiApiKey,
        geminiApiKey: settings.geminiApiKey,
        customPrompt: finalCustomPrompt || populatePromptTemplate(
          settings.fallbackPrompt || '',
          config.yourCompany,
          config.clientCompany,
          config.project,
          section.title
        ),
        sectionExample: sectionPrompt?.exampleContent,
      });

      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, content, status: 'success', errorMessage: undefined }
          : s
      ));

      toast({
        title: "Section Generated",
        description: `"${section.title}" has been generated successfully.`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      setSections(prev => prev.map(s => 
        s.id === sectionId 
          ? { ...s, status: 'error', errorMessage }
          : s
      ));

      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!config.isConfigurationComplete || isGenerating) return;

    setIsGenerating(true);
    
    const pendingSections = sections.filter(s => s.status === 'idle' || s.status === 'error');
    
    for (const section of pendingSections) {
      await handleGenerateSection(section.id);
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsGenerating(false);
    
    toast({
      title: "Batch Generation Complete",
      description: `Generated ${pendingSections.length} sections.`,
    });
  };

  const handleContentChange = (sectionId: string, content: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { 
            ...section, 
            content, 
            status: section.content !== content ? 'modified' : section.status 
          }
        : section
    ));
  };

  // Export handler
  const handleExportDocx = async () => {
    try {
      await docxService.downloadDocument(config, sections);
      toast({
        title: "Export Successful",
        description: "Your proposal has been downloaded as a DOCX file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export document",
        variant: "destructive",
      });
    }
  };

  // Settings handlers
  const handleSettingsChange = (newSettings: AISettings) => {
    setSettings(newSettings);
  };

  const handleSaveSettings = () => {
    const timestamp = new Date().toLocaleString();
    setLastSaved(timestamp);
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  const handlePromptSave = (sectionTitle: string, customPrompt?: string) => {
    const updatedPrompts = settings.sectionPrompts.map(prompt => 
      prompt.sectionTitle === sectionTitle 
        ? { ...prompt, customPrompt }
        : prompt
    );
    
    setSettings({ ...settings, sectionPrompts: updatedPrompts });
    toast({
      title: "Prompt Updated",
      description: `Custom prompt for "${sectionTitle}" has been ${customPrompt ? 'saved' : 'reset to default'}.`,
    });
  };

  const handleClearStorage = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setConfig(defaultConfig);
      setSections([]);
      setSettings(defaultSettings);
      setLastSaved('');
      setActiveTab('configuration');
      toast({
        title: "Data Cleared",
        description: "All project data has been cleared.",
      });
    }
  };

  const canExport = sections.length > 0 && sections.some(s => s.status === 'success' || s.status === 'modified');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Enhanced Background with D3 Branding */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-[#E9204F]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-tl from-slate-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-r from-[#E9204F]/3 to-transparent rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E9204F] to-[#C41E3A] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl tracking-tight">D3</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">D3 Alpha</h1>
                <p className="text-sm text-[#E9204F] font-medium">Digital Proposal Generator</p>
              </div>
            </div>
            
            {/* Enhanced Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-gray-200/50">
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTab === 'configuration' ? 'bg-[#E9204F] scale-125' : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    activeTab === 'configuration' ? 'text-[#E9204F]' : 'text-gray-500'
                  }`}>Config</span>
                </div>
                <div className="w-8 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    config.isConfigurationComplete ? (activeTab === 'generator' ? 'bg-[#E9204F] scale-125' : 'bg-green-500') : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    config.isConfigurationComplete ? (activeTab === 'generator' ? 'text-[#E9204F]' : 'text-green-600') : 'text-gray-500'
                  }`}>Generate</span>
                </div>
                <div className="w-8 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeTab === 'settings' ? 'bg-[#E9204F] scale-125' : 'bg-gray-300'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    activeTab === 'settings' ? 'text-[#E9204F]' : 'text-gray-500'
                  }`}>Settings</span>
                </div>
              </div>
              
              {/* Start Fresh Button */}
              <Button
                onClick={handleStartFresh}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Title Section */}
      <section className="relative z-10 bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Statement of Work Generator
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create compelling, professional proposals with AI-powered content generation. 
              Configure your project details, generate custom sections, and export polished DOCX documents.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="relative z-10 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm p-1 text-muted-foreground shadow-lg border border-gray-200/50 mb-8">
              <TabsTrigger 
                value="configuration" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#E9204F] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Project Configuration
              </TabsTrigger>
              <TabsTrigger 
                value="generator" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#E9204F] data-[state=active]:text-white data-[state=active]:shadow-md"
                disabled={!config.isConfigurationComplete}
              >
                Section Generator
                {!config.isConfigurationComplete && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#E9204F] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Settings & API
              </TabsTrigger>
            </TabsList>

            {/* Main Content Area */}
            <div className="pb-16">
              <TabsContent value="configuration" className="mt-0">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8">
                  <ConfigurationTab
                    config={config}
                    onConfigChange={handleConfigChange}
                    onStartGeneration={handleStartGeneration}
                    onUnlockConfiguration={handleUnlockConfiguration}
                    isValid={isConfigValid}
                    validationErrors={validationErrors}
                    isLocked={config.isConfigurationComplete}
                  />
                </div>
              </TabsContent>

              <TabsContent value="generator" className="mt-0">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8">
                  <SectionGeneratorTab
                    sections={sections}
                    config={config}
                    settings={settings}
                    onGenerateSection={handleGenerateSection}
                    onGenerateAll={handleGenerateAll}
                    onContentChange={handleContentChange}
                    onExportDocx={handleExportDocx}
                    onPromptSave={handlePromptSave}
                    isGenerating={isGenerating}
                    canExport={canExport}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8">
                  <SettingsTab
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    onSaveSettings={handleSaveSettings}
                    onClearStorage={handleClearStorage}
                    lastSaved={lastSaved}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
