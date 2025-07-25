import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType, BorderStyle, WidthType, LevelFormat, convertInchesToTwip } from 'docx';
import { ProposalConfig, ProposalSection } from '../types/proposal';

export class DocxService {
  private createTitlePage(config: ProposalConfig) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: `${config.clientCompany.name}`,
            bold: true,
            size: 48,
            font: "Arial",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: config.project.title,
            bold: true,
            size: 36,
            font: "Arial",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Statement of Work",
            italics: true,
            size: 24,
            font: "Arial",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
      new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
              children: [new TextRun({ text: "Document ID", font: "Arial" })],
              alignment: AlignmentType.LEFT 
            })],
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "SOW-001", font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
                width: { size: 70, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "Version", font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "v1.0", font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "Date", font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: new Date().toLocaleDateString(), font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: "Prepared by", font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: config.yourCompany.name, font: "Arial" })],
                  alignment: AlignmentType.LEFT 
                })],
              }),
            ],
          }),
        ],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
          insideVertical: { style: BorderStyle.SINGLE, size: 1 },
        },
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
    const dashIndex = cleanedContent.indexOf('---');
    if (dashIndex !== -1) {
      cleanedContent = cleanedContent.substring(0, dashIndex).trim();
    }

    // Ensure we have some content to prevent empty sections
    if (!cleanedContent.trim()) {
      cleanedContent = 'Content not available.';
    }

    // Split content by paragraphs and handle markdown formatting
    const contentLines = cleanedContent.split('\n');
    let currentParagraph = '';
    let inTable = false;
    let tableRows: string[][] = [];
    let inList = false;
    let listItems: Array<{text: string, level: number}> = [];

    for (const line of contentLines) {
      const trimmedLine = line.trim();
      
      // Check if this is a markdown header
      if (trimmedLine.startsWith('#')) {
        // Process any accumulated content first
        this.flushAccumulatedContent(paragraphs, currentParagraph, inTable, tableRows, inList, listItems);
        currentParagraph = '';
        inTable = false;
        inList = false;
        tableRows = [];
        listItems = [];
        
        // Parse markdown header
        const headerMatch = trimmedLine.match(/^(#{1,6})\s*(.+)$/);
        if (headerMatch) {
          const [, hashes, headerText] = headerMatch;
          const level = hashes.length;
          
          // Map markdown header levels to Word heading levels
          let headingLevel;
          switch (level) {
            case 1: headingLevel = HeadingLevel.HEADING_1; break;
            case 2: headingLevel = HeadingLevel.HEADING_2; break;
            case 3: headingLevel = HeadingLevel.HEADING_3; break;
            case 4: headingLevel = HeadingLevel.HEADING_4; break;
            case 5: headingLevel = HeadingLevel.HEADING_5; break;
            default: headingLevel = HeadingLevel.HEADING_6; break;
          }
          
          paragraphs.push(new Paragraph({
            text: headerText.trim(),
            heading: headingLevel,
            spacing: { after: 200, before: 200 },
          }));
        }
        continue;
      }
      
      // Check if this is a list item (- or * at start)
      const listMatch = trimmedLine.match(/^(\s*)[-*]\s*(.+)$/);
      if (listMatch) {
        const [, indent, text] = listMatch;
        const level = Math.floor(indent.length / 2); // 2 spaces per level
        
        if (!inList) {
          // Process any accumulated content first
          this.flushAccumulatedContent(paragraphs, currentParagraph, inTable, tableRows, false, []);
          currentParagraph = '';
          inTable = false;
          tableRows = [];
          inList = true;
        }
        
        listItems.push({ text: text.trim(), level });
        continue;
      }
      
      // Check if this line continues a list item with more content (after a colon)
      if (inList && trimmedLine && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('*') && 
          !trimmedLine.startsWith('#') && !trimmedLine.startsWith('|')) {
        // This might be continuation of the previous list item
        if (listItems.length > 0) {
          const lastItem = listItems[listItems.length - 1];
          if (lastItem.text.endsWith(':')) {
            // This is a sub-description for the previous item
            listItems.push({ text: trimmedLine, level: lastItem.level + 1 });
            continue;
          }
        }
      }
      
      // Check if this is a table row
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        if (!inTable) {
          // Process any accumulated content first
          this.flushAccumulatedContent(paragraphs, currentParagraph, false, [], inList, listItems);
          currentParagraph = '';
          inList = false;
          listItems = [];
          inTable = true;
        }
        
        // Parse table row
        const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim());
        if (cells.some(cell => cell.includes('---'))) {
          // Skip separator rows
          continue;
        }
        tableRows.push(cells);
      } else {
        // Process any accumulated content if switching modes
        if (inList || inTable) {
          this.flushAccumulatedContent(paragraphs, currentParagraph, inTable, tableRows, inList, listItems);
          currentParagraph = '';
          inTable = false;
          inList = false;
          tableRows = [];
          listItems = [];
        }
        
        // Regular paragraph content
        if (trimmedLine === '') {
          if (currentParagraph.trim()) {
            paragraphs.push(this.createFormattedParagraph(currentParagraph.trim()));
            currentParagraph = '';
          }
          // Add extra spacing for signature sections
          if (currentParagraph === '' && !inList && !inTable) {
            paragraphs.push(new Paragraph({ children: [], spacing: { after: 100 } }));
          }
        } else {
          // Handle signature lines specially
          if (trimmedLine.includes('____') || trimmedLine.match(/^(By|Name|Title|Date):\s*_+/)) {
            if (currentParagraph.trim()) {
              paragraphs.push(this.createFormattedParagraph(currentParagraph.trim()));
              currentParagraph = '';
            }
            paragraphs.push(this.createSignatureLine(trimmedLine));
          } else {
            currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
          }
        }
      }
    }

    // Add any remaining content
    this.flushAccumulatedContent(paragraphs, currentParagraph, inTable, tableRows, inList, listItems);

    return paragraphs;
  }

  private flushAccumulatedContent(
    paragraphs: any[], 
    currentParagraph: string, 
    inTable: boolean, 
    tableRows: string[][], 
    inList: boolean, 
    listItems: Array<{text: string, level: number}>
  ) {
    if (inList && listItems.length > 0) {
      paragraphs.push(...this.createBulletList(listItems));
    } else if (inTable && tableRows.length > 0) {
      const table = this.createTable(tableRows);
      paragraphs.push(table as any);
    } else if (currentParagraph.trim()) {
      paragraphs.push(this.createFormattedParagraph(currentParagraph.trim()));
    }
  }

  private createBulletList(listItems: Array<{text: string, level: number}>) {
    return listItems.map(item => {
      const indentLeft = convertInchesToTwip(0.25 * (item.level + 1)); // 0.25 inch per level
      const hangingIndent = convertInchesToTwip(0.25); // 0.25 inch hanging indent
      
      return new Paragraph({
        children: this.parseFormattedText(item.text),
        bullet: {
          level: item.level
        },
        indent: {
          left: indentLeft,
          hanging: hangingIndent
        },
        spacing: { after: 100 }
      });
    });
  }

  private parseFormattedText(text: string): TextRun[] {
    const parts: TextRun[] = [];
    
    // Handle signature lines with underscores (e.g., "By: ____________________")
    if (text.includes('____')) {
      const signatureLineRegex = /(.+?)(_{4,})(.*)/g;
      const match = signatureLineRegex.exec(text);
      if (match) {
        const [, beforeLine, underscores, afterLine] = match;
        
        if (beforeLine.trim()) {
          parts.push(new TextRun({ text: beforeLine, font: "Arial" }));
        }
        
        // Create a proper underline with spaces
        const lineLength = Math.max(underscores.length, 30);
        const underlinePart = '_'.repeat(lineLength);
        parts.push(new TextRun({ text: underlinePart, font: "Arial" }));
        
        if (afterLine.trim()) {
          parts.push(new TextRun({ text: afterLine, font: "Arial" }));
        }
        
        return parts;
      }
    }
    
    // Handle bold text formatting
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold part
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText.trim()) {
          parts.push(new TextRun({ text: beforeText, font: "Arial" }));
        }
      }
      
      // Add the bold text
      parts.push(new TextRun({ text: match[1], bold: true, font: "Arial" }));
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push(new TextRun({ text: remainingText, font: "Arial" }));
      }
    }
    
    // If no formatting was found, just use the plain text
    if (parts.length === 0) {
      parts.push(new TextRun({ text: text, font: "Arial" }));
    }
    
    return parts;
  }

  private createSignatureLine(text: string) {
    return new Paragraph({
      children: this.parseFormattedText(text),
      spacing: { after: 300, before: 200 },
    });
  }

  private createFormattedParagraph(text: string) {
    return new Paragraph({
      children: this.parseFormattedText(text),
      spacing: { after: 200 },
    });
  }

  private createTable(rows: string[][]) {
    if (rows.length === 0) return new Paragraph({ text: '' });

    const tableRows = rows.map((row, rowIndex) => 
      new TableRow({
        children: row.map(cell => 
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({
                text: cell,
                font: "Arial",
                ...(rowIndex === 0 ? { bold: true } : {})
              })]
            })],
          })
        ),
      })
    );

    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
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
    return await Packer.toBlob(doc);
    
    } catch (error) {
      console.error('Error in generateDocument:', error);
      throw new Error('Failed to generate document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async downloadDocument(config: ProposalConfig, sections: ProposalSection[]) {
    try {
      const blob = await this.generateDocument(config, sections);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.clientCompany.name}_${config.project.title}_SOW.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error('Failed to generate document. Please try again.');
    }
  }
}

export const docxService = new DocxService();
