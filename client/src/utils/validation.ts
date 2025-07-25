import { z } from 'zod';

// Flexible URL validation that accepts any text input
const flexibleUrl = z.string().optional().refine((val) => {
  if (!val || val.trim() === '') return true;
  // Accept any non-empty string as a valid website
  return val.trim().length > 0;
}, { message: 'Website cannot be empty if provided' });

export const companyInfoSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: flexibleUrl,
  logoUrl: flexibleUrl,
  description: z.string().min(1, 'Description is required')
});

export const projectInfoSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  serviceDescription: z.string().min(1, 'Service description is required'),
  annualBudget: z.string().optional(),
  targetGeo: z.string().optional()
});

export const configurationSchema = z.object({
  yourCompany: companyInfoSchema,
  clientCompany: companyInfoSchema, // Now required like yourCompany
  project: projectInfoSchema,
  sections: z.array(z.string()).min(1, 'At least one section is required')
});

export const aiSettingsSchema = z.object({
  useSystemKeys: z.boolean(),
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  autoSave: z.boolean(),
  showProgress: z.boolean()
});

export function validateConfiguration(data: any) {
  try {
    return configurationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.errors };
    }
    throw error;
  }
}
