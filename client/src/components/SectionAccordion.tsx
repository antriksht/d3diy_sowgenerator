import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Check, Clock, AlertCircle, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ProposalSection, SectionPrompt } from '../types/proposal';
import { PromptEditor } from './PromptEditor';

interface SectionAccordionProps {
  section: ProposalSection;
  sectionPrompts: SectionPrompt[];
  onGenerate: (sectionId: string) => void;
  onContentChange: (sectionId: string, content: string) => void;
  onPromptSave: (sectionTitle: string, customPrompt?: string) => void;
  isGenerating: boolean;
}

export function SectionAccordion({ 
  section, 
  sectionPrompts,
  onGenerate, 
  onContentChange, 
  onPromptSave,
  isGenerating 
}: SectionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (section.status) {
      case 'success':
        return <Check className="h-4 w-4" />;
      case 'generating':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'modified':
        return <Edit3 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (section.status) {
      case 'success':
        return 'Success';
      case 'generating':
        return 'Generating';
      case 'error':
        return 'Error';
      case 'modified':
        return 'Modified';
      default:
        return 'Idle';
    }
  };

  const getButtonText = () => {
    switch (section.status) {
      case 'success':
      case 'modified':
        return 'Regenerate';
      case 'error':
        return 'Retry';
      default:
        return 'Generate';
    }
  };

  return (
    <div className="bg-white/50 rounded-xl border border-white/20 overflow-hidden backdrop-blur-sm">
      <div 
        className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <ChevronDown 
            className={cn(
              "h-5 w-5 transition-transform text-gray-400",
              isExpanded && "transform rotate-180"
            )}
          />
          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1",
            `status-${section.status}`
          )}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <PromptEditor
            sectionTitle={section.title}
            sectionPrompts={sectionPrompts}
            onPromptSave={onPromptSave}
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onGenerate(section.id);
            }}
            disabled={isGenerating || section.status === 'generating'}
            size="sm"
            className="btn-primary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {getButtonText()}
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 py-4 animate-fade-in-up">
          {section.status === 'error' && section.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{section.errorMessage}</span>
              </div>
            </div>
          )}
          
          <Textarea
            value={section.content}
            onChange={(e) => onContentChange(section.id, e.target.value)}
            placeholder="AI generated content will appear here..."
            className="w-full h-40 resize-none form-input"
            disabled={section.status === 'generating'}
          />
        </div>
      )}
    </div>
  );
}
