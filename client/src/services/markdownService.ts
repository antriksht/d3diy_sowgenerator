import { ProposalSection, ProposalConfig } from '../types/proposal';

class MarkdownService {
  downloadMarkdownDocument(sections: ProposalSection[], config: ProposalConfig) {
    const markdownContent = this.generateMarkdownContent(sections, config);
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const fileName = `${config.clientCompany.name || 'Client'}_${config.project.title || 'Project'}_SOW.md`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log('Downloading file:', fileName);
    console.log('Download completed successfully');
  }

  private generateMarkdownContent(sections: ProposalSection[], config: ProposalConfig): string {
    const lines: string[] = [];
    
    // Title page
    lines.push('# STATEMENT OF WORK');
    lines.push('');
    lines.push(`## ${config.project.title || 'Project Title'}`);
    lines.push('');
    lines.push('**Prepared for:**');
    lines.push('');
    lines.push(config.clientCompany.name || 'Client Company');
    lines.push('');
    lines.push('**Prepared by:**');
    lines.push('');
    lines.push(config.yourCompany.name || 'Your Company');
    lines.push('');
    // Note: email and phone fields would need to be added to CompanyInfo type if needed
    lines.push(`**Date:** ${new Date().toLocaleDateString()}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    
    // Table of Contents
    lines.push('## Table of Contents');
    lines.push('');
    sections.forEach((section, index) => {
      lines.push(`${index + 1}. [${section.title}](#${this.slugify(section.title)})`);
    });
    lines.push('');
    lines.push('---');
    lines.push('');
    
    // Sections
    sections.forEach((section, index) => {
      lines.push(`## ${index + 1}. ${section.title} {#${this.slugify(section.title)}}`);
      lines.push('');
      
      // Clean the content - remove everything after "---"
      let cleanedContent = section.content || 'Content not available.';
      const dashIndex = cleanedContent.indexOf('---');
      if (dashIndex !== -1) {
        cleanedContent = cleanedContent.substring(0, dashIndex).trim();
      }
      
      if (cleanedContent.trim()) {
        lines.push(cleanedContent);
      } else {
        lines.push('Content not available.');
      }
      
      lines.push('');
      lines.push('---');
      lines.push('');
    });
    
    return lines.join('\n');
  }
  
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export const markdownService = new MarkdownService();