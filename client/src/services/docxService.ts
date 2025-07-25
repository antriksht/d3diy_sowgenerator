import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Packer,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import { ProposalConfig, ProposalSection } from '../types/proposal';

class DocxService {
  private createTitlePage(config: ProposalConfig) {
    return [
      new Paragraph({
        children: [new TextRun({ text: "STATEMENT OF WORK", font: "Arial", bold: true, size: 36 })],
        alignment: 'center',
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.project.title, font: "Arial", bold: true, size: 28 })],
        alignment: 'center',
        spacing: { after: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Prepared for:", font: "Arial", bold: true, size: 24 })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.clientCompany.name, font: "Arial", size: 22 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.clientCompany.address, font: "Arial", size: 20 })],
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: "Prepared by:", font: "Arial", bold: true, size: 24 })],
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.yourCompany.name, font: "Arial", size: 22 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: config.yourCompany.address, font: "Arial", size: 20 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Email: ${config.yourCompany.email}`, font: "Arial", size: 20 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Phone: ${config.yourCompany.phone}`, font: "Arial", size: 20 })],
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [new TextRun({ text: new Date().toLocaleDateString(), font: "Arial", size: 20 })],
        alignment: 'center',
      }),
    ];
  }

  private createTableOfContents(sections: ProposalSection[]) {
    const tocItems = sections.map((section, index) => 
      new Paragraph({
        children: [
          new TextRun({ text: `${index + 1}. ${section.title}`, font: "Arial" }),
          new TextRun({ text: `\t${index + 3}`, font: "Arial" }), // Page numbers start from page 3
        ],
        spacing: { after: 100 },
      })
    );

    return [
      new Paragraph({
        text: "Table of Contents",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      ...tocItems,
    ];
  }

  private createSectionContent(section: ProposalSection, index: number) {
    const paragraphs = [
      new Paragraph({
        text: `${index + 1}. ${section.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      }),
    ];

    // Clean the content before processing - remove everything after "---"
    let cleanedContent = section.content || '';
    console.log(`Section ${section.title} - Original content length:`, cleanedContent.length);
    
    const dashIndex = cleanedContent.indexOf('---');
    if (dashIndex !== -1) {
      console.log(`Section ${section.title} - Found "---" at position:`, dashIndex);
      cleanedContent = cleanedContent.substring(0, dashIndex).trim();
      console.log(`Section ${section.title} - After cleaning, length:`, cleanedContent.length);
    }

    // Ensure we have some content to prevent empty sections
    if (!cleanedContent.trim()) {
      console.log(`Section ${section.title} - Content was empty, using fallback`);
      cleanedContent = 'Content not available.';
    }

    // Process content line by line for formatting
    const lines = cleanedContent.split('\n');
    let currentParagraphText = '';
    let inTable = false;
    let tableRows: string[][] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Empty line - flush current paragraph
      if (!trimmedLine) {
        if (currentParagraphText.trim()) {
          paragraphs.push(this.createFormattedParagraph(currentParagraphText.trim()));
          currentParagraphText = '';
        }
        // Flush table if we were in one
        if (inTable && tableRows.length > 0) {
          paragraphs.push(this.createTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        continue;
      }
      
      // Check for markdown headers
      if (trimmedLine.startsWith('#')) {
        // Flush current content
        if (currentParagraphText.trim()) {
          paragraphs.push(this.createFormattedParagraph(currentParagraphText.trim()));
          currentParagraphText = '';
        }
        if (inTable && tableRows.length > 0) {
          paragraphs.push(this.createTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        
        // Create header
        const headerLevel = (trimmedLine.match(/^#+/) || [''])[0].length;
        const headerText = trimmedLine.replace(/^#+\s*/, '');
        
        let headingLevel;
        switch (headerLevel) {
          case 1: headingLevel = HeadingLevel.HEADING_2; break;
          case 2: headingLevel = HeadingLevel.HEADING_3; break;
          default: headingLevel = HeadingLevel.HEADING_4; break;
        }
        
        paragraphs.push(new Paragraph({
          text: headerText,
          heading: headingLevel,
          spacing: { before: 200, after: 200 },
        }));
        continue;
      }
      
      // Check for table rows
      if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 3) {
        // Flush current paragraph
        if (currentParagraphText.trim()) {
          paragraphs.push(this.createFormattedParagraph(currentParagraphText.trim()));
          currentParagraphText = '';
        }
        
        const cells = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        // Skip separator rows
        if (!cells.some(cell => cell.includes('---'))) {
          if (!inTable) {
            inTable = true;
            tableRows = [];
          }
          tableRows.push(cells);
        }
        continue;
      }
      
      // Check for bullet points
      if (trimmedLine.match(/^[\*\-\+]\s+/) || trimmedLine.match(/^\d+\.\s+/)) {
        // Flush current content
        if (currentParagraphText.trim()) {
          paragraphs.push(this.createFormattedParagraph(currentParagraphText.trim()));
          currentParagraphText = '';
        }
        if (inTable && tableRows.length > 0) {
          paragraphs.push(this.createTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        
        // Create bullet point
        const bulletText = trimmedLine.replace(/^[\*\-\+]\s+/, '').replace(/^\d+\.\s+/, '');
        paragraphs.push(new Paragraph({
          children: this.parseInlineFormatting(bulletText),
          bullet: { level: 0 },
          indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
          spacing: { after: 100 },
        }));
        continue;
      }
      
      // Regular content - accumulate into paragraph
      if (inTable && tableRows.length > 0) {
        paragraphs.push(this.createTable(tableRows));
        tableRows = [];
        inTable = false;
      }
      
      currentParagraphText += (currentParagraphText ? ' ' : '') + trimmedLine;
    }
    
    // Flush any remaining content
    if (currentParagraphText.trim()) {
      paragraphs.push(this.createFormattedParagraph(currentParagraphText.trim()));
    }
    if (inTable && tableRows.length > 0) {
      paragraphs.push(this.createTable(tableRows));
    }

    console.log(`Section ${section.title} - Generated ${paragraphs.length} paragraphs/elements`);
    return paragraphs;
  }

  private parseInlineFormatting(text: string): TextRun[] {
    const runs: TextRun[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          runs.push(new TextRun({ text: beforeText, font: "Arial" }));
        }
      }
      
      // Add bold text
      runs.push(new TextRun({ text: match[1], font: "Arial", bold: true }));
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        runs.push(new TextRun({ text: remainingText, font: "Arial" }));
      }
    }
    
    // If no formatting found, return plain text
    if (runs.length === 0) {
      runs.push(new TextRun({ text: text, font: "Arial" }));
    }
    
    return runs;
  }

  private createFormattedParagraph(text: string): Paragraph {
    return new Paragraph({
      children: this.parseInlineFormatting(text),
      spacing: { after: 200 },
    });
  }

  private createTable(rows: string[][]): Table {
    if (rows.length === 0) {
      return new Table({ rows: [] });
    }

    const tableRows = rows.map((row, rowIndex) => 
      new TableRow({
        children: row.map(cell => 
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({
                text: cell || '',
                font: "Arial",
                bold: rowIndex === 0
              })]
            })],
          })
        ),
      })
    );

    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
  }

  async generateDocument(config: ProposalConfig, sections: ProposalSection[]): Promise<Blob> {
    try {
      const completedSections = sections.filter(section => 
        section.status === 'success' || section.status === 'modified'
      );

      console.log('Generating document for', completedSections.length, 'sections');

      const children = [
        // Title page
        ...this.createTitlePage(config),
        
        // Page break
        new Paragraph({
          children: [],
          pageBreakBefore: true,
        }),
        
        // Table of contents
        ...this.createTableOfContents(completedSections),
        
        // Page break
        new Paragraph({
          children: [],
          pageBreakBefore: true,
        }),
        
        // Sections - with error handling
        ...completedSections.flatMap((section, index) => {
          try {
            console.log(`Processing section ${index}: ${section.title}`);
            const sectionContent = this.createSectionContent(section, index);
            return [
              ...(index > 0 ? [new Paragraph({ children: [], pageBreakBefore: true })] : []),
              ...sectionContent,
            ];
          } catch (error) {
            console.error(`Error processing section ${section.title}:`, error);
            return [
              ...(index > 0 ? [new Paragraph({ children: [], pageBreakBefore: true })] : []),
              new Paragraph({
                text: `${index + 1}. ${section.title}`,
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
              }),
              new Paragraph({
                children: [new TextRun({ text: 'Error generating content for this section.', font: 'Arial' })],
                spacing: { after: 200 },
              }),
            ];
          }
        }),
      ];

    const doc = new Document({
      styles: {
        default: {
          heading1: {
            run: {
              size: 28,
              bold: true,
              font: "Arial",
            },
            paragraph: {
              spacing: { after: 240 },
            },
          },
          heading2: {
            run: {
              size: 24,
              bold: true,
              font: "Arial",
            },
            paragraph: {
              spacing: { after: 200 },
            },
          },
          document: {
            run: {
              font: "Arial",
              size: 22,
            },
          },
        },
      },
      sections: [{
        properties: {},
        children,
      }],
    });

    console.log('Document structure created, generating blob...');
    const blob = await Packer.toBlob(doc);
    console.log('Blob generated successfully, size:', blob.size, 'bytes');
    return blob;
    
    } catch (error) {
      console.error('Error in generateDocument:', error);
      throw new Error('Failed to generate document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async downloadDocument(config: ProposalConfig, sections: ProposalSection[]) {
    try {
      console.log('Starting document generation...');
      const blob = await this.generateDocument(config, sections);
      console.log('Document generated, creating download link...');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${config.clientCompany.name}_${config.project.title}_SOW.docx`;
      link.download = filename;
      console.log('Downloading file:', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error('Failed to generate document. Please try again.');
    }
  }

  // Test method to generate a minimal document
  async generateTestDocument(): Promise<Blob> {
    console.log('Generating test document...');
    
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Arial",
              size: 22,
            },
          },
        },
      },
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Test Document", font: "Arial", bold: true })],
          }),
          new Paragraph({
            children: [new TextRun({ text: "This is a simple test document.", font: "Arial" })],
          }),
        ],
      }],
    });

    console.log('Test document structure created, generating blob...');
    const blob = await Packer.toBlob(doc);
    console.log('Test blob generated successfully, size:', blob.size, 'bytes');
    return blob;
  }

  async downloadTestDocument() {
    try {
      const blob = await this.generateTestDocument();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test_document.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('Test document download completed');
    } catch (error) {
      console.error('Error generating test document:', error);
    }
  }
}

export const docxService = new DocxService();