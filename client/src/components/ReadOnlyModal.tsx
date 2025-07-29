import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReadOnlyModalProps {
  title: string;
  content: string;
  triggerButton: React.ReactNode;
}

export function ReadOnlyModal({ title, content, triggerButton }: ReadOnlyModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
}
