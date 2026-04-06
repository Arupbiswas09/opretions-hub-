import { Conversation } from './types';

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    channel: 'email',
    primaryContact: {
      id: 'c1',
      name: 'Sarah Chen',
      email: 'sarah.chen@techcorp.com',
      avatar: 'SC'
    },
    subject: 'Q1 Contract Review',
    snippet: 'Hi team, I wanted to follow up on the contract terms we discussed last week...',
    messages: [
      {
        id: 'm1',
        sender: { id: 'c1', name: 'Sarah Chen', email: 'sarah.chen@techcorp.com' },
        content: 'Hi team,\n\nI wanted to follow up on the contract terms we discussed last week. We\'ve reviewed the proposed changes and have a few questions:\n\n1. Can we extend the payment terms to Net 45?\n2. What\'s the timeline for the implementation phase?\n3. Are there any additional costs for the premium support tier?\n\nLooking forward to your response.\n\nBest regards,\nSarah',
        timestamp: '2026-01-26T09:15:00Z',
        channel: 'email'
      },
      {
        id: 'm2',
        sender: { id: 'me', name: 'You', email: 'you@company.com', isMe: true },
        content: 'Hi Sarah,\n\nThanks for reaching out. Let me address your questions:\n\n1. Net 45 terms are acceptable for this contract size\n2. Implementation will begin within 2 weeks of contract signing\n3. Premium support is included at no additional cost for Year 1\n\nI\'ll send over the updated contract by EOD tomorrow.\n\nBest,\nYou',
        timestamp: '2026-01-26T10:30:00Z',
        channel: 'email'
      }
    ],
    linkedEntities: [
      { id: 'cl1', type: 'client', name: 'TechCorp Inc' },
      { id: 'pr1', type: 'project', name: 'Q1 Implementation' },
      { id: 'dl1', type: 'deal', name: 'TechCorp Enterprise' }
    ],
    status: 'awaiting-reply',
    lastActivity: '2026-01-26T10:30:00Z',
    isUnread: false,
    assignedTo: 'me'
  },
  {
    id: 'conv-2',
    channel: 'linkedin',
    primaryContact: {
      id: 'c2',
      name: 'Marcus Thompson',
      avatar: 'MT'
    },
    snippet: 'Hey! I saw your profile and would love to discuss the Senior DevOps role...',
    messages: [
      {
        id: 'm3',
        sender: { id: 'c2', name: 'Marcus Thompson' },
        content: 'Hey! I saw your profile and would love to discuss the Senior DevOps role at your company. I have 8+ years of experience with AWS, Kubernetes, and CI/CD pipelines. Are you still hiring for this position?',
        timestamp: '2026-01-26T14:20:00Z',
        channel: 'linkedin'
      }
    ],
    linkedEntities: [
      { id: 'j1', type: 'job', name: 'Senior DevOps Engineer' },
      { id: 'can1', type: 'candidate', name: 'Marcus Thompson' }
    ],
    status: 'unread',
    lastActivity: '2026-01-26T14:20:00Z',
    isUnread: true,
    assignedTo: 'sarah'
  },
  {
    id: 'conv-3',
    channel: 'whatsapp',
    primaryContact: {
      id: 'c3',
      name: 'Alex Rivera',
      avatar: 'AR'
    },
    snippet: 'Quick question about the deployment schedule for Friday...',
    messages: [
      {
        id: 'm4',
        sender: { id: 'c3', name: 'Alex Rivera' },
        content: 'Quick question about the deployment schedule for Friday - are we still on track for 3 PM EST?',
        timestamp: '2026-01-26T11:45:00Z',
        channel: 'whatsapp'
      },
      {
        id: 'm5',
        sender: { id: 'me', name: 'You', isMe: true },
        content: 'Yes, still on track! QA testing should be complete by 2 PM.',
        timestamp: '2026-01-26T11:50:00Z',
        channel: 'whatsapp'
      },
      {
        id: 'm6',
        sender: { id: 'c3', name: 'Alex Rivera' },
        content: 'Perfect, thanks! I\'ll notify the client.',
        timestamp: '2026-01-26T11:52:00Z',
        channel: 'whatsapp'
      }
    ],
    linkedEntities: [
      { id: 'pr2', type: 'project', name: 'Platform Migration' },
      { id: 'cl2', type: 'client', name: 'Rivera Tech Solutions' }
    ],
    status: 'done',
    lastActivity: '2026-01-26T11:52:00Z',
    isUnread: false,
    assignedTo: 'me'
  },
  {
    id: 'conv-4',
    channel: 'email',
    primaryContact: {
      id: 'c4',
      name: 'Jennifer Wu',
      email: 'jennifer@designstudio.io',
      avatar: 'JW'
    },
    subject: 'Design System Documentation',
    snippet: 'Attached is the updated design system documentation. Please review Section 3...',
    messages: [
      {
        id: 'm7',
        sender: { id: 'c4', name: 'Jennifer Wu', email: 'jennifer@designstudio.io' },
        content: 'Hi,\n\nAttached is the updated design system documentation. Please review Section 3 regarding component states and let me know if you have any feedback.\n\nThe deadline for final approval is this Friday.\n\nThanks,\nJennifer',
        timestamp: '2026-01-26T08:30:00Z',
        channel: 'email'
      }
    ],
    linkedEntities: [
      { id: 'pr3', type: 'project', name: 'Design System Overhaul' },
      { id: 'cl3', type: 'client', name: 'Design Studio Co' }
    ],
    status: 'unread',
    lastActivity: '2026-01-26T08:30:00Z',
    isUnread: true,
    assignedTo: 'team'
  },
  {
    id: 'conv-5',
    channel: 'internal',
    primaryContact: {
      id: 'c5',
      name: 'David Park',
      avatar: 'DP'
    },
    snippet: 'Team sync notes from this morning meeting...',
    messages: [
      {
        id: 'm8',
        sender: { id: 'c5', name: 'David Park' },
        content: 'Team sync notes from this morning:\n\n- Sprint planning complete\n- 3 blockers identified (see Jira)\n- Next retrospective: Friday 2 PM\n- Action items assigned\n\nLet me know if I missed anything.',
        timestamp: '2026-01-26T10:00:00Z',
        channel: 'internal'
      }
    ],
    linkedEntities: [
      { id: 'pr4', type: 'project', name: 'Internal Platform v2' }
    ],
    status: 'done',
    lastActivity: '2026-01-26T10:00:00Z',
    isUnread: false,
    assignedTo: 'team'
  },
  {
    id: 'conv-6',
    channel: 'linkedin',
    primaryContact: {
      id: 'c6',
      name: 'Emily Nakamura',
      avatar: 'EN'
    },
    snippet: 'I\'m interested in the Product Manager position at your company...',
    messages: [
      {
        id: 'm9',
        sender: { id: 'c6', name: 'Emily Nakamura' },
        content: 'Hi! I\'m interested in the Product Manager position at your company. I have 6 years of experience leading cross-functional teams at SaaS companies. Would love to chat!',
        timestamp: '2026-01-25T16:30:00Z',
        channel: 'linkedin'
      }
    ],
    linkedEntities: [
      { id: 'j2', type: 'job', name: 'Senior Product Manager' },
      { id: 'can2', type: 'candidate', name: 'Emily Nakamura' }
    ],
    status: 'unread',
    lastActivity: '2026-01-25T16:30:00Z',
    isUnread: true,
    assignedTo: 'sarah'
  },
  {
    id: 'conv-7',
    channel: 'email',
    primaryContact: {
      id: 'c7',
      name: 'Robert Foster',
      email: 'rfoster@globalfinance.com',
      avatar: 'RF'
    },
    subject: 'Partnership Proposal - Q2 2026',
    snippet: 'Following up on our call last week regarding the strategic partnership...',
    messages: [
      {
        id: 'm10',
        sender: { id: 'c7', name: 'Robert Foster', email: 'rfoster@globalfinance.com' },
        content: 'Hi,\n\nFollowing up on our call last week regarding the strategic partnership for Q2 2026.\n\nOur team has prepared an initial proposal covering:\n- Revenue sharing model\n- Joint marketing initiatives\n- Technical integration timeline\n\nCan we schedule a follow-up meeting next week to discuss?\n\nBest,\nRobert',
        timestamp: '2026-01-25T15:00:00Z',
        channel: 'email'
      }
    ],
    linkedEntities: [
      { id: 'dl2', type: 'deal', name: 'Global Finance Partnership' },
      { id: 'cl4', type: 'client', name: 'Global Finance Corp' }
    ],
    status: 'awaiting-reply',
    lastActivity: '2026-01-25T15:00:00Z',
    isUnread: false,
    assignedTo: 'john'
  },
  {
    id: 'conv-8',
    channel: 'whatsapp',
    primaryContact: {
      id: 'c8',
      name: 'Maria Santos',
      avatar: 'MS'
    },
    snippet: 'The client wants to move the demo to Wednesday instead of Thursday...',
    messages: [
      {
        id: 'm11',
        sender: { id: 'c8', name: 'Maria Santos' },
        content: 'The client wants to move the demo to Wednesday instead of Thursday. Can you make it?',
        timestamp: '2026-01-26T13:15:00Z',
        channel: 'whatsapp'
      }
    ],
    linkedEntities: [
      { id: 'pr5', type: 'project', name: 'Enterprise Demo' },
      { id: 'cl5', type: 'client', name: 'Santos Enterprises' }
    ],
    status: 'unread',
    lastActivity: '2026-01-26T13:15:00Z',
    isUnread: true,
    assignedTo: 'me'
  },
  {
    id: 'conv-9',
    channel: 'email',
    primaryContact: {
      id: 'c9',
      name: 'Kevin Patel',
      email: 'kpatel@innovatetech.com',
      avatar: 'KP'
    },
    subject: 'Invoice #2024-156 - Payment Confirmation',
    snippet: 'Payment has been processed for Invoice #2024-156. Please confirm receipt...',
    messages: [
      {
        id: 'm12',
        sender: { id: 'c9', name: 'Kevin Patel', email: 'kpatel@innovatetech.com' },
        content: 'Hi,\n\nPayment has been processed for Invoice #2024-156 in the amount of $45,000.\n\nPlease confirm receipt and send the updated license keys.\n\nThank you,\nKevin',
        timestamp: '2026-01-25T11:20:00Z',
        channel: 'email'
      }
    ],
    linkedEntities: [
      { id: 'cl6', type: 'client', name: 'InnovateTech' },
      { id: 'dl3', type: 'deal', name: 'InnovateTech License Renewal' }
    ],
    status: 'done',
    lastActivity: '2026-01-25T11:20:00Z',
    isUnread: false,
    assignedTo: 'finance'
  },
  {
    id: 'conv-10',
    channel: 'internal',
    primaryContact: {
      id: 'c10',
      name: 'Lisa Anderson',
      avatar: 'LA'
    },
    snippet: 'Reminder: All timesheets must be submitted by Friday EOD...',
    messages: [
      {
        id: 'm13',
        sender: { id: 'c10', name: 'Lisa Anderson' },
        content: 'Hi team,\n\nReminder: All timesheets must be submitted by Friday EOD for payroll processing.\n\nIf you have any issues, please reach out to HR.\n\nThanks,\nLisa',
        timestamp: '2026-01-24T09:00:00Z',
        channel: 'internal'
      }
    ],
    linkedEntities: [],
    status: 'done',
    lastActivity: '2026-01-24T09:00:00Z',
    isUnread: false,
    assignedTo: 'team'
  },
  {
    id: 'conv-11',
    channel: 'linkedin',
    primaryContact: {
      id: 'c11',
      name: 'James Carter',
      avatar: 'JC'
    },
    snippet: 'Saw your post about AI in talent acquisition. Would love to connect...',
    messages: [
      {
        id: 'm14',
        sender: { id: 'c11', name: 'James Carter' },
        content: 'Saw your post about AI in talent acquisition. Would love to connect and learn more about your approach. We\'re exploring similar solutions at our company.',
        timestamp: '2026-01-24T14:45:00Z',
        channel: 'linkedin'
      }
    ],
    linkedEntities: [],
    status: 'awaiting-reply',
    lastActivity: '2026-01-24T14:45:00Z',
    isUnread: false,
    assignedTo: 'marketing'
  },
  {
    id: 'conv-12',
    channel: 'email',
    primaryContact: {
      id: 'c12',
      name: 'Amanda Lee',
      email: 'amanda@startupxyz.com',
      avatar: 'AL'
    },
    subject: 'Feature Request - API Rate Limiting',
    snippet: 'Our usage has grown significantly and we\'re hitting rate limits...',
    messages: [
      {
        id: 'm15',
        sender: { id: 'c12', name: 'Amanda Lee', email: 'amanda@startupxyz.com' },
        content: 'Hi,\n\nOur usage has grown significantly over the past month and we\'re starting to hit API rate limits during peak hours.\n\nCan we discuss upgrading our plan or getting custom rate limits?\n\nThis is becoming urgent as it\'s affecting our production systems.\n\nThanks,\nAmanda',
        timestamp: '2026-01-26T07:00:00Z',
        channel: 'email'
      }
    ],
    linkedEntities: [
      { id: 'cl7', type: 'client', name: 'StartupXYZ' },
      { id: 'pr6', type: 'project', name: 'API Integration Support' }
    ],
    status: 'unread',
    lastActivity: '2026-01-26T07:00:00Z',
    isUnread: true,
    assignedTo: 'support'
  },
  {
    id: 'conv-13',
    channel: 'whatsapp',
    primaryContact: {
      id: 'c13',
      name: 'Tom Richardson',
      avatar: 'TR'
    },
    snippet: 'Running 10 mins late to the meeting. Starting without me is fine...',
    messages: [
      {
        id: 'm16',
        sender: { id: 'c13', name: 'Tom Richardson' },
        content: 'Running 10 mins late to the meeting. Starting without me is fine, I\'ll join ASAP.',
        timestamp: '2026-01-23T14:50:00Z',
        channel: 'whatsapp'
      }
    ],
    linkedEntities: [
      { id: 'pr7', type: 'project', name: 'Client Onboarding' }
    ],
    status: 'done',
    lastActivity: '2026-01-23T14:50:00Z',
    isUnread: false,
    assignedTo: 'team'
  },
  {
    id: 'conv-14',
    channel: 'email',
    primaryContact: {
      id: 'c14',
      name: 'Sophie Martin',
      email: 'sophie.martin@eurotech.eu',
      avatar: 'SM'
    },
    subject: 'GDPR Compliance Documentation',
    snippet: 'We need updated GDPR compliance documentation for our audit...',
    messages: [
      {
        id: 'm17',
        sender: { id: 'c14', name: 'Sophie Martin', email: 'sophie.martin@eurotech.eu' },
        content: 'Hello,\n\nWe need updated GDPR compliance documentation for our upcoming audit in March.\n\nSpecifically, we need:\n- Data processing agreements\n- Privacy policy updates\n- Data retention schedules\n\nCan you provide these by the end of this week?\n\nRegards,\nSophie',
        timestamp: '2026-01-26T06:30:00Z',
        channel: 'email'
      }
    ],
    linkedEntities: [
      { id: 'cl8', type: 'client', name: 'EuroTech Solutions' },
      { id: 'pr8', type: 'project', name: 'GDPR Compliance' }
    ],
    status: 'unread',
    lastActivity: '2026-01-26T06:30:00Z',
    isUnread: true,
    assignedTo: 'legal'
  },
  {
    id: 'conv-15',
    channel: 'internal',
    primaryContact: {
      id: 'c15',
      name: 'Rachel Green',
      avatar: 'RG'
    },
    snippet: 'Q1 OKR review scheduled for next Monday at 10 AM...',
    messages: [
      {
        id: 'm18',
        sender: { id: 'c15', name: 'Rachel Green' },
        content: 'Hi everyone,\n\nQ1 OKR review is scheduled for next Monday at 10 AM in Conference Room B.\n\nPlease come prepared with:\n- Progress updates\n- Blockers\n- Q2 planning ideas\n\nSee you there!\nRachel',
        timestamp: '2026-01-23T11:00:00Z',
        channel: 'internal'
      }
    ],
    linkedEntities: [],
    status: 'done',
    lastActivity: '2026-01-23T11:00:00Z',
    isUnread: false,
    assignedTo: 'team'
  }
];
