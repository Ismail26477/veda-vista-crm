import { useState } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StageBadge, PriorityBadge, StatusBadge } from '@/components/ui/stage-badge';
import { Lead, CallLog, Activity, LeadStage, LeadPriority } from '@/types/crm';
import { leadSourceLabels, leadCategoryLabels, mockCallLogs, mockActivities as allActivities } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import {
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Clock,
  IndianRupee,
  User,
  MessageSquare,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  History,
  Plus,
  Save,
  X,
  FileText,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

export function LeadDetailDrawer({ lead, open, onOpenChange, onUpdateLead }: LeadDetailDrawerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isLoggingCall, setIsLoggingCall] = useState(false);
  const [callForm, setCallForm] = useState({
    type: 'outbound' as 'inbound' | 'outbound',
    duration: '',
    notes: '',
    nextFollowUp: '',
  });

  if (!lead) return null;

  // Get activities and calls for this lead
  const leadActivities = allActivities.filter(a => a.leadId === lead.id);
  const leadCalls = mockCallLogs.filter(c => c.leadId === lead.id);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    return `₹${value.toLocaleString()}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const updatedLead = {
      ...lead,
      notes: lead.notes ? `${lead.notes}\n\n[${format(new Date(), 'dd MMM yyyy, HH:mm')}]\n${newNote}` : `[${format(new Date(), 'dd MMM yyyy, HH:mm')}]\n${newNote}`,
      updatedAt: new Date().toISOString(),
    };
    
    onUpdateLead(updatedLead);
    setNewNote('');
    setIsAddingNote(false);
    toast({ title: 'Note added', description: 'Your note has been saved to the lead' });
  };

  const handleLogCall = () => {
    if (!callForm.duration || !callForm.notes) {
      toast({ title: 'Missing fields', description: 'Please fill in duration and notes', variant: 'destructive' });
      return;
    }

    // In a real app, this would save to the database
    const updatedLead = {
      ...lead,
      nextFollowUp: callForm.nextFollowUp || lead.nextFollowUp,
      updatedAt: new Date().toISOString(),
    };
    
    onUpdateLead(updatedLead);
    setCallForm({ type: 'outbound', duration: '', notes: '', nextFollowUp: '' });
    setIsLoggingCall(false);
    toast({ title: 'Call logged', description: 'Call has been recorded successfully' });
  };

  const handleStageChange = (newStage: LeadStage) => {
    onUpdateLead({ ...lead, stage: newStage, updatedAt: new Date().toISOString() });
    toast({ title: 'Stage updated', description: `Lead stage changed to ${newStage}` });
  };

  const handlePriorityChange = (newPriority: LeadPriority) => {
    onUpdateLead({ ...lead, priority: newPriority, updatedAt: new Date().toISOString() });
    toast({ title: 'Priority updated', description: `Lead priority changed to ${newPriority}` });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-xl font-semibold text-accent-foreground">{lead.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-display">{lead.name}</SheetTitle>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                {lead.city}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StageBadge stage={lead.stage} size="sm" />
                <PriorityBadge priority={lead.priority} size="sm" />
                <StatusBadge status={lead.status} size="sm" />
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-6 mt-4 grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 py-4">
            {/* Details Tab */}
            <TabsContent value="details" className="mt-0 space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-foreground hover:text-primary transition-colors">
                      {lead.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="text-foreground hover:text-primary transition-colors">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{lead.city}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lead Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Value</p>
                      <p className="font-semibold text-foreground flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        {formatCurrency(lead.value)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Source</p>
                      <p className="text-foreground">{leadSourceLabels[lead.source]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="text-foreground">{leadCategoryLabels[lead.category]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Project</p>
                      <p className="text-foreground">{lead.projectName || '-'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Stage</p>
                        <Select value={lead.stage} onValueChange={handleStageChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New Lead</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Closed Won</SelectItem>
                            <SelectItem value="lost">Closed Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Priority</p>
                        <Select value={lead.priority} onValueChange={handlePriorityChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hot">🔥 Hot</SelectItem>
                            <SelectItem value="warm">☀️ Warm</SelectItem>
                            <SelectItem value="cold">❄️ Cold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Assignment */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{lead.assignedCallerName || 'Unassigned'}</span>
                  </div>
                  {lead.nextFollowUp && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        Next Follow-up: {format(new Date(lead.nextFollowUp), 'dd MMM yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{format(new Date(lead.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-foreground">{format(new Date(lead.updatedAt), 'dd MMM yyyy, HH:mm')}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-0">
              <div className="space-y-4">
                {leadActivities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                    {leadActivities.map((activity, index) => (
                      <div key={activity.id} className="relative pl-10 pb-6">
                        <div className={cn(
                          "absolute left-2.5 w-3 h-3 rounded-full border-2 border-background",
                          activity.type === 'created' && "bg-info",
                          activity.type === 'assigned' && "bg-primary",
                          activity.type === 'stage_changed' && "bg-secondary",
                          activity.type === 'call_logged' && "bg-success",
                          activity.type === 'note_added' && "bg-warning",
                        )} />
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-foreground">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{activity.userName}</span>
                            <span>•</span>
                            <span>{format(new Date(activity.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Calls Tab */}
            <TabsContent value="calls" className="mt-0 space-y-4">
              {/* Log Call Button */}
              {!isLoggingCall && (
                <Button onClick={() => setIsLoggingCall(true)} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Log New Call
                </Button>
              )}

              {/* Log Call Form */}
              {isLoggingCall && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>Log Call</span>
                      <Button variant="ghost" size="icon" onClick={() => setIsLoggingCall(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Call Type</label>
                        <Select value={callForm.type} onValueChange={(v: 'inbound' | 'outbound') => setCallForm(prev => ({ ...prev, type: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="outbound">Outbound</SelectItem>
                            <SelectItem value="inbound">Inbound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Duration (mins)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 15"
                          value={callForm.duration}
                          onChange={(e) => setCallForm(prev => ({ ...prev, duration: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Next Follow-up</label>
                      <Input
                        type="date"
                        value={callForm.nextFollowUp}
                        onChange={(e) => setCallForm(prev => ({ ...prev, nextFollowUp: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                      <Textarea
                        placeholder="What was discussed..."
                        value={callForm.notes}
                        onChange={(e) => setCallForm(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleLogCall} className="w-full gap-2">
                      <Save className="w-4 h-4" />
                      Save Call
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Call History */}
              {leadCalls.length === 0 && !isLoggingCall ? (
                <div className="text-center py-12 text-muted-foreground">
                  <PhoneCall className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No calls logged yet</p>
                </div>
              ) : (
                leadCalls.map((call) => (
                  <Card key={call.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          call.type === 'outbound' ? "bg-info/10" : "bg-success/10"
                        )}>
                          {call.type === 'outbound' ? (
                            <PhoneOutgoing className="w-5 h-5 text-info" />
                          ) : (
                            <PhoneIncoming className="w-5 h-5 text-success" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground capitalize">{call.type} Call</span>
                            <span className="text-sm text-muted-foreground">{formatDuration(call.duration)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{call.notes}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>{call.callerName}</span>
                            <span>•</span>
                            <span>{format(new Date(call.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-0 space-y-4">
              {/* Add Note Button */}
              {!isAddingNote && (
                <Button onClick={() => setIsAddingNote(true)} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              )}

              {/* Add Note Form */}
              {isAddingNote && (
                <Card>
                  <CardContent className="py-4 space-y-3">
                    <Textarea
                      placeholder="Write your note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => { setIsAddingNote(false); setNewNote(''); }}>
                        Cancel
                      </Button>
                      <Button className="flex-1 gap-2" onClick={handleAddNote}>
                        <Save className="w-4 h-4" />
                        Save Note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Notes */}
              {lead.notes ? (
                <Card>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{lead.notes}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : !isAddingNote ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notes added yet</p>
                </div>
              ) : null}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`tel:${lead.phone}`)}>
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\s/g, '')}`)}>
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`mailto:${lead.email}`)}>
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
