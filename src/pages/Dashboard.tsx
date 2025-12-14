import { 
  Users, 
  Building2, 
  Trophy, 
  Calendar, 
  TrendingUp,
  Flame,
  IndianRupee,
  Clock
} from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockDashboardStats, mockLeads, mockActivities, leadSourceLabels } from '@/data/mockData';
import { StageBadge, PriorityBadge } from '@/components/ui/stage-badge';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const stats = mockDashboardStats;
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    return `₹${value.toLocaleString()}`;
  };

  // Pipeline data for pie chart
  const pipelineData = [
    { name: 'New Lead', value: mockLeads.filter(l => l.stage === 'new').length, color: '#0EA5E9' },
    { name: 'Qualified', value: mockLeads.filter(l => l.stage === 'qualified').length, color: '#8B5CF6' },
    { name: 'Proposal', value: mockLeads.filter(l => l.stage === 'proposal').length, color: '#F59E0B' },
    { name: 'Negotiation', value: mockLeads.filter(l => l.stage === 'negotiation').length, color: '#F97316' },
    { name: 'Won', value: mockLeads.filter(l => l.stage === 'won').length, color: '#22C55E' },
    { name: 'Lost', value: mockLeads.filter(l => l.stage === 'lost').length, color: '#EF4444' },
  ];

  // Lead source data
  const sourceData = [
    { name: 'Website', leads: 35 },
    { name: 'Google Ads', leads: 28 },
    { name: 'Referral', leads: 22 },
    { name: 'Social', leads: 18 },
    { name: 'Walk-in', leads: 12 },
  ];

  // Activity trend data
  const trendData = [
    { day: 'Mon', leads: 12 },
    { day: 'Tue', leads: 19 },
    { day: 'Wed', leads: 15 },
    { day: 'Thu', leads: 22 },
    { day: 'Fri', leads: 18 },
    { day: 'Sat', leads: 8 },
    { day: 'Sun', leads: 5 },
  ];

  // Upcoming follow-ups
  const upcomingFollowUps = mockLeads
    .filter(l => l.nextFollowUp)
    .sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your real estate overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Leads"
          value={stats.activeLeads}
          change="+12% from last month"
          changeType="positive"
          icon={Users}
          gradient
          gradientColors="from-primary to-purple-600"
        />
        <StatCard
          title="Hot Leads"
          value={stats.hotLeads}
          change="+5 this week"
          changeType="positive"
          icon={Flame}
          gradient
          gradientColors="from-destructive to-orange-500"
        />
        <StatCard
          title="Deals Closed"
          value={stats.dealsClosed}
          change={`${stats.thisMonthDeals} this month`}
          changeType="positive"
          icon={Trophy}
          gradient
          gradientColors="from-success to-emerald-500"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(stats.totalValue)}
          change="+18% from last month"
          changeType="positive"
          icon={IndianRupee}
          gradient
          gradientColors="from-secondary to-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Activity Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Lead Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(234, 89%, 34%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(234, 89%, 34%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis axisLine={false} tickLine={false} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(234, 89%, 34%)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {pipelineData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceData} layout="vertical">
                <XAxis type="number" axisLine={false} tickLine={false} className="text-xs" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="leads" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Follow-ups */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-secondary" />
              Upcoming Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingFollowUps.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-sm font-medium text-accent-foreground">{lead.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.projectName || 'No project'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={lead.priority} size="sm" />
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(lead.nextFollowUp!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-muted-foreground">{lead.assignedCallerName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-info" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-muted-foreground">{activity.userName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.userName}</span>
                    {' '}{activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(activity.createdAt).toLocaleString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
