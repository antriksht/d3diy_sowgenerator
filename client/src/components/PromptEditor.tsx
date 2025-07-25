import React, { useState } from 'react';
import { Edit, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { SectionPrompt } from '../types/proposal';
import { defaultSections } from '../data/defaultSections';

interface PromptEditorProps {
  sectionTitle: string;
  sectionPrompts: SectionPrompt[];
  onPromptSave: (sectionTitle: string, customPrompt?: string) => void;
}

export function PromptEditor({ sectionTitle, sectionPrompts, onPromptSave }: PromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');

  const sectionPrompt = sectionPrompts.find(p => p.sectionTitle === sectionTitle);
  const defaultSection = defaultSections.find(s => s.title === sectionTitle);
  const currentPrompt = sectionPrompt?.customPrompt || defaultSection?.prompt || '';
  const hasCustomPrompt = !!sectionPrompt?.customPrompt;

  const handleOpen = () => {
    setEditedPrompt(currentPrompt);
    setIsOpen(true);
  };

  const handleSave = () => {
    onPromptSave(sectionTitle, editedPrompt);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultPrompt = defaultSection?.prompt || '';
    setEditedPrompt(defaultPrompt);
    onPromptSave(sectionTitle, undefined);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className={`ml-2 ${hasCustomPrompt ? 'border-blue-500 text-blue-700' : ''}`}
        >
          <Edit className="h-4 w-4 mr-1" />
          {hasCustomPrompt ? 'Custom' : 'Edit'} Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Prompt for "{sectionTitle}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Section Generation Prompt
            </label>
            <Textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              rows={8}
              className="w-full"
              placeholder="Enter the prompt for generating this section..."
            />
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Prompt
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}