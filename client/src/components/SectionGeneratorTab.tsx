import React from 'react';
import { Wand2, Download, CheckCircle, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SectionAccordion } from './SectionAccordion';
import { PromptEditor } from './PromptEditor';
import { ProposalSection, ProposalConfig, AISettings } from '../types/proposal';
import { markdownService } from '../services/markdownService';

interface SectionGeneratorTabProps {
  sections: ProposalSection[];
  config: ProposalConfig;
  settings: AISettings;
  onGenerateSection: (sectionId: string, sectionTitle: string) => void;
  onGenerateAll: () => void;
  onContentChange: (sectionId: string, content: string) => void;
  onExportDocx: () => void;
  onExportMarkdown: () => void;
  onPromptSave: (sectionTitle: string, customPrompt?: string) => void;
  onCancelSection: (sectionId: string) => void;
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
  onExportMarkdown,
  onPromptSave,
  onCancelSection,
  isGenerating,
  canExport
}: SectionGeneratorTabProps) {
  const completedSections = sections.filter(s => s.status === 'success' || s.status === 'modified').length;
  const totalSections = sections.length;
  const progressPercentage = (completedSections / totalSections) * 100;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Section Generator</h2>
          <p className="text-gray-600">Generate and edit individual proposal sections using AI.</p>
        </div>
        
        <div className="flex space-x-3">
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
            onCancel={onCancelSection}
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
            <div className="flex space-x-3">
              <Button
                onClick={onExportMarkdown}
                size="lg"
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold transition-all duration-300 hover:scale-105"
              >
                <FileText className="h-5 w-5 mr-2" />
                Export Markdown
              </Button>
              <Button
                onClick={onExportDocx}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                <Download className="h-5 w-5 mr-2" />
                Export DOCX
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
