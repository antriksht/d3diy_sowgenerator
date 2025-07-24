import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, HeadingLevel, AlignmentType, BorderStyle, WidthType } from 'docx';
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
                children: [new Paragraph({ text: "Document ID", alignment: AlignmentType.LEFT })],
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: "SOW-001", alignment: AlignmentType.LEFT })],
                width: { size: 70, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Version", alignment: AlignmentType.LEFT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: "v1.0", alignment: AlignmentType.LEFT })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Date", alignment: AlignmentType.LEFT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: new Date().toLocaleDateString(), alignment: AlignmentType.LEFT })],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: "Prepared by", alignment: AlignmentType.LEFT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: config.yourCompany.name, alignment: AlignmentType.LEFT })],
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
          new TextRun(`${index + 1}. ${section.title}`),
          new TextRun(`\t${index + 3}`), // Page numbers start from page 3
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

    // Split content by paragraphs and handle markdown-style tables
    const contentLines = section.content.split('\n');
    let currentParagraph = '';
    let inTable = false;
    let tableRows: string[][] = [];

    for (const line of contentLines) {
      const trimmedLine = line.trim();
      
      // Check if this is a table row
      if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        if (!inTable) {
          // Start of table - add any accumulated paragraph content first
          if (currentParagraph.trim()) {
            paragraphs.push(new Paragraph({
              text: currentParagraph.trim(),
              spacing: { after: 200 },
            }));
            currentParagraph = '';
          }
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
        // End of table if we were in one
        if (inTable) {
          if (tableRows.length > 0) {
            const table = this.createTable(tableRows);
            paragraphs.push(table as any);
          }
          tableRows = [];
          inTable = false;
        }
        
        // Regular paragraph content
        if (trimmedLine === '') {
          if (currentParagraph.trim()) {
            paragraphs.push(new Paragraph({
              text: currentParagraph.trim(),
              spacing: { after: 200 },
            }));
            currentParagraph = '';
          }
        } else {
          currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
        }
      }
    }

    // Add any remaining content
    if (inTable && tableRows.length > 0) {
      const table = this.createTable(tableRows);
      paragraphs.push(table as any);
    } else if (currentParagraph.trim()) {
      paragraphs.push(new Paragraph({
        text: currentParagraph.trim(),
        spacing: { after: 200 },
      }));
    }

    return paragraphs;
  }

  private createTable(rows: string[][]) {
    if (rows.length === 0) return new Paragraph({ text: '' });

    const tableRows = rows.map((row, rowIndex) => 
      new TableRow({
        children: row.map(cell => 
          new TableCell({
            children: [new Paragraph({ 
              text: cell,
              ...(rowIndex === 0 ? { bold: true } : {})
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
