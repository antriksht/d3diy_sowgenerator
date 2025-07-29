import { CompanyInfo, ProjectInfo } from "../types/proposal";

interface AIGenerationOptions {
  sectionTitle: string;
  yourCompany: CompanyInfo;
  clientCompany: CompanyInfo;
  project: ProjectInfo;
  useSystemKeys?: boolean;
  openaiApiKey?: string;
  geminiApiKey?: string;
  customPrompt?: string;
  sectionExample?: string;
  signal?: AbortSignal;
}

export class AIService {
  async generateSection(options: AIGenerationOptions): Promise<string> {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: options.signal,
        body: JSON.stringify({
          sectionTitle: options.sectionTitle,
          yourCompany: options.yourCompany,
          clientCompany: options.clientCompany,
          project: options.project,
          useSystemKeys: options.useSystemKeys ?? true,
          openaiApiKey: options.openaiApiKey,
          geminiApiKey: options.geminiApiKey,
          customPrompt: options.customPrompt,
          sectionExample: options.sectionExample,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred during content generation');
    }
  }
}

export const aiService = new AIService();
