import { useState } from 'react';
import { mockCallers, mockLeads } from '@/data/mockData';
import { Caller } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone as PhoneIcon, 
  Mail, 
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Callers = () => {
  const [callers, setCallers] = useState<Caller[]>(mockCallers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCaller, setEditingCaller] = useState<Caller | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'caller' as 'caller' | 'admin',
  });

  const filteredCallers = callers.filter(caller =>
    caller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caller.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAssignedLeadsCount = (callerId: string) => {
    return mockLeads.filter(lead => lead.assignedCaller === callerId).length;
  };

  const handleToggleStatus = (callerId: string) => {
    setCallers(prev => prev.map(caller => 
      caller.id === callerId 
        ? { ...caller, status: caller.status === 'active' ? 'inactive' : 'active' }
        : caller
    ));
    toast({ title: 'Status updated' });
  };

  const handleOpenDialog = (caller?: Caller) => {
    if (caller) {
      setEditingCaller(caller);
      setFormData({
        name: caller.name,
        username: caller.username,
        email: caller.email,
        phone: caller.phone,
        role: caller.role,
      });
    } else {
      setEditingCaller(null);
      setFormData({ name: '', username: '', email: '', phone: '', role: 'caller' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.username) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    if (editingCaller) {
      setCallers(prev => prev.map(c => 
        c.id === editingCaller.id 
          ? { ...c, ...formData }
          : c
      ));
      toast({ title: 'Caller updated' });
    } else {
      const newCaller: Caller = {
        id: String(callers.length + 1),
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setCallers(prev => [...prev, newCaller]);
      toast({ title: 'Caller created' });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (callerId: string) => {
    setCallers(prev => prev.filter(c => c.id !== callerId));
    toast({ title: 'Caller deleted' });
  };

  const stats = {
    total: callers.length,
    active: callers.filter(c => c.status === 'active').length,
    inactive: callers.filter(c => c.status === 'inactive').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Callers / Agents</h1>
          <p className="text-muted-foreground mt-1">Manage your sales team members</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gradient-primary gap-2" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4" />
              Add Caller
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCaller ? 'Edit Caller' : 'Add New Caller'}</DialogTitle>
              <DialogDescription>
                {editingCaller ? 'Update caller details' : 'Create a new caller account'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input 
                    id="username" 
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'caller' | 'admin' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caller">Caller</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="btn-gradient-primary">
                {editingCaller ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Callers</p>
                <p className="text-2xl font-bold font-display">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold font-display">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <UserX className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold font-display">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search callers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Callers Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="table-header">
                <TableHead>Caller</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCallers.map((caller) => (
                <TableRow key={caller.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        caller.status === 'active' ? "bg-success/10" : "bg-muted"
                      )}>
                        <span className={cn(
                          "text-sm font-medium",
                          caller.status === 'active' ? "text-success" : "text-muted-foreground"
                        )}>
                          {caller.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{caller.name}</p>
                        <p className="text-sm text-muted-foreground">{caller.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{caller.username}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`mailto:${caller.email}`)}>
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(`tel:${caller.phone}`)}>
                        <PhoneIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={caller.role === 'admin' ? 'default' : 'secondary'}>
                      {caller.role === 'admin' ? 'Admin' : 'Caller'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{getAssignedLeadsCount(caller.id)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={caller.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        "cursor-pointer",
                        caller.status === 'active' 
                          ? "bg-success/10 text-success hover:bg-success/20 border border-success/20" 
                          : "bg-muted text-muted-foreground"
                      )}
                      onClick={() => handleToggleStatus(caller.id)}
                    >
                      {caller.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(caller)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(caller.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default Callers;
