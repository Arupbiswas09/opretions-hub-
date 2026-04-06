// Dummy data for Cockpit
export const users = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', email: 'sarah.chen@company.com' },
  { id: '2', name: 'Marcus Johnson', avatar: 'MJ', email: 'marcus.j@company.com' },
  { id: '3', name: 'Emma Rodriguez', avatar: 'ER', email: 'emma.r@company.com' },
  { id: '4', name: 'David Kim', avatar: 'DK', email: 'david.kim@company.com' },
  { id: '5', name: 'Lisa Park', avatar: 'LP', email: 'lisa.park@company.com' },
];

export const clients = [
  { id: 'c1', name: 'TechVenture Labs', type: 'client' },
  { id: 'c2', name: 'Global Dynamics Inc', type: 'client' },
  { id: 'c3', name: 'Innovate Solutions', type: 'client' },
  { id: 'c4', name: 'Quantum Systems', type: 'client' },
  { id: 'c5', name: 'NextGen Analytics', type: 'client' },
  { id: 'c6', name: 'Stellar Enterprises', type: 'client' },
];

export const projects = [
  { id: 'p1', name: 'Cloud Migration Phase 2', clientId: 'c1', status: 'active' },
  { id: 'p2', name: 'AI Platform Development', clientId: 'c2', status: 'at-risk' },
  { id: 'p3', name: 'Mobile App Redesign', clientId: 'c3', status: 'active' },
  { id: 'p4', name: 'Data Analytics Dashboard', clientId: 'c4', status: 'active' },
  { id: 'p5', name: 'Security Audit & Compliance', clientId: 'c5', status: 'at-risk' },
  { id: 'p6', name: 'E-commerce Platform', clientId: 'c6', status: 'active' },
  { id: 'p7', name: 'API Integration Suite', clientId: 'c2', status: 'active' },
  { id: 'p8', name: 'DevOps Automation', clientId: 'c1', status: 'active' },
];

export const jobs = [
  { id: 'j1', title: 'Senior Full-Stack Engineer', status: 'open', clientId: 'c2' },
  { id: 'j2', title: 'Product Designer', status: 'open', clientId: 'c3' },
  { id: 'j3', title: 'DevOps Architect', status: 'open', clientId: 'c1' },
];

export const candidates = [
  { id: 'cd1', name: 'Alex Turner', jobId: 'j1', stage: 'technical-interview' },
  { id: 'cd2', name: 'Nina Patel', jobId: 'j2', stage: 'client-interview' },
];

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'waiting' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';
export type EntityType = 'project' | 'client' | 'job' | 'candidate' | 'communication';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  entityType: EntityType;
  entityId: string;
  entityName: string;
  ownerId: string;
  assignedById?: string;
  isOverdue: boolean;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export const tasks: Task[] = [
  // Communication responses (today)
  {
    id: 't-comm1',
    title: 'Respond to client email about timeline extension',
    description: 'Client requested 2-week extension on deliverable - need to confirm with team',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-01-25',
    entityType: 'communication',
    entityId: 'comm1',
    entityName: 'Email from TechVenture Labs',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't-comm2',
    title: 'Reply to Slack thread on API integration approach',
    description: 'Team asking for decision on REST vs GraphQL implementation',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-25',
    entityType: 'communication',
    entityId: 'comm2',
    entityName: 'Slack: #ai-platform-dev',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't-comm3',
    title: 'Follow up on candidate interview feedback',
    description: 'Send feedback to recruiting team about Alex Turner interview',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-25',
    entityType: 'communication',
    entityId: 'comm3',
    entityName: 'Email to HR Team',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  // Overdue tasks
  {
    id: 't1',
    title: 'Review and approve security audit findings',
    description: 'Complete review of Q4 security audit report and approve remediation plan',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-01-22',
    entityType: 'project',
    entityId: 'p5',
    entityName: 'Security Audit & Compliance',
    ownerId: '1',
    isOverdue: true,
    comments: [
      { id: 'c1', userId: '2', text: 'Audit report is ready for review', timestamp: '2026-01-23 09:30' },
      { id: 'c2', userId: '1', text: 'Will review by EOD', timestamp: '2026-01-23 14:15' },
    ],
  },
  {
    id: 't2',
    title: 'Send contract to TechVenture Labs for Phase 2',
    description: 'Finalize SOW and send contract for Phase 2 scope',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-01-23',
    entityType: 'project',
    entityId: 'p1',
    entityName: 'Cloud Migration Phase 2',
    ownerId: '1',
    isOverdue: true,
    comments: [
      { id: 'c3', userId: '3', text: 'Legal has approved the terms', timestamp: '2026-01-22 16:00' },
    ],
  },
  {
    id: 't3',
    title: 'Follow up with Alex Turner on technical interview',
    description: 'Check availability for final round technical interview',
    status: 'waiting',
    priority: 'medium',
    dueDate: '2026-01-24',
    entityType: 'candidate',
    entityId: 'cd1',
    entityName: 'Alex Turner',
    ownerId: '1',
    isOverdue: true,
    comments: [],
  },
  // Today's tasks
  {
    id: 't4',
    title: 'Prepare client presentation for AI Platform progress',
    description: 'Create slide deck showing Q1 milestones and demo environment',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-01-25',
    entityType: 'project',
    entityId: 'p2',
    entityName: 'AI Platform Development',
    ownerId: '1',
    isOverdue: false,
    comments: [
      { id: 'c4', userId: '4', text: 'Demo environment is ready', timestamp: '2026-01-25 08:00' },
    ],
  },
  {
    id: 't5',
    title: 'Review mobile app wireframes from design team',
    description: 'Provide feedback on updated wireframes for home screen',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-25',
    entityType: 'project',
    entityId: 'p3',
    entityName: 'Mobile App Redesign',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't6',
    title: 'Approve timesheet for Lisa Park',
    description: 'Review and approve submitted timesheet for week ending Jan 24',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-01-25',
    entityType: 'project',
    entityId: 'p4',
    entityName: 'Data Analytics Dashboard',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't7',
    title: 'Update revenue forecast for Quantum Systems',
    description: 'Revise Q1 revenue projection based on scope changes',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-25',
    entityType: 'client',
    entityId: 'c4',
    entityName: 'Quantum Systems',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  // Blocked tasks
  {
    id: 't8',
    title: 'Deploy e-commerce staging environment',
    description: 'Waiting for infrastructure provisioning from DevOps team',
    status: 'blocked',
    priority: 'high',
    dueDate: '2026-01-26',
    entityType: 'project',
    entityId: 'p6',
    entityName: 'E-commerce Platform',
    ownerId: '1',
    isOverdue: false,
    comments: [
      { id: 'c5', userId: '5', text: 'Infrastructure team working on it', timestamp: '2026-01-24 11:00' },
    ],
  },
  {
    id: 't9',
    title: 'Schedule kickoff meeting for API Integration',
    description: 'Blocked until client confirms availability',
    status: 'blocked',
    priority: 'medium',
    dueDate: '2026-01-27',
    entityType: 'project',
    entityId: 'p7',
    entityName: 'API Integration Suite',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  // Tomorrow's tasks
  {
    id: 't10',
    title: 'Conduct technical interview with Nina Patel',
    description: 'Portfolio review and design challenge discussion',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-01-26',
    entityType: 'candidate',
    entityId: 'cd2',
    entityName: 'Nina Patel',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't11',
    title: 'Submit monthly revenue report to finance team',
    description: 'Compile all client billings and project actuals for January',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-01-26',
    entityType: 'client',
    entityId: 'c2',
    entityName: 'Global Dynamics Inc',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't12',
    title: 'Review DevOps automation proposal',
    description: 'Technical review of proposed CI/CD pipeline improvements',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-26',
    entityType: 'project',
    entityId: 'p8',
    entityName: 'DevOps Automation',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  // This week tasks
  {
    id: 't13',
    title: 'Post job opening for Senior Full-Stack Engineer',
    description: 'Finalize job description and post to all channels',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-28',
    entityType: 'job',
    entityId: 'j1',
    entityName: 'Senior Full-Stack Engineer',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't14',
    title: 'Quarterly business review prep for NextGen Analytics',
    description: 'Prepare performance metrics and renewal discussion points',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-01-29',
    entityType: 'client',
    entityId: 'c5',
    entityName: 'NextGen Analytics',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  {
    id: 't15',
    title: 'Code review for authentication module',
    description: 'Review PR for OAuth2 implementation',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-30',
    entityType: 'project',
    entityId: 'p2',
    entityName: 'AI Platform Development',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
  // Waiting tasks
  {
    id: 't16',
    title: 'Finalize scope for Stellar Enterprises engagement',
    description: 'Awaiting client decision on optional features',
    status: 'waiting',
    priority: 'medium',
    dueDate: '2026-01-27',
    entityType: 'client',
    entityId: 'c6',
    entityName: 'Stellar Enterprises',
    ownerId: '1',
    isOverdue: false,
    comments: [],
  },
];

export interface AiInsight {
  id: string;
  type: 'follow-up' | 'risk' | 'missing-info' | 'blocker';
  title: string;
  description: string;
  reasoning: string;
  suggestedAction: string;
  relatedEntityType: EntityType;
  relatedEntityId: string;
  relatedEntityName: string;
  priority: TaskPriority;
}

export const aiInsights: AiInsight[] = [
  {
    id: 'ai1',
    type: 'risk',
    title: 'AI Platform milestone at risk',
    description: 'Project is behind schedule by 5 days. Client meeting scheduled for today.',
    reasoning: 'Last 3 sprint commitments missed. Team velocity dropped 30%. Client expects demo today.',
    suggestedAction: 'Schedule team sync to identify blockers and communicate revised timeline to client',
    relatedEntityType: 'project',
    relatedEntityId: 'p2',
    relatedEntityName: 'AI Platform Development',
    priority: 'high',
  },
  {
    id: 'ai2',
    type: 'follow-up',
    title: 'Contract pending with TechVenture Labs',
    description: 'Contract was marked "ready to send" 3 days ago but not yet delivered.',
    reasoning: 'Task created Jan 20, marked in-progress Jan 22, but no follow-up communication logged.',
    suggestedAction: 'Send contract today and set follow-up reminder for 48 hours',
    relatedEntityType: 'project',
    relatedEntityId: 'p1',
    relatedEntityName: 'Cloud Migration Phase 2',
    priority: 'high',
  },
  {
    id: 'ai3',
    type: 'missing-info',
    title: 'Alex Turner interview - no calendar invite',
    description: 'Follow-up task created but no meeting scheduled.',
    reasoning: 'Task is waiting status but no calendar event exists. Candidate may be expecting confirmation.',
    suggestedAction: 'Send calendar invite for technical interview this week',
    relatedEntityType: 'candidate',
    relatedEntityId: 'cd1',
    relatedEntityName: 'Alex Turner',
    priority: 'medium',
  },
  {
    id: 'ai4',
    type: 'blocker',
    title: 'E-commerce deploy blocked for 2 days',
    description: 'Infrastructure provisioning delaying critical path.',
    reasoning: 'Task marked blocked 2 days ago. No estimated resolution time logged.',
    suggestedAction: 'Escalate to DevOps lead and request ETA',
    relatedEntityType: 'project',
    relatedEntityId: 'p6',
    relatedEntityName: 'E-commerce Platform',
    priority: 'high',
  },
  {
    id: 'ai5',
    type: 'follow-up',
    title: 'Revenue forecast overdue',
    description: 'Quantum Systems forecast revision due today - impacts monthly reporting.',
    reasoning: 'Finance team needs this by EOD for board report. No progress logged.',
    suggestedAction: 'Prioritize revenue forecast task before end of day',
    relatedEntityType: 'client',
    relatedEntityId: 'c4',
    relatedEntityName: 'Quantum Systems',
    priority: 'high',
  },
  {
    id: 'ai6',
    type: 'missing-info',
    title: 'Security audit approval - no comments',
    description: 'Report ready for 3 days but no feedback provided.',
    reasoning: 'High priority task overdue by 3 days. Compliance deadline approaching.',
    suggestedAction: 'Review audit findings today and document approval decision',
    relatedEntityType: 'project',
    relatedEntityId: 'p5',
    relatedEntityName: 'Security Audit & Compliance',
    priority: 'high',
  },
  {
    id: 'ai7',
    type: 'follow-up',
    title: 'API Integration kickoff delayed',
    description: 'Client hasn\'t confirmed availability for 5 days.',
    reasoning: 'Project start delayed. May impact Q1 delivery commitment.',
    suggestedAction: 'Send reminder email and propose 3 alternative meeting times',
    relatedEntityType: 'project',
    relatedEntityId: 'p7',
    relatedEntityName: 'API Integration Suite',
    priority: 'medium',
  },
  {
    id: 'ai8',
    type: 'follow-up',
    title: 'Nina Patel interview tomorrow - prep needed',
    description: 'Technical interview scheduled but no prep materials shared with team.',
    reasoning: 'Interview in 24 hours. Design challenge and evaluation criteria not distributed.',
    suggestedAction: 'Send interview guide and design challenge to interview panel',
    relatedEntityType: 'candidate',
    relatedEntityId: 'cd2',
    relatedEntityName: 'Nina Patel',
    priority: 'medium',
  },
];

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  participants: string[];
  relatedEntityType?: EntityType;
  relatedEntityId?: string;
  relatedEntityName?: string;
  summary: string;
  notes: string;
  actionItems: string[];
}

export const todaysMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'AI Platform Progress Demo',
    startTime: '09:00',
    endTime: '10:00',
    participants: ['1', '2', '4'],
    relatedEntityType: 'project',
    relatedEntityId: 'p2',
    relatedEntityName: 'AI Platform Development',
    summary: 'Quarterly demo of AI platform features to Global Dynamics stakeholders',
    notes: 'Demo environment ready. Focus on NLP capabilities and integration APIs. Client particularly interested in scalability metrics.',
    actionItems: [
      'Share demo recording with extended team',
      'Schedule technical deep-dive for infrastructure team',
      'Prepare scalability benchmarks report by Friday',
    ],
  },
  {
    id: 'm2',
    title: 'Team Standup',
    startTime: '10:30',
    endTime: '11:00',
    participants: ['1', '2', '3', '4', '5'],
    summary: 'Daily team standup and blocker discussion',
    notes: 'Review sprint progress, discuss e-commerce infrastructure blocker, plan week priorities.',
    actionItems: [
      'Follow up with DevOps on infrastructure ETA',
      'Reassign mobile app review if Sarah unavailable',
    ],
  },
  {
    id: 'm3',
    title: '1:1 with Marcus',
    startTime: '13:00',
    endTime: '13:30',
    participants: ['1', '2'],
    summary: 'Weekly one-on-one with Marcus Johnson',
    notes: 'Discuss career development goals, review current project workload, address any concerns.',
    actionItems: [
      'Enroll Marcus in advanced architecture training',
      'Assign mentorship role for junior developers',
    ],
  },
  {
    id: 'm4',
    title: 'Mobile App Design Review',
    startTime: '14:00',
    endTime: '15:00',
    participants: ['1', '3', '5'],
    relatedEntityType: 'project',
    relatedEntityId: 'p3',
    relatedEntityName: 'Mobile App Redesign',
    summary: 'Review updated wireframes and discuss user flow improvements',
    notes: 'Design team has revised home screen based on user testing feedback. Need to approve before development sprint starts.',
    actionItems: [
      'Approve wireframes if navigation improvements are clear',
      'Request accessibility audit for new designs',
      'Confirm development sprint can start Monday',
    ],
  },
  {
    id: 'm5',
    title: 'Revenue Forecast Review',
    startTime: '15:30',
    endTime: '16:00',
    participants: ['1', '4'],
    relatedEntityType: 'client',
    relatedEntityId: 'c4',
    relatedEntityName: 'Quantum Systems',
    summary: 'Finalize Q1 revenue projection adjustments',
    notes: 'Scope changes impact revenue by approximately $45K. Need to update forecast before board meeting tomorrow.',
    actionItems: [
      'Update financial model with revised scope',
      'Send updated forecast to finance team by 5 PM',
    ],
  },
  {
    id: 'm6',
    title: 'Weekly Leadership Sync',
    startTime: '16:30',
    endTime: '17:30',
    participants: ['1', '2', '3'],
    summary: 'Cross-functional leadership team weekly sync',
    notes: 'Review project health across all accounts, discuss hiring pipeline, address escalations.',
    actionItems: [
      'Escalate e-commerce infrastructure blocker',
      'Approve Product Designer job posting',
      'Schedule client QBR for NextGen Analytics',
    ],
  },
];

export interface KpiData {
  id: string;
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  linkTo: string;
}

export const kpiData: KpiData[] = [
  {
    id: 'kpi1',
    title: 'Overdue Tasks',
    value: 3,
    trend: 'down',
    trendValue: '-2 from yesterday',
    linkTo: '/work?filter=overdue',
  },
  {
    id: 'kpi2',
    title: 'Projects at Risk',
    value: 2,
    trend: 'neutral',
    trendValue: 'Same as last week',
    linkTo: '/projects?status=at-risk',
  },
  {
    id: 'kpi3',
    title: 'Unanswered Messages',
    value: 7,
    trend: 'up',
    trendValue: '+3 since morning',
    linkTo: '/communication?filter=unanswered',
  },
  {
    id: 'kpi4',
    title: 'Open Roles',
    value: 3,
    trend: 'neutral',
    trendValue: '5 candidates in pipeline',
    linkTo: '/recruitment?status=open',
  },
  {
    id: 'kpi5',
    title: 'Revenue This Month',
    value: '$487K',
    trend: 'up',
    trendValue: '+12% vs target',
    linkTo: '/finance?period=current-month',
  },
  {
    id: 'kpi6',
    title: 'Pending Approvals',
    value: 4,
    trend: 'neutral',
    trendValue: 'Timesheets & expenses',
    linkTo: '/work?view=approvals',
  },
];