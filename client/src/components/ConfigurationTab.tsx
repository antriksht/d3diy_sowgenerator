import React from 'react';
import { Building, Handshake, FolderOpen, List, Play, Unlock } from 'lucide-react';
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
  onUnlockConfiguration: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
  isLocked?: boolean;
}

export function ConfigurationTab({ 
  config, 
  onConfigChange, 
  onStartGeneration, 
  onUnlockConfiguration,
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
    <div className="space-y-8">
      {/* Status Header */}
      {isLocked && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-800 font-semibold">Configuration Locked & Ready for Generation</p>
            </div>
            <Button
              onClick={onUnlockConfiguration}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Unlock Configuration
            </Button>
          </div>
          <p className="text-sm text-orange-600 mt-2 ml-7">
            ⚠️ Warning: Unlocking will delete all generated content in Section Generator
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Company */}
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-[#E9204F]/5 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-[#E9204F] to-[#C41E3A] rounded-lg flex items-center justify-center mr-3">
                <Building className="h-4 w-4 text-white" />
              </div>
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
        <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent">
            <CardTitle className="flex items-center text-xl font-bold text-gray-900">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Handshake className="h-4 w-4 text-white" />
              </div>
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
      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent">
          <CardTitle className="flex items-center text-xl font-bold text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <FolderOpen className="h-4 w-4 text-white" />
            </div>
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                <Label htmlFor="annual-budget">Annual Project Budget</Label>
                <Input
                  id="annual-budget"
                  value={config.project.annualBudget || ''}
                  onChange={(e) => updateConfig('project.annualBudget', e.target.value)}
                  placeholder="e.g., $50,000 - $100,000"
                  className="form-input"
                  disabled={isLocked}
                />
              </div>
              
              <div>
                <Label htmlFor="target-geo">Target GEO (Optional)</Label>
                <Input
                  id="target-geo"
                  value={config.project.targetGeo || ''}
                  onChange={(e) => updateConfig('project.targetGeo', e.target.value)}
                  placeholder="e.g., North America, Global, EMEA"
                  className="form-input"
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
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

              <div>
                <Label htmlFor="target-geo">Target Geography (Optional)</Label>
                <Input
                  id="target-geo"
                  value={config.project.targetGeo || ''}
                  onChange={(e) => updateConfig('project.targetGeo', e.target.value)}
                  placeholder="e.g., United States, Europe, Global"
                  className="form-input"
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section List */}
      <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-transparent">
          <CardTitle className="flex items-center text-xl font-bold text-gray-900">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <List className="h-4 w-4 text-white" />
            </div>
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
      {!isLocked && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={onStartGeneration}
            disabled={!isValid}
            size="lg"
            className="bg-gradient-to-r from-[#E9204F] to-[#C41E3A] hover:from-[#C41E3A] hover:to-[#A01830] text-white px-12 py-4 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Play className="h-3 w-3 text-white" />
              </div>
              <span>Start Generating Proposal</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
