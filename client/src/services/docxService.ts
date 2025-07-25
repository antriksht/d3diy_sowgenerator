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

    // Split content by paragraphs and handle markdown formatting
    const contentLines = section.content.split('\n');
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
        } else {
          currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
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
    return listItems.map(item => 
      new Paragraph({
        children: this.parseFormattedText(item.text),
        bullet: {
          level: item.level
        },
        spacing: { after: 100 }
      })
    );
  }

  private parseFormattedText(text: string): TextRun[] {
    const parts: TextRun[] = [];
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
    const completedSections = sections.filter(section => 
      section.status === 'success' || section.status === 'modified'
    );

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
      
      // Sections
      ...completedSections.flatMap((section, index) => [
        ...(index > 0 ? [new Paragraph({ children: [], pageBreakBefore: true })] : []),
        ...this.createSectionContent(section, index),
      ]),
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

    return await Packer.toBlob(doc);
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
