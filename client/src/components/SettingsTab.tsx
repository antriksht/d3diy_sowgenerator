import React from 'react';
import { Key, Sliders, Database, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AISettings } from '../types/proposal';

interface SettingsTabProps {
  settings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
  onSaveSettings: () => void;
  onClearStorage: () => void;
  lastSaved?: string;
}

export function SettingsTab({
  settings,
  onSettingsChange,
  onSaveSettings,
  onClearStorage,
  lastSaved
}: SettingsTabProps) {
  const [showOpenAIKey, setShowOpenAIKey] = React.useState(false);
  const [showGeminiKey, setShowGeminiKey] = React.useState(false);

  const updateSetting = (key: keyof AISettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Configure API keys and generation preferences.</p>
      </div>

      {/* API Configuration */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Key className="h-5 w-5 mr-2 text-primary" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Keys Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-gray-900">Use System Keys</h4>
              <p className="text-sm text-gray-600">Use pre-configured API keys (recommended)</p>
            </div>
            <Switch
              checked={settings.useSystemKeys}
              onCheckedChange={(checked) => updateSetting('useSystemKeys', checked)}
            />
          </div>

          {/* Custom API Keys */}
          <div className={`space-y-4 transition-opacity ${settings.useSystemKeys ? 'opacity-50' : ''}`}>
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenAIKey ? 'text' : 'password'}
                  value={settings.openaiApiKey || ''}
                  onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                  placeholder="sk-..."
                  disabled={settings.useSystemKeys}
                  className="form-input pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                  disabled={settings.useSystemKeys}
                >
                  {showOpenAIKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
                  placeholder="AI..."
                  disabled={settings.useSystemKeys}
                  className="form-input pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  disabled={settings.useSystemKeys}
                >
                  {showGeminiKey ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Preferences */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Sliders className="h-5 w-5 mr-2 text-primary" />
            Generation Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-save to localStorage</h4>
              <p className="text-sm text-gray-600">Automatically save progress locally</p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => updateSetting('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Show generation progress</h4>
              <p className="text-sm text-gray-600">Display real-time progress during AI generation</p>
            </div>
            <Switch
              checked={settings.showProgress}
              onCheckedChange={(checked) => updateSetting('showProgress', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Storage Management */}
      <Card className="glass-morphism border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Database className="h-5 w-5 mr-2 text-primary" />
            Storage Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Current Project Data</h4>
                <p className="text-sm text-gray-600">
                  Last saved: {lastSaved || 'Never'}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={onSaveSettings}
                  size="sm"
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={onClearStorage}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button
          onClick={onSaveSettings}
          size="lg"
          className="btn-primary"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
