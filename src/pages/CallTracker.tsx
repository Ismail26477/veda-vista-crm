import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { mockCallLogs, mockLeads, mockCallers } from '@/data/mockData';
import { CallLog } from '@/types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Timer,
  Plus, Search, TrendingUp, Users, Calendar, BarChart3, Target, Headphones,
  Play, Pause, Square, MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

const CallTracker = () => {
  const [callLogs, setCallLogs] = useState<CallLog[]>(mockCallLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCaller, setFilterCaller] = useState<string>('all');
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    leadId: '',
    type: 'outbound' as 'inbound' | 'outbound',
    duration: '',
    notes: '',
    status: 'completed' as 'completed' | 'missed' | 'in_progress',
    nextFollowUp: '',
  });

  // Live Call Timer
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLeadId, setTimerLeadId] = useState('');
  const [timerType, setTimerType] = useState<'inbound' | 'outbound'>('outbound');
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [timerNotes, setTimerNotes] = useState('');
  const [timerFollowUp, setTimerFollowUp] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerState]);

  const startTimer = () => {
    if (!timerLeadId) {
      toast({ title: 'Select a lead first', variant: 'destructive' });
      return;
    }
    setTimerState('running');
  };

  const pauseTimer = () => setTimerState('paused');
  const resumeTimer = () => setTimerState('running');

  const stopTimer = () => {
    setTimerState('idle');
    if (timerSeconds > 0 && timerLeadId) {
      const newLog: CallLog = {
        id: `c${Date.now()}`,
        leadId: timerLeadId,
        callerId: user?.id || '1',
        callerName: user?.name || 'Unknown',
        type: timerType,
        duration: timerSeconds,
        notes: timerNotes,
        status: 'completed',
        nextFollowUp: timerFollowUp || undefined,
        createdAt: new Date().toISOString(),
      };
      setCallLogs(prev => [newLog, ...prev]);
      toast({ title: 'Call auto-logged', description: `Duration: ${formatDuration(timerSeconds)}` });
    }
    setTimerSeconds(0);
    setTimerNotes('');
    setTimerFollowUp('');
    setIsTimerDialogOpen(false);
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // WhatsApp follow-up
  const sendWhatsAppFollowUp = (leadId: string) => {
    const lead = mockLeads.find(l => l.id === leadId);
    if (!lead) return;
    const phone = lead.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${lead.name}, thank you for your time on our call! As discussed, I'll follow up with more details about the property. Feel free to reach out if you have any questions. — ${user?.name || 'Your Agent'}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    toast({ title: 'WhatsApp opened', description: `Follow-up message for ${lead.name}` });
  };

  // Stats
  const stats = useMemo(() => {
    const total = callLogs.length;
    const completed = callLogs.filter(c => c.status === 'completed').length;
    const missed = callLogs.filter(c => c.status === 'missed').length;
    const inbound = callLogs.filter(c => c.type === 'inbound').length;
    const outbound = callLogs.filter(c => c.type === 'outbound').length;
    const totalDuration = callLogs.reduce((sum, c) => sum + c.duration, 0);
    const avgDuration = total > 0 ? Math.round(totalDuration / total) : 0;
    return { total, completed, missed, inbound, outbound, totalDuration, avgDuration };
  }, [callLogs]);

  // Caller performance
  const callerPerformance = useMemo(() => {
    const perf: Record<string, { name: string; calls: number; duration: number; completed: number; missed: number }> = {};
    callLogs.forEach(log => {
      if (!perf[log.callerId]) {
        perf[log.callerId] = { name: log.callerName, calls: 0, duration: 0, completed: 0, missed: 0 };
      }
      perf[log.callerId].calls++;
      perf[log.callerId].duration += log.duration;
      if (log.status === 'completed') perf[log.callerId].completed++;
      if (log.status === 'missed') perf[log.callerId].missed++;
    });
    return Object.entries(perf).map(([id, data]) => ({
      id,
      ...data,
      avgDuration: Math.round(data.duration / data.calls),
      successRate: Math.round((data.completed / data.calls) * 100),
    }));
  }, [callLogs]);

  // Chart data
  const callTypeData = [
    { name: 'Inbound', value: stats.inbound, color: 'hsl(142, 76%, 36%)' },
    { name: 'Outbound', value: stats.outbound, color: 'hsl(234, 89%, 34%)' },
  ];

  const callStatusData = [
    { name: 'Completed', value: stats.completed, color: 'hsl(142, 76%, 36%)' },
    { name: 'Missed', value: stats.missed, color: 'hsl(0, 84%, 60%)' },
  ];

  const dailyCallData = [
    { day: 'Mon', calls: 8, duration: 45 },
    { day: 'Tue', calls: 12, duration: 68 },
    { day: 'Wed', calls: 10, duration: 52 },
    { day: 'Thu', calls: 15, duration: 85 },
    { day: 'Fri', calls: 11, duration: 60 },
    { day: 'Sat', calls: 5, duration: 25 },
    { day: 'Sun', calls: 2, duration: 10 },
  ];

  const callerChartData = callerPerformance.map(cp => ({
    name: cp.name.split(' ')[0],
    calls: cp.calls,
    avgMin: Math.round(cp.avgDuration / 60),
  }));

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getLeadName = (leadId: string) => {
    return mockLeads.find(l => l.id === leadId)?.name || 'Unknown';
  };

  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = getLeadName(log.leadId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesCaller = filterCaller === 'all' || log.callerId === filterCaller;
    return matchesSearch && matchesType && matchesStatus && matchesCaller;
  });

  const handleLogCall = () => {
    if (!formData.leadId || !formData.duration) {
      toast({ title: 'Error', description: 'Select a lead and enter duration', variant: 'destructive' });
      return;
    }
    const newLog: CallLog = {
      id: `c${Date.now()}`,
      leadId: formData.leadId,
      callerId: user?.id || '1',
      callerName: user?.name || 'Unknown',
      type: formData.type,
      duration: parseInt(formData.duration) * 60,
      notes: formData.notes,
      status: formData.status,
      nextFollowUp: formData.nextFollowUp || undefined,
      createdAt: new Date().toISOString(),
    };
    setCallLogs(prev => [newLog, ...prev]);
    setIsLogDialogOpen(false);
    setFormData({ leadId: '', type: 'outbound', duration: '', notes: '', status: 'completed', nextFollowUp: '' });
    toast({ title: 'Call logged successfully' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">Call Tracker</h1>
          <p className="text-muted-foreground mt-1">Track, analyze, and manage all your calls</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsTimerDialogOpen(true)}>
            <Play className="w-4 h-4" />
            Live Call
          </Button>
          <Button className="btn-gradient-primary gap-2" onClick={() => setIsLogDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Log Call
          </Button>
        </div>
      </div>

      {/* Live Timer Banner */}
      {timerState !== 'idle' && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-3 h-3 rounded-full",
                timerState === 'running' ? 'bg-success animate-pulse' : 'bg-secondary'
              )} />
              <div>
                <p className="text-sm text-muted-foreground">
                  Live Call with <span className="font-semibold text-foreground">{mockLeads.find(l => l.id === timerLeadId)?.name}</span>
                </p>
                <p className="text-3xl font-mono font-bold text-foreground">{formatTimer(timerSeconds)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {timerState === 'running' ? (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={pauseTimer}>
                  <Pause className="w-4 h-4" /> Pause
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={resumeTimer}>
                  <Play className="w-4 h-4" /> Resume
                </Button>
              )}
              <Button variant="destructive" size="sm" className="gap-1.5" onClick={stopTimer}>
                <Square className="w-4 h-4" /> End & Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Calls', value: stats.total, icon: Phone, color: 'bg-primary/10 text-primary' },
          { label: 'Completed', value: stats.completed, icon: Target, color: 'bg-success/10 text-success' },
          { label: 'Missed', value: stats.missed, icon: PhoneMissed, color: 'bg-destructive/10 text-destructive' },
          { label: 'Inbound', value: stats.inbound, icon: PhoneIncoming, color: 'bg-info/10 text-info' },
          { label: 'Outbound', value: stats.outbound, icon: PhoneOutgoing, color: 'bg-accent-foreground/10 text-accent-foreground' },
          { label: 'Avg Duration', value: formatDuration(stats.avgDuration), icon: Timer, color: 'bg-secondary/10 text-secondary' },
        ].map((stat) => (
          <Card key={stat.label} className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold font-display">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-1.5" />Overview
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="w-4 h-4 mr-1.5" />Call History
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Users className="w-4 h-4 mr-1.5" />Caller Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Call Volume */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Daily Call Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={dailyCallData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(234, 89%, 34%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(234, 89%, 34%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="calls" stroke="hsl(234, 89%, 34%)" strokeWidth={2} fillOpacity={1} fill="url(#colorCalls)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Call Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Call Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={callTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {callTypeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {callTypeData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                  <ResponsiveContainer width="100%" height={40}>
                    <BarChart data={callStatusData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" hide />
                      <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                        {callStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-1">
                    {callStatusData.map(item => (
                      <div key={item.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Caller Comparison */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-secondary" />
                  Caller Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={callerChartData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                    <YAxis axisLine={false} tickLine={false} className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="calls" fill="hsl(234, 89%, 34%)" radius={[4, 4, 0, 0]} name="Calls" />
                    <Bar dataKey="avgMin" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Avg Min" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Call History Tab */}
        <TabsContent value="history">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search calls..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCaller} onValueChange={setFilterCaller}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Caller" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Callers</SelectItem>
                    {mockCallers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead>Lead</TableHead>
                      <TableHead>Caller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                       <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                          No call logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map(log => (
                        <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                                <span className="text-xs font-medium text-accent-foreground">
                                  {getLeadName(log.leadId).charAt(0)}
                                </span>
                              </div>
                              <span className="font-medium text-foreground">{getLeadName(log.leadId)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.callerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              "gap-1",
                              log.type === 'inbound' ? 'border-success/30 text-success' : 'border-primary/30 text-primary'
                            )}>
                              {log.type === 'inbound' ? <PhoneIncoming className="w-3 h-3" /> : <PhoneOutgoing className="w-3 h-3" />}
                              {log.type === 'inbound' ? 'Inbound' : 'Outbound'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Timer className="w-3.5 h-3.5" />
                              {formatDuration(log.duration)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              log.status === 'completed' && 'bg-success/10 text-success border border-success/20',
                              log.status === 'missed' && 'bg-destructive/10 text-destructive border border-destructive/20',
                              log.status === 'in_progress' && 'bg-secondary/10 text-secondary border border-secondary/20',
                            )}>
                              {log.status === 'completed' ? 'Completed' : log.status === 'missed' ? 'Missed' : 'In Progress'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-muted-foreground max-w-[200px] truncate">{log.notes}</p>
                          </TableCell>
                          <TableCell>
                            {log.nextFollowUp ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3.5 h-3.5 text-secondary" />
                                {new Date(log.nextFollowUp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                              onClick={() => sendWhatsAppFollowUp(log.leadId)}
                              title="Send WhatsApp follow-up"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {callerPerformance.map(cp => (
              <Card key={cp.id} className="stat-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{cp.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{cp.name}</p>
                      <p className="text-xs text-muted-foreground">{cp.calls} total calls</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold text-success">{cp.completed}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Missed</p>
                      <p className="text-lg font-bold text-destructive">{cp.missed}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Avg Duration</p>
                      <p className="text-lg font-bold text-foreground">{formatDuration(cp.avgDuration)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className={cn("text-lg font-bold", cp.successRate >= 80 ? 'text-success' : cp.successRate >= 50 ? 'text-secondary' : 'text-destructive')}>
                        {cp.successRate}%
                      </p>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Performance</span>
                      <span>{cp.successRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          cp.successRate >= 80 ? 'bg-success' : cp.successRate >= 50 ? 'bg-secondary' : 'bg-destructive'
                        )}
                        style={{ width: `${cp.successRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Log Call Dialog */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent onCloseAutoFocus={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Log a Call
            </DialogTitle>
            <DialogDescription>Record a new call entry for a lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lead *</Label>
              <Select value={formData.leadId} onValueChange={v => setFormData(p => ({ ...p, leadId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                <SelectContent>
                  {mockLeads.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name} — {l.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Call Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outbound">Outbound</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Input type="number" placeholder="e.g. 5" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Next Follow-up</Label>
                <Input type="date" value={formData.nextFollowUp} onChange={e => setFormData(p => ({ ...p, nextFollowUp: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Call summary, key points discussed..." value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>Cancel</Button>
            <Button className="btn-gradient-primary" onClick={handleLogCall}>Log Call</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Call Timer Dialog */}
      <Dialog open={isTimerDialogOpen} onOpenChange={(open) => {
        if (!open && timerState === 'idle') setIsTimerDialogOpen(false);
        else if (!open && timerState !== 'idle') {
          // Don't close while timer is running, just minimize
        } else {
          setIsTimerDialogOpen(open);
        }
      }}>
        <DialogContent onCloseAutoFocus={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" /> Live Call Timer
            </DialogTitle>
            <DialogDescription>Start a call and the duration will be auto-logged when you end it</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lead *</Label>
              <Select value={timerLeadId} onValueChange={setTimerLeadId} disabled={timerState !== 'idle'}>
                <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
                <SelectContent>
                  {mockLeads.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name} — {l.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Call Type</Label>
              <Select value={timerType} onValueChange={v => setTimerType(v as any)} disabled={timerState !== 'idle'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timer Display */}
            <div className="text-center py-6">
              <p className="text-5xl font-mono font-bold text-foreground">{formatTimer(timerSeconds)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {timerState === 'idle' ? 'Ready to start' : timerState === 'running' ? 'Call in progress...' : 'Paused'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea placeholder="Take notes during the call..." value={timerNotes} onChange={e => setTimerNotes(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Next Follow-up</Label>
              <Input type="date" value={timerFollowUp} onChange={e => setTimerFollowUp(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            {timerState === 'idle' && (
              <>
                <Button variant="outline" onClick={() => setIsTimerDialogOpen(false)}>Cancel</Button>
                <Button className="btn-gradient-primary gap-1.5" onClick={() => { startTimer(); }}>
                  <Play className="w-4 h-4" /> Start Call
                </Button>
              </>
            )}
            {timerState === 'running' && (
              <>
                <Button variant="outline" className="gap-1.5" onClick={pauseTimer}>
                  <Pause className="w-4 h-4" /> Pause
                </Button>
                <Button variant="destructive" className="gap-1.5" onClick={stopTimer}>
                  <Square className="w-4 h-4" /> End & Log
                </Button>
              </>
            )}
            {timerState === 'paused' && (
              <>
                <Button variant="outline" className="gap-1.5" onClick={resumeTimer}>
                  <Play className="w-4 h-4" /> Resume
                </Button>
                <Button variant="destructive" className="gap-1.5" onClick={stopTimer}>
                  <Square className="w-4 h-4" /> End & Log
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CallTracker;
