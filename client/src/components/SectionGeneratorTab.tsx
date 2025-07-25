import React from 'react';
import { Wand2, Download, CheckCircle, Clock, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SectionAccordion } from './SectionAccordion';
import { PromptEditor } from './PromptEditor';
import { ProposalSection, ProposalConfig, AISettings } from '../types/proposal';
import { docxService } from '../services/docxService';

interface SectionGeneratorTabProps {
  sections: ProposalSection[];
  config: ProposalConfig;
  settings: AISettings;
  onGenerateSection: (sectionId: string) => void;
  onGenerateAll: () => void;
  onContentChange: (sectionId: string, content: string) => void;
  onExportDocx: () => void;
  onPromptSave: (sectionTitle: string, customPrompt?: string) => void;
  isGenerating: boolean;
  canExport: boolean;
}

export function SectionGeneratorTab({
  sections,
  config,
  settings,
  onGenerateSection,
  onGenerateAll,
  onContentChange,
  onExportDocx,
  onPromptSave,
  isGenerating,
  canExport
}: SectionGeneratorTabProps) {
  const completedSections = sections.filter(s => s.status === 'success' || s.status === 'modified').length;
  const totalSections = sections.length;
  const progressPercentage = (completedSections / totalSections) * 100;

  const handleTestDocument = async () => {
    try {
      await docxService.downloadTestDocument();
    } catch (error) {
      console.error('Test document generation failed:', error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Section Generator</h2>
          <p className="text-gray-600">Generate and edit individual proposal sections using AI.</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={handleTestDocument}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test Export
          </Button>
          
          <Button
            onClick={onGenerateAll}
            disabled={isGenerating}
            size="lg"
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate All
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="glass-morphism rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Configuration Complete</span>
          </div>
          <span className="text-sm text-gray-600">
            {completedSections} of {totalSections} sections completed
          </span>
        </div>
        
        <Progress value={progressPercentage} className="h-3" />
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Client:</strong> {config.clientCompany.name}</p>
          <p><strong>Project:</strong> {config.project.title}</p>
        </div>
      </div>

      {/* Section Accordions */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionAccordion
            key={section.id}
            section={section}
            sectionPrompts={settings.sectionPrompts}
            yourCompany={config.yourCompany}
            clientCompany={config.clientCompany}
            project={config.project}
            onGenerate={onGenerateSection}
            onContentChange={onContentChange}
            onPromptSave={onPromptSave}
            isGenerating={isGenerating}
          />
        ))}
      </div>

      {/* Export Section */}
      {canExport && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Export</h3>
              <p className="text-gray-600">
                All sections have been generated successfully. Export your professional SOW document.
              </p>
            </div>
            <Button
              onClick={onExportDocx}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <Download className="h-5 w-5 mr-2" />
              Export to DOCX
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
