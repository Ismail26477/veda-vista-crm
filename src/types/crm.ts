export type LeadStage = 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type LeadStatus = 'active' | 'inactive' | 'paused' | 'not_interested';
export type LeadSource = 'website' | 'google_ads' | 'referral' | 'social_media' | 'walk_in' | 'other';
export type LeadCategory = 'dubai_property' | 'australia_property' | 'india_property' | 'loans';
export type UserRole = 'admin' | 'caller';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  value: number;
  source: LeadSource;
  stage: LeadStage;
  priority: LeadPriority;
  status: LeadStatus;
  category: LeadCategory;
  assignedCaller?: string;
  assignedCallerName?: string;
  projectName?: string;
  nextFollowUp?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Caller {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CallLog {
  id: string;
  leadId: string;
  callerId: string;
  callerName: string;
  type: 'inbound' | 'outbound';
  duration: number;
  notes: string;
  status: 'completed' | 'missed' | 'in_progress';
  nextFollowUp?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'created' | 'assigned' | 'stage_changed' | 'call_logged' | 'note_added' | 'edited' | 'deleted';
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface DashboardStats {
  activeLeads: number;
  propertiesListed: number;
  dealsClosed: number;
  scheduledViewings: number;
  newToday: number;
  thisMonthDeals: number;
  totalValue: number;
  hotLeads: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
