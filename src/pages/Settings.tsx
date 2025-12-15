import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Users, Bell, Save, FileSpreadsheet, Target, Upload, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Settings = () => {
  const { toast } = useToast();

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    senderEmail: 'noreply@vedavi.com',
    senderPassword: '',
    enableNotifications: true,
    notifyOnAssignment: true,
    notifyOnStageChange: false,
  });

  // Lead assignment settings
  const [leadSettings, setLeadSettings] = useState({
    autoAssign: true,
    roundRobin: true,
    defaultStage: 'new',
    defaultCallType: 'outbound',
    defaultFollowUpHours: 24,
  });

  // Integration settings
  const [integrations, setIntegrations] = useState({
    googleSheets: { connected: false, sheetUrl: '', lastSync: null as string | null },
    metaAds: { connected: false, accessToken: '', adAccountId: '', lastSync: null as string | null },
    googleAds: { connected: false, customerId: '', developerToken: '', lastSync: null as string | null },
  });

  const [isImporting, setIsImporting] = useState<string | null>(null);

  const handleSaveEmailSettings = () => {
    toast({ title: 'Settings saved', description: 'Email notification settings have been updated' });
  };

  const handleSaveLeadSettings = () => {
    toast({ title: 'Settings saved', description: 'Lead assignment settings have been updated' });
  };

  const handleSaveIntegration = (integration: string) => {
    toast({ title: 'Integration saved', description: `${integration} configuration has been saved` });
  };

  const handleImportLeads = async (source: string) => {
    setIsImporting(source);
    
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const now = new Date().toLocaleString();
    
    if (source === 'googleSheets') {
      setIntegrations(prev => ({
        ...prev,
        googleSheets: { ...prev.googleSheets, connected: true, lastSync: now }
      }));
    } else if (source === 'metaAds') {
      setIntegrations(prev => ({
        ...prev,
        metaAds: { ...prev.metaAds, connected: true, lastSync: now }
      }));
    } else if (source === 'googleAds') {
      setIntegrations(prev => ({
        ...prev,
        googleAds: { ...prev.googleAds, connected: true, lastSync: now }
      }));
    }
    
    setIsImporting(null);
    toast({ 
      title: 'Import complete', 
      description: `Successfully imported leads from ${source === 'googleSheets' ? 'Google Sheets' : source === 'metaAds' ? 'Meta Ads' : 'Google Ads'}` 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your CRM preferences</p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="integrations" className="gap-2">
            <Link2 className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <Users className="w-4 h-4" />
            Lead Assignment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <div className="grid gap-6">
            {/* Google Sheets */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <FileSpreadsheet className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="font-display">Google Sheets</CardTitle>
                      <CardDescription>Import leads from a Google Spreadsheet</CardDescription>
                    </div>
                  </div>
                  <Badge variant={integrations.googleSheets.connected ? "default" : "secondary"}>
                    {integrations.googleSheets.connected ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Not Connected</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sheet-url">Google Sheet URL</Label>
                  <Input
                    id="sheet-url"
                    value={integrations.googleSheets.sheetUrl}
                    onChange={(e) => setIntegrations(prev => ({
                      ...prev,
                      googleSheets: { ...prev.googleSheets, sheetUrl: e.target.value }
                    }))}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                  />
                  <p className="text-xs text-muted-foreground">Make sure the sheet is shared publicly or with view access</p>
                </div>
                {integrations.googleSheets.lastSync && (
                  <p className="text-sm text-muted-foreground">Last import: {integrations.googleSheets.lastSync}</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveIntegration('Google Sheets')}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    className="btn-gradient-primary"
                    onClick={() => handleImportLeads('googleSheets')}
                    disabled={!integrations.googleSheets.sheetUrl || isImporting === 'googleSheets'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting === 'googleSheets' ? 'Importing...' : 'Import Leads'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Meta Ads */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Target className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="font-display">Meta Ads (Facebook/Instagram)</CardTitle>
                      <CardDescription>Import leads from Facebook Lead Ads</CardDescription>
                    </div>
                  </div>
                  <Badge variant={integrations.metaAds.connected ? "default" : "secondary"}>
                    {integrations.metaAds.connected ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Not Connected</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta-token">Access Token</Label>
                    <Input
                      id="meta-token"
                      type="password"
                      value={integrations.metaAds.accessToken}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        metaAds: { ...prev.metaAds, accessToken: e.target.value }
                      }))}
                      placeholder="Your Meta access token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ad-account">Ad Account ID</Label>
                    <Input
                      id="ad-account"
                      value={integrations.metaAds.adAccountId}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        metaAds: { ...prev.metaAds, adAccountId: e.target.value }
                      }))}
                      placeholder="act_123456789"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your access token from <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Meta Graph API Explorer</a>
                </p>
                {integrations.metaAds.lastSync && (
                  <p className="text-sm text-muted-foreground">Last import: {integrations.metaAds.lastSync}</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveIntegration('Meta Ads')}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    className="btn-gradient-primary"
                    onClick={() => handleImportLeads('metaAds')}
                    disabled={!integrations.metaAds.accessToken || !integrations.metaAds.adAccountId || isImporting === 'metaAds'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting === 'metaAds' ? 'Importing...' : 'Import Leads'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Google Ads */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Target className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="font-display">Google Ads</CardTitle>
                      <CardDescription>Import leads from Google Ads campaigns</CardDescription>
                    </div>
                  </div>
                  <Badge variant={integrations.googleAds.connected ? "default" : "secondary"}>
                    {integrations.googleAds.connected ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Not Connected</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="google-customer-id">Customer ID</Label>
                    <Input
                      id="google-customer-id"
                      value={integrations.googleAds.customerId}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        googleAds: { ...prev.googleAds, customerId: e.target.value }
                      }))}
                      placeholder="123-456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="developer-token">Developer Token</Label>
                    <Input
                      id="developer-token"
                      type="password"
                      value={integrations.googleAds.developerToken}
                      onChange={(e) => setIntegrations(prev => ({
                        ...prev,
                        googleAds: { ...prev.googleAds, developerToken: e.target.value }
                      }))}
                      placeholder="Your developer token"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your credentials from <a href="https://ads.google.com/aw/apicenter" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Ads API Center</a>
                </p>
                {integrations.googleAds.lastSync && (
                  <p className="text-sm text-muted-foreground">Last import: {integrations.googleAds.lastSync}</p>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSaveIntegration('Google Ads')}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    className="btn-gradient-primary"
                    onClick={() => handleImportLeads('googleAds')}
                    disabled={!integrations.googleAds.customerId || !integrations.googleAds.developerToken || isImporting === 'googleAds'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isImporting === 'googleAds' ? 'Importing...' : 'Import Leads'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for sending email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">SMTP Server</Label>
                  <Input
                    id="smtp-server"
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input
                    id="smtp-port"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-email">Sender Email</Label>
                  <Input
                    id="sender-email"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                    placeholder="noreply@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender-password">Sender Password</Label>
                  <Input
                    id="sender-password"
                    type="password"
                    value={emailSettings.senderPassword}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, senderPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Email Triggers</h4>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Enable Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send automated emails for important events</p>
                  </div>
                  <Switch
                    checked={emailSettings.enableNotifications}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, enableNotifications: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Notify on Lead Assignment</p>
                    <p className="text-sm text-muted-foreground">Email caller when a new lead is assigned</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnAssignment}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, notifyOnAssignment: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Notify on Stage Change</p>
                    <p className="text-sm text-muted-foreground">Email when lead stage is updated</p>
                  </div>
                  <Switch
                    checked={emailSettings.notifyOnStageChange}
                    onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, notifyOnStageChange: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="btn-gradient-primary gap-2" onClick={handleSaveEmailSettings}>
                  <Save className="w-4 h-4" />
                  Save Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Assignment Settings */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Lead Assignment Rules
              </CardTitle>
              <CardDescription>
                Configure how new leads are distributed to your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Auto-assign New Leads</p>
                    <p className="text-sm text-muted-foreground">Automatically assign incoming leads to callers</p>
                  </div>
                  <Switch
                    checked={leadSettings.autoAssign}
                    onCheckedChange={(checked) => setLeadSettings(prev => ({ ...prev, autoAssign: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">Round-robin Assignment</p>
                    <p className="text-sm text-muted-foreground">Distribute leads evenly among active callers</p>
                  </div>
                  <Switch
                    checked={leadSettings.roundRobin}
                    onCheckedChange={(checked) => setLeadSettings(prev => ({ ...prev, roundRobin: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Lead Stage</Label>
                  <Select 
                    value={leadSettings.defaultStage}
                    onValueChange={(value) => setLeadSettings(prev => ({ ...prev, defaultStage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Lead</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Call Type</Label>
                  <Select 
                    value={leadSettings.defaultCallType}
                    onValueChange={(value) => setLeadSettings(prev => ({ ...prev, defaultCallType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Follow-up Time (hours)</Label>
                  <Input
                    type="number"
                    value={leadSettings.defaultFollowUpHours}
                    onChange={(e) => setLeadSettings(prev => ({ ...prev, defaultFollowUpHours: parseInt(e.target.value) || 24 }))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="btn-gradient-primary gap-2" onClick={handleSaveLeadSettings}>
                  <Save className="w-4 h-4" />
                  Save Lead Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage your in-app notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Browser Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Follow-up Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified before scheduled follow-ups</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">New Lead Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when new leads arrive</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">Deal Won Celebrations</p>
                  <p className="text-sm text-muted-foreground">Celebrate when deals are closed</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
