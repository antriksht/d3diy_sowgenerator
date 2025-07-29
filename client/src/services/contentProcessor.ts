import { ProposalSection } from '../types/proposal';

export interface ProcessedBlock {
  type: 'paragraph' | 'header' | 'list' | 'table' | 'bold_text';
  content: string;
  level?: number;
  items?: string[];
  itemLevels?: number[]; // Track indentation levels for list items
  rows?: string[][];
  originalText: string;
}

export class ContentProcessor {
  /**
   * Clean content by removing everything after "---" marker
   */
  static cleanContent(content: string): string {
    // Find the last occurrence of "---" which typically indicates end of AI content
    const lines = content.split('\n');
    let cutoffIndex = -1;
    
    // Look for "---" that appears to be an end marker (not table separators)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line === '---' && i > lines.length / 2) { // Only consider "---" in second half as end markers
        cutoffIndex = i;
        break;
      }
    }
    
    if (cutoffIndex !== -1) {
      const cleanedLines = lines.slice(0, cutoffIndex);
      return cleanedLines.join('\n').trim();
    }
    
    return content.trim();
  }

  /**
   * Process section content into structured blocks for export
   */
  static processContent(section: ProposalSection): ProcessedBlock[] {
    const cleanedContent = this.cleanContent(section.content || '');
    
    if (!cleanedContent) {
      return [{
        type: 'paragraph',
        content: 'Content not available.',
        originalText: 'Content not available.'
      }];
    }

    const blocks: ProcessedBlock[] = [];
    const lines = cleanedContent.split('\n');
    
    let currentParagraph = '';
    let inList = false;
    let listItems: string[] = [];
    let listItemLevels: number[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Empty line - process accumulated content
      if (!trimmedLine) {
        this.flushContent(blocks, currentParagraph, listItems, listItemLevels, tableRows, inList, inTable);
        currentParagraph = '';
        listItems = [];
        listItemLevels = [];
        tableRows = [];
        inList = false;
        inTable = false;
        continue;
      }

      // Check for headers (# ## ###)
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        this.flushContent(blocks, currentParagraph, listItems, listItemLevels, tableRows, inList, inTable);
        blocks.push({
          type: 'header',
          content: headerMatch[2].trim(),
          level: headerMatch[1].length,
          originalText: trimmedLine
        });
        currentParagraph = '';
        listItems = [];
        listItemLevels = [];
        tableRows = [];
        inList = false;
        inTable = false;
        continue;
      }

      // Check for bullet points (- * + or 1. 2. etc.) with indentation
      const bulletMatch = line.match(/^(\s*)[-*+]\s+(.+)$/) || 
                         line.match(/^(\s*)\d+\.\s+(.+)$/);
      if (bulletMatch) {
        if (!inList) {
          this.flushContent(blocks, currentParagraph, [], [], tableRows, false, inTable);
          currentParagraph = '';
          tableRows = [];
          inTable = false;
          inList = true;
          listItems = [];
          listItemLevels = [];
        }
        
        // Calculate indentation level (every 2 spaces = 1 level)
        const indentLevel = Math.floor(bulletMatch[1].length / 2);
        listItems.push(bulletMatch[2].trim());
        listItemLevels.push(indentLevel);
        continue;
      }

      // Check for table rows (| column | column |)
      if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 2) {
        const allCells = trimmedLine.split('|').map(cell => cell.trim());
        
        // Remove empty cells from start and end (markdown tables often start/end with |)
        while (allCells.length > 0 && !allCells[0]) {
          allCells.shift();
        }
        while (allCells.length > 0 && !allCells[allCells.length - 1]) {
          allCells.pop();
        }
        
        // Check if this is a separator row (like |---|---|)
        const isSeparatorRow = allCells.every(cell => cell.match(/^-+$/));
        
        // Only process if we have actual content cells (not separator rows)
        if (allCells.length > 0 && !isSeparatorRow) {
          console.log('Table row detected:', allCells);
          
          if (!inTable) {
            this.flushContent(blocks, currentParagraph, listItems, listItemLevels, [], inList, false);
            currentParagraph = '';
            listItems = [];
            listItemLevels = [];
            inList = false;
            inTable = true;
            tableRows = [];
          }
          tableRows.push(allCells);
        }
        
        // Continue processing table even if this was a separator row
        if (inTable || allCells.length > 0) {
          continue;
        }
      }

      // Regular content - check if we should end table/list processing
      // Only end table processing if we encounter non-table content
      if (inList) {
        this.flushContent(blocks, currentParagraph, listItems, listItemLevels, tableRows, inList, inTable);
        currentParagraph = '';
        listItems = [];
        listItemLevels = [];
        tableRows = [];
        inList = false;
        inTable = false;
      } else if (inTable) {
        // End table processing if we get content that's not table-related
        this.flushContent(blocks, currentParagraph, listItems, listItemLevels, tableRows, inList, inTable);
        currentParagraph = '';
        listItems = [];
        listItemLevels = [];
        tableRows = [];
        inList = false;
        inTable = false;
      }

      // Accumulate paragraph content - preserve line breaks for signature blocks
      if (currentParagraph) {
        // Check if this is signature content that should preserve line breaks
        const isSignatureContent = trimmedLine.includes('By:') || trimmedLine.includes('Name:') || 
                                   trimmedLine.includes('Title:') || trimmedLine.includes('Date:') ||
                                   currentParagraph.includes('By:') || currentParagraph.includes('Name:') ||
                                   currentParagraph.includes('Title:') || currentParagraph.includes('Date:') ||
                                   trimmedLine.includes('**INTELEGENCIA**') || trimmedLine.includes('**ASTERI PARTNERS**') ||
                                   currentParagraph.includes('**INTELEGENCIA**') || currentParagraph.includes('**ASTERI PARTNERS**');
        
        if (isSignatureContent) {
          currentParagraph += '\n' + trimmedLine;
        } else {
          currentParagraph += ' ' + trimmedLine;
        }
      } else {
        currentParagraph = trimmedLine;
      }
    }

    // Flush any remaining content
    this.flushContent(blocks, currentParagraph, listItems, listItemLevels, tableRows, inList, inTable);

    return blocks;
  }

  private static flushContent(
    blocks: ProcessedBlock[],
    paragraph: string,
    listItems: string[],
    listItemLevels: number[],
    tableRows: string[][],
    inList: boolean,
    inTable: boolean
  ) {
    if (inList && listItems.length > 0) {
      blocks.push({
        type: 'list',
        content: '',
        items: [...listItems],
        itemLevels: [...listItemLevels],
        originalText: listItems.map((item, index) => {
          const indent = '  '.repeat(listItemLevels[index] || 0);
          return `${indent}- ${item}`;
        }).join('\n')
      });
    }
    
    if (inTable && tableRows.length > 0) {
      console.log('Creating table block with', tableRows.length, 'rows:', tableRows);
      blocks.push({
        type: 'table',
        content: '',
        rows: tableRows.map(row => [...row]),
        originalText: tableRows.map(row => `| ${row.join(' | ')} |`).join('\n')
      });
    }
    
    if (paragraph.trim()) {
      // Check for bold text patterns
      if (paragraph.includes('**')) {
        blocks.push({
          type: 'bold_text',
          content: paragraph.trim(),
          originalText: paragraph.trim()
        });
      } else {
        blocks.push({
          type: 'paragraph',
          content: paragraph.trim(),
          originalText: paragraph.trim()
        });
      }
    }
  }

  /**
   * Extract bold text patterns from content
   */
  static extractBoldText(text: string): Array<{ text: string; bold: boolean }> {
    const parts: Array<{ text: string; bold: boolean }> = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ text: beforeText, bold: false });
        }
      }
      
      // Add bold text
      parts.push({ text: match[1], bold: true });
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText) {
        parts.push({ text: remainingText, bold: false });
      }
    }
    
    // If no bold patterns found, return the whole text as non-bold
    if (parts.length === 0) {
      parts.push({ text: text, bold: false });
    }
    
    return parts;
  }
}