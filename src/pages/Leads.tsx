import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Grid3X3, 
  List, 
  Phone, 
  Mail, 
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  MessageCircle,
  Copy,
  Users,
  Flame,
  IndianRupee,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockLeads, mockCallers, leadSourceLabels, leadCategoryLabels } from '@/data/mockData';
import { StageBadge, PriorityBadge, StatusBadge } from '@/components/ui/stage-badge';
import { Lead, LeadStage, LeadPriority } from '@/types/crm';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ImportLeadsDialog } from '@/components/leads/ImportLeadsDialog';

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [callerFilter, setCallerFilter] = useState<string>('all');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

  // Handle imported leads
  const handleImportLeads = (importedLeads: Partial<Lead>[]) => {
    const newLeads = importedLeads.map((lead, idx) => ({
      ...lead,
      id: `imported_${Date.now()}_${idx}`,
      status: lead.status || 'active',
      stage: lead.stage || 'new',
      priority: lead.priority || 'warm',
      category: lead.category || 'india_property',
      value: lead.value || 0,
      source: lead.source || 'other',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) as Lead[];

    setLeads(prev => [...newLeads, ...prev]);
    toast({ 
      title: 'Import successful!', 
      description: `${newLeads.length} leads have been added to your list` 
    });
  };

  // Export leads to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'City', 'Value', 'Source', 'Stage', 'Priority', 'Status', 'Project', 'Assigned To', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.phone}"`,
        `"${lead.email}"`,
        `"${lead.city}"`,
        lead.value,
        leadSourceLabels[lead.source] || lead.source,
        lead.stage,
        lead.priority,
        lead.status,
        `"${lead.projectName || ''}"`,
        `"${lead.assignedCallerName || ''}"`,
        lead.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export complete', description: `${filteredLeads.length} leads exported to CSV` });
  };

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchesCaller = callerFilter === 'all' || lead.assignedCaller === callerFilter;

      return matchesSearch && matchesStage && matchesPriority && matchesCaller;
    });
  }, [leads, searchQuery, stageFilter, priorityFilter, callerFilter]);

  // Stats
  const stats = {
    total: filteredLeads.length,
    newToday: filteredLeads.filter(l => 
      new Date(l.createdAt).toDateString() === new Date().toDateString()
    ).length,
    hot: filteredLeads.filter(l => l.priority === 'hot').length,
    totalValue: filteredLeads.reduce((sum, l) => sum + l.value, 0),
  };

  // Handle stage change
  const handleStageChange = (leadId: string, newStage: LeadStage) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage, updatedAt: new Date().toISOString() } : lead
    ));
    toast({ title: 'Stage updated', description: `Lead stage changed to ${newStage}` });
  };

  // Handle priority change
  const handlePriorityChange = (leadId: string, newPriority: LeadPriority) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, priority: newPriority, updatedAt: new Date().toISOString() } : lead
    ));
    toast({ title: 'Priority updated', description: `Lead priority changed to ${newPriority}` });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    setLeads(prev => prev.filter(l => !selectedLeads.includes(l.id)));
    toast({ title: 'Leads deleted', description: `${selectedLeads.length} leads removed` });
    setSelectedLeads([]);
  };

  // Copy phone
  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast({ title: 'Copied!', description: 'Phone number copied to clipboard' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Leads</h1>
          <p className="text-muted-foreground mt-1">Manage and track your sales leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setImportDialogOpen(true)}>
            <Upload className="w-4 h-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="btn-gradient-primary gap-2">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold font-display">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Today</p>
              <p className="text-2xl font-bold font-display">{stats.newToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hot Leads</p>
              <p className="text-2xl font-bold font-display">{stats.hot}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold font-display">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="new">New Lead</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="won">Closed Won</SelectItem>
                <SelectItem value="lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="hot">🔥 Hot</SelectItem>
                <SelectItem value="warm">☀️ Warm</SelectItem>
                <SelectItem value="cold">❄️ Cold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={callerFilter} onValueChange={setCallerFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Callers</SelectItem>
                {mockCallers.filter(c => c.role === 'caller').map(caller => (
                  <SelectItem key={caller.id} value={caller.id}>{caller.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.length} selected
              </span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads Table */}
      {viewMode === 'list' ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedLeads(prev => [...prev, lead.id]);
                          } else {
                            setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                          <span className="text-sm font-medium text-accent-foreground">{lead.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.city}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`tel:${lead.phone}`)}>
                          <Phone className="w-4 h-4 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\s/g, '')}`)}>
                          <MessageCircle className="w-4 h-4 text-success" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyPhone(lead.phone)}>
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-foreground">{formatCurrency(lead.value)}</span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.stage}
                        onValueChange={(value) => handleStageChange(lead.id, value as LeadStage)}
                      >
                        <SelectTrigger className="w-[140px] h-8 border-0 bg-transparent p-0">
                          <StageBadge stage={lead.stage} size="sm" />
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
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.priority}
                        onValueChange={(value) => handlePriorityChange(lead.id, value as LeadPriority)}
                      >
                        <SelectTrigger className="w-[100px] h-8 border-0 bg-transparent p-0">
                          <PriorityBadge priority={lead.priority} size="sm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hot">🔥 Hot</SelectItem>
                          <SelectItem value="warm">☀️ Warm</SelectItem>
                          <SelectItem value="cold">❄️ Cold</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{leadSourceLabels[lead.source]}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{lead.assignedCallerName || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="w-4 h-4 mr-2" />
                            Log Call
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <span className="font-medium text-accent-foreground">{lead.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.city}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={lead.priority} size="sm" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Value</span>
                    <span className="font-semibold text-foreground">{formatCurrency(lead.value)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stage</span>
                    <StageBadge stage={lead.stage} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Source</span>
                    <span className="text-sm text-foreground">{leadSourceLabels[lead.source]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => window.open(`tel:${lead.phone}`)}>
                    <Phone className="w-4 h-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\s/g, '')}`)}>
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Import Dialog */}
      <ImportLeadsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImportLeads}
      />
    </div>
  );
};

export default Leads;
