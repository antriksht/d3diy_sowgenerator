import React from 'react';
import { Building, Handshake, FolderOpen, List, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProposalConfig } from '../types/proposal';

interface ConfigurationTabProps {
  config: ProposalConfig;
  onConfigChange: (config: ProposalConfig) => void;
  onStartGeneration: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
  isLocked?: boolean;
}

export function ConfigurationTab({ 
  config, 
  onConfigChange, 
  onStartGeneration, 
  isValid,
  validationErrors,
  isLocked = false
}: ConfigurationTabProps) {
  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onConfigChange(newConfig);
  };

  const updateSections = (value: string) => {
    const sections = value.split('\n').filter(line => line.trim() !== '');
    updateConfig('sections', sections);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Project Configuration</h2>
        <p className="text-gray-600">Set up your company information, client details, and project specifications.</p>
        {isLocked && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✓ Configuration Locked - Ready for Generation</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Company */}
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <Building className="h-5 w-5 mr-2 text-primary" />
              Your Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="your-company-name">Company Name *</Label>
              <Input
                id="your-company-name"
                value={config.yourCompany.name}
                onChange={(e) => updateConfig('yourCompany.name', e.target.value)}
                placeholder="D3 Alpha Digital Agency"
                className="form-input"
                disabled={isLocked}
              />
              {validationErrors['yourCompany.name'] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors['yourCompany.name']}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="your-company-website">Website</Label>
              <Input
                id="your-company-website"
                type="url"
                value={config.yourCompany.website || ''}
                onChange={(e) => updateConfig('yourCompany.website', e.target.value)}
                placeholder="https://d3alpha.com"
                className="form-input"
                disabled={isLocked}
              />
            </div>
            
            <div>
              <Label htmlFor="your-company-logo">Logo URL</Label>
              <Input
                id="your-company-logo"
                type="url"
                value={config.yourCompany.logoUrl || ''}
                onChange={(e) => updateConfig('yourCompany.logoUrl', e.target.value)}
                placeholder="https://d3alpha.com/logo.png"
                className="form-input"
                disabled={isLocked}
              />
            </div>
            
            <div>
              <Label htmlFor="your-company-description">Short Description *</Label>
              <Textarea
                id="your-company-description"
                value={config.yourCompany.description}
                onChange={(e) => updateConfig('yourCompany.description', e.target.value)}
                placeholder="Brief description of your company and services"
                className="form-input resize-none"
                rows={3}
                disabled={isLocked}
              />
              {validationErrors['yourCompany.description'] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors['yourCompany.description']}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Company */}
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
              <Handshake className="h-5 w-5 mr-2 text-primary" />
              Client Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client-company-name">Client Name *</Label>
              <Input
                id="client-company-name"
                value={config.clientCompany.name}
                onChange={(e) => updateConfig('clientCompany.name', e.target.value)}
                placeholder="Walmart Inc."
                className="form-input"
                disabled={isLocked}
              />
              {validationErrors['clientCompany.name'] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors['clientCompany.name']}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="client-company-website">Website</Label>
              <Input
                id="client-company-website"
                type="url"
                value={config.clientCompany.website || ''}
                onChange={(e) => updateConfig('clientCompany.website', e.target.value)}
                placeholder="https://walmart.com"
                className="form-input"
                disabled={isLocked}
              />
            </div>
            
            <div>
              <Label htmlFor="client-company-logo">Logo URL</Label>
              <Input
                id="client-company-logo"
                type="url"
                value={config.clientCompany.logoUrl || ''}
                onChange={(e) => updateConfig('clientCompany.logoUrl', e.target.value)}
                placeholder="https://walmart.com/logo.png"
                className="form-input"
                disabled={isLocked}
              />
            </div>
            
            <div>
              <Label htmlFor="client-company-description">Short Description *</Label>
              <Textarea
                id="client-company-description"
                value={config.clientCompany.description || ''}
                onChange={(e) => updateConfig('clientCompany.description', e.target.value)}
                placeholder="Brief description of the client company"
                className="form-input resize-none"
                rows={3}
                disabled={isLocked}
              />
              {validationErrors['clientCompany.description'] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors['clientCompany.description']}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <FolderOpen className="h-5 w-5 mr-2 text-primary" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="project-title">Project Title *</Label>
              <Input
                id="project-title"
                value={config.project.title}
                onChange={(e) => updateConfig('project.title', e.target.value)}
                placeholder="Consolidated Digital Growth"
                className="form-input"
                disabled={isLocked}
              />
              {validationErrors['project.title'] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors['project.title']}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="project-service">Service Description *</Label>
              <Textarea
                id="project-service"
                value={config.project.serviceDescription}
                onChange={(e) => updateConfig('project.serviceDescription', e.target.value)}
                placeholder="Comprehensive e-commerce optimization and digital marketing services"
                className="form-input resize-none"
                rows={3}
                disabled={isLocked}
              />
              {validationErrors['project.serviceDescription'] && (
                <p className="text-sm text-red-600 mt-1">{validationErrors['project.serviceDescription']}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section List */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <List className="h-5 w-5 mr-2 text-primary" />
            Proposal Sections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="section-list">Section List (one per line)</Label>
            <Textarea
              id="section-list"
              value={config.sections.join('\n')}
              onChange={(e) => updateSections(e.target.value)}
              className="form-input resize-none font-mono text-sm"
              rows={12}
              placeholder="Enter each section on a new line..."
              disabled={isLocked}
            />
            <p className="text-sm text-gray-500 mt-2">
              Total sections: {config.sections.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Start Generation Button */}
      <div className="flex justify-center">
        <Button
          onClick={onStartGeneration}
          disabled={!isValid || isLocked}
          size="lg"
          className="btn-primary px-8 py-4 text-lg"
        >
          <Play className="h-5 w-5 mr-2" />
          {isLocked ? 'Configuration Locked' : 'Start Generating'}
        </Button>
      </div>
    </div>
  );
}
