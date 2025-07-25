export interface CompanyInfo {
  name: string;
  website?: string;
  logoUrl?: string;
  description: string;
}

export interface ProjectInfo {
  title: string;
  serviceDescription: string;
  annualBudget?: string;
  targetGeo?: string;
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  status: 'idle' | 'generating' | 'success' | 'modified' | 'error';
  errorMessage?: string;
}

export interface ProposalConfig {
  yourCompany: CompanyInfo;
  clientCompany: CompanyInfo;
  project: ProjectInfo;
  sections: string[];
  isConfigurationComplete: boolean;
}

export interface SectionPrompt {
  sectionTitle: string;
  customPrompt?: string;
  exampleContent?: string;
  isDefault: boolean;
}

export interface AISettings {
  useSystemKeys: boolean;
  openaiApiKey?: string;
  geminiApiKey?: string;
  autoSave: boolean;
  showProgress: boolean;
  sectionPrompts: SectionPrompt[];
  fallbackPrompt: string;
}

export interface ProposalState {
  config: ProposalConfig;
  sections: ProposalSection[];
  settings: AISettings;
  activeTab: 'configuration' | 'generator' | 'settings';
  isGenerating: boolean;
}
