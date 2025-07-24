import { CompanyInfo, ProjectInfo } from '../types/proposal';

interface AIGenerationOptions {
  sectionTitle: string;
  yourCompany: CompanyInfo;
  clientCompany: CompanyInfo;
  project: ProjectInfo;
  openaiApiKey?: string;
  geminiApiKey?: string;
}

// Use environment variables directly - they should be available in the browser
// if the server passes them through or they're set with VITE_ prefix
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';

export class AIService {
  private async generateWithOpenAI(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: 'You are a professional business proposal writer. Generate well-structured, professional content for Statement of Work documents. Use appropriate formatting, bullet points, and tables where relevant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async generateWithGemini(prompt: string, apiKey: string): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  private createPrompt(options: AIGenerationOptions): string {
    const { sectionTitle, yourCompany, clientCompany, project } = options;
    
    const baseContext = `
Your Company: ${yourCompany.name}
${yourCompany.description}
Website: ${yourCompany.website || 'Not provided'}

Client Company: ${clientCompany.name}
${clientCompany.description || 'Not provided'}
Website: ${clientCompany.website || 'Not provided'}

Project: ${project.title}
Service Description: ${project.serviceDescription}
`;

    const sectionPrompts: Record<string, string> = {
      'Introduction': `Generate a professional introduction section for this SOW. Include:
- Brief overview of your company's experience and expertise
- Introduction to the client company
- Overview of the project and its objectives
- Professional tone suitable for business stakeholders`,

      'Definitions and Acronyms': `Create a definitions and acronyms table in markdown format. Include common business terms like:
- Client (referring to ${clientCompany.name})
- Your company abbreviation
- CR (Change Request)
- SH (Stakeholder)
- SLA (Service Level Agreement)
- Any relevant industry-specific acronyms based on the service description`,

      'Scope of Work': `Detail the scope of work including:
- Strategic planning and analysis activities
- Specific services and deliverables
- Channels and platforms included
- Phases or milestones if applicable
- Clear boundaries of what will be delivered`,

      'Deliverables': `Create a structured deliverables table with columns:
- S.No
- Category
- Deliverable Summary
- Owner
Base the deliverables on the service description provided.`,

      'Timelines': `Provide a realistic project timeline including:
- Project phases
- Key milestones
- Estimated durations
- Dependencies and critical path items`,

      'Assumptions': `List key project assumptions including:
- Client responsibilities and commitments
- Resource availability
- System access requirements
- Approval processes and timelines`,

      'Exclusions': `Clearly state what is excluded from this engagement:
- Services not covered
- Platforms or channels not included
- Client responsibilities
- Additional costs not covered in base fee`,

      'Commercials / Pricing': `Present the commercial structure:
- Fee structure (monthly retainer, project-based, etc.)
- Payment terms and schedule
- Additional costs or expenses
- Billing and invoicing details`,

      'Change Control': `Outline the change control process:
- How changes will be requested and approved
- Impact assessment procedures
- Additional cost implications
- Timeline adjustments`,

      'Contact Details': `Provide contact information structure:
- Key contacts from your company
- Roles and responsibilities
- Communication protocols
- Escalation procedures`,

      'Terms & Conditions': `Include standard terms and conditions:
- Intellectual property rights
- Confidentiality agreements
- Liability limitations
- Termination clauses`,

      'Acceptance & Signature': `Create signature block for:
- Client acceptance
- Your company representative
- Date fields
- Terms of acceptance`
    };

    const sectionPrompt = sectionPrompts[sectionTitle] || `Generate professional content for the "${sectionTitle}" section of this Statement of Work.`;

    return `${baseContext}\n\nSection: ${sectionTitle}\n\n${sectionPrompt}`;
  }

  async generateSection(options: AIGenerationOptions): Promise<string> {
    const prompt = this.createPrompt(options);
    const userOpenAIKey = options.openaiApiKey;
    const userGeminiKey = options.geminiApiKey;

    // Try OpenAI first (2 attempts)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const apiKey = userOpenAIKey || OPENAI_API_KEY;
        if (apiKey) {
          return await this.generateWithOpenAI(prompt, apiKey);
        }
      } catch (error) {
        console.error(`OpenAI attempt ${attempt} failed:`, error);
        if (attempt === 2) {
          console.log('OpenAI attempts exhausted, trying Gemini...');
        }
      }
    }

    // Try Gemini as fallback (2 attempts)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const apiKey = userGeminiKey || GEMINI_API_KEY;
        if (apiKey) {
          return await this.generateWithGemini(prompt, apiKey);
        }
      } catch (error) {
        console.error(`Gemini attempt ${attempt} failed:`, error);
        if (attempt === 2) {
          throw new Error('All AI generation attempts failed. Please check your API keys and try again.');
        }
      }
    }

    throw new Error('No API keys available for content generation.');
  }
}

export const aiService = new AIService();
