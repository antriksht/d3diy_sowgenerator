import { CompanyInfo, ProjectInfo } from '../types/proposal';

export function populatePromptTemplate(
  template: string,
  yourCompany?: CompanyInfo,
  clientCompany?: CompanyInfo,
  project?: ProjectInfo,
  sectionTitle?: string
): string {
  let populatedPrompt = template;

  // Replace all template variables with actual values
  populatedPrompt = populatedPrompt.replace(/{sectionTitle}/g, sectionTitle || '[Section Title]');
  
  // Your company variables
  populatedPrompt = populatedPrompt.replace(/{yourCompany\.name}/g, yourCompany?.name || '[Your Company Name]');
  populatedPrompt = populatedPrompt.replace(/{yourCompany\.description}/g, yourCompany?.description || '[Your Company Description]');
  populatedPrompt = populatedPrompt.replace(/{yourCompany\.website}/g, yourCompany?.website || '[Your Company Website]');
  
  // Client company variables
  populatedPrompt = populatedPrompt.replace(/{clientCompany\.name}/g, clientCompany?.name || '[Client Company Name]');
  populatedPrompt = populatedPrompt.replace(/{clientCompany\.description}/g, clientCompany?.description || '[Client Company Description]');
  populatedPrompt = populatedPrompt.replace(/{clientCompany\.website}/g, clientCompany?.website || '[Client Company Website]');
  
  // Project variables
  populatedPrompt = populatedPrompt.replace(/{project\.title}/g, project?.title || '[Project Title]');
  populatedPrompt = populatedPrompt.replace(/{project\.serviceDescription}/g, project?.serviceDescription || '[Service Description]');
  
  // Handle conditional template expressions
  populatedPrompt = populatedPrompt.replace(
    /{project\.annualBudget \? `Annual Project Budget: \${project\.annualBudget}` : ''}/g,
    project?.annualBudget ? `Annual Project Budget: ${project.annualBudget}` : ''
  );
  
  populatedPrompt = populatedPrompt.replace(
    /{project\.targetGeo \? `Target Geographic Area: \${project\.targetGeo}` : ''}/g,
    project?.targetGeo ? `Target Geographic Area: ${project.targetGeo}` : ''
  );

  return populatedPrompt;
}

export function extractTemplateFromPopulated(
  populatedPrompt: string,
  yourCompany?: CompanyInfo,
  clientCompany?: CompanyInfo,
  project?: ProjectInfo,
  sectionTitle?: string
): string {
  let template = populatedPrompt;

  // Replace actual values back with template variables
  if (sectionTitle) {
    template = template.replace(new RegExp(escapeRegExp(sectionTitle), 'g'), '{sectionTitle}');
  }
  
  // Your company variables
  if (yourCompany?.name) {
    template = template.replace(new RegExp(escapeRegExp(yourCompany.name), 'g'), '{yourCompany.name}');
  }
  if (yourCompany?.description) {
    template = template.replace(new RegExp(escapeRegExp(yourCompany.description), 'g'), '{yourCompany.description}');
  }
  if (yourCompany?.website) {
    template = template.replace(new RegExp(escapeRegExp(yourCompany.website), 'g'), '{yourCompany.website}');
  }
  
  // Client company variables
  if (clientCompany?.name) {
    template = template.replace(new RegExp(escapeRegExp(clientCompany.name), 'g'), '{clientCompany.name}');
  }
  if (clientCompany?.description) {
    template = template.replace(new RegExp(escapeRegExp(clientCompany.description), 'g'), '{clientCompany.description}');
  }
  if (clientCompany?.website) {
    template = template.replace(new RegExp(escapeRegExp(clientCompany.website), 'g'), '{clientCompany.website}');
  }
  
  // Project variables
  if (project?.title) {
    template = template.replace(new RegExp(escapeRegExp(project.title), 'g'), '{project.title}');
  }
  if (project?.serviceDescription) {
    template = template.replace(new RegExp(escapeRegExp(project.serviceDescription), 'g'), '{project.serviceDescription}');
  }
  
  // Handle conditional expressions
  if (project?.annualBudget) {
    template = template.replace(
      new RegExp(escapeRegExp(`Annual Project Budget: ${project.annualBudget}`), 'g'),
      '{project.annualBudget ? `Annual Project Budget: ${project.annualBudget}` : \'\'}'
    );
  }
  
  if (project?.targetGeo) {
    template = template.replace(
      new RegExp(escapeRegExp(`Target Geographic Area: ${project.targetGeo}`), 'g'),
      '{project.targetGeo ? `Target Geographic Area: ${project.targetGeo}` : \'\'}'
    );
  }

  return template;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}