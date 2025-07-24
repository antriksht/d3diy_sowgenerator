import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ConfigurationTab } from '../components/ConfigurationTab';
import { SectionGeneratorTab } from '../components/SectionGeneratorTab';
import { SettingsTab } from '../components/SettingsTab';
import { aiService } from '../services/aiService';
import { docxService } from '../services/docxService';
import { validateConfiguration } from '../utils/validation';
import { ProposalState, ProposalSection, ProposalConfig, AISettings } from '../types/proposal';

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
    serviceDescription: ''
  },
  sections: [
    'Introduction',
    'Definitions and Acronyms',
    'Scope of Work',
    'Deliverables',
    'Timelines',
    'Assumptions',
    'Exclusions',
    'Commercials / Pricing',
    'Change Control',
    'Contact Details',
    'Terms & Conditions',
    'Acceptance & Signature'
  ],
  isConfigurationComplete: false
};

const defaultSettings: AISettings = {
  useSystemKeys: true,
  openaiApiKey: '',
  geminiApiKey: '',
  autoSave: true,
  showProgress: true
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

  // Auto-save functionality
  useEffect(() => {
    if (settings.autoSave) {
      const timestamp = new Date().toLocaleString();
      setLastSaved(timestamp);
    }
  }, [config, sections, settings.autoSave]);

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

  const isConfigValid = Object.keys(validationErrors).length === 0 && validateForm();

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

      const content = await aiService.generateSection({
        sectionTitle: section.title,
        yourCompany: config.yourCompany,
        clientCompany: config.clientCompany,
        project: config.project,
        openaiApiKey: !settings.useSystemKeys ? settings.openaiApiKey : undefined,
        geminiApiKey: !settings.useSystemKeys ? settings.geminiApiKey : undefined,
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
    <div className="min-h-screen relative">
      {/* Floating Background Shapes */}
      <div className="floating-bg-shapes">
        <div className="floating-shape floating-shape-1"></div>
        <div className="floating-shape floating-shape-2"></div>
        <div className="floating-shape floating-shape-3"></div>
      </div>

      {/* Header */}
      <header className="glass-morphism border-0 border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D3</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Proposal Generator</h1>
                <p className="text-sm text-gray-600">Professional SOW Builder</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`progress-step rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold ${
                activeTab === 'configuration' ? 'active bg-primary text-white' : 'bg-gray-200'
              }`}>1</div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`progress-step rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold ${
                config.isConfigurationComplete ? (activeTab === 'generator' ? 'active bg-primary text-white' : 'completed bg-green-500 text-white') : 'bg-gray-200'
              }`}>2</div>
              <div className="w-8 h-0.5 bg-gray-300"></div>
              <div className={`progress-step rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold ${
                activeTab === 'settings' ? 'active bg-primary text-white' : 'bg-gray-200'
              }`}>3</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="glass-morphism border border-white/20 p-1 mb-8">
            <TabsTrigger 
              value="configuration" 
              className="data-[state=active]:tab-active"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="generator" 
              className="data-[state=active]:tab-active"
              disabled={!config.isConfigurationComplete}
            >
              Section Generator
              {!config.isConfigurationComplete && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Locked
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:tab-active"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="glass-morphism rounded-2xl p-8">
            <ConfigurationTab
              config={config}
              onConfigChange={handleConfigChange}
              onStartGeneration={handleStartGeneration}
              isValid={isConfigValid}
              validationErrors={validationErrors}
              isLocked={config.isConfigurationComplete}
            />
          </TabsContent>

          <TabsContent value="generator" className="glass-morphism rounded-2xl p-8">
            <SectionGeneratorTab
              sections={sections}
              config={config}
              onGenerateSection={handleGenerateSection}
              onGenerateAll={handleGenerateAll}
              onContentChange={handleContentChange}
              onExportDocx={handleExportDocx}
              isGenerating={isGenerating}
              canExport={canExport}
            />
          </TabsContent>

          <TabsContent value="settings" className="glass-morphism rounded-2xl p-8">
            <SettingsTab
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onSaveSettings={handleSaveSettings}
              onClearStorage={handleClearStorage}
              lastSaved={lastSaved}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
