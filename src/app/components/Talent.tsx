'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TA01Dashboard } from './talent/TA01Dashboard';
import { TA02JobsList } from './talent/TA02JobsList';
import { TA03JobsPipeline } from './talent/TA03JobsPipeline';
import { X, Plus, Calendar, User, FileText, Shield, CheckCircle, XCircle, Upload } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiInput } from './bonsai/BonsaiFormFields';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';
import { HubStatTile } from './ops/HubStatTile';

type Screen = 'dashboard' | 'jobs' | 'pipeline' | 'job-detail' | 'candidates' | 'candidate-detail' | 'referrals' | 'client-portal' | 'client-job' | 'client-shortlist';

export default function Talent({ initialScreen = 'dashboard', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showJobDrawer, setShowJobDrawer] = useState(false);
  const [showCandidateDrawer, setShowCandidateDrawer] = useState(false);
  const [showAddToJobModal, setShowAddToJobModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showClientFeedbackModal, setShowClientFeedbackModal] = useState(false);

  const navBtn = (id: Screen, label: string, extra?: () => void) => (
    <button
      key={id}
      type="button"
      onClick={() => { extra?.(); setCurrentScreen(id); }}
      className={moduleSubNavButtonClass(currentScreen === id)}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-full">
      {!hideNav && (
        <ModuleSubNav>
          {navBtn('dashboard', 'Overview')}
          {navBtn('jobs', 'Jobs')}
          {navBtn('pipeline', 'Pipeline')}
          {navBtn('job-detail', 'Job Detail', () => { if (!selectedJob) setSelectedJob({ id: '1', title: 'Senior React Developer', client: 'Tech Startup Inc', stage: 'Sourcing', type: 'Full-time', location: 'Remote' }); })}
          {navBtn('candidates', 'Candidates')}
          {navBtn('candidate-detail', 'Candidate', () => { if (!selectedCandidate) setSelectedCandidate({ id: '1', name: 'Alice Chen', role: 'Senior Frontend Developer', location: 'San Francisco', experience: '8 years' }); })}
          {navBtn('referrals', 'Referrals')}
          <ModuleSubNavDivider />
          <button type="button" onClick={() => setShowJobDrawer(true)} className={moduleSubNavButtonClass(false)}>+ Job</button>
          <button type="button" onClick={() => setShowCandidateDrawer(true)} className={moduleSubNavButtonClass(false)}>+ Candidate</button>
          <ModuleSubNavDivider />
          {navBtn('client-portal', 'Client Jobs')}
          {navBtn('client-job', 'Client Detail')}
          {navBtn('client-shortlist', 'Shortlist')}
        </ModuleSubNav>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          {currentScreen === 'dashboard' && <TA01Dashboard onNavigateToJobs={() => setCurrentScreen('jobs')} onNavigateToCandidates={() => setCurrentScreen('candidates')} />}
          {currentScreen === 'jobs' && <TA02JobsList onJobClick={(job) => { setSelectedJob(job); setCurrentScreen('job-detail'); }} onCreate={() => setShowJobDrawer(true)} onPipelineView={() => setCurrentScreen('pipeline')} />}
          {currentScreen === 'pipeline' && <TA03JobsPipeline />}
          {currentScreen === 'job-detail' && selectedJob && <JobDetail job={selectedJob} onBack={() => setCurrentScreen('jobs')} onAddCandidate={() => setShowAddToJobModal(true)} onScheduleInterview={() => setShowInterviewModal(true)} />}
          {currentScreen === 'candidates' && <CandidatesList onCandidateClick={(c) => { setSelectedCandidate(c); setCurrentScreen('candidate-detail'); }} onCreate={() => setShowCandidateDrawer(true)} />}
          {currentScreen === 'candidate-detail' && selectedCandidate && <CandidateDetail candidate={selectedCandidate} onBack={() => setCurrentScreen('candidates')} />}
          {currentScreen === 'referrals' && <ReferralPortal />}
          {currentScreen === 'client-portal' && <ClientPortalJobs onJobClick={() => setCurrentScreen('client-job')} />}
          {currentScreen === 'client-job' && <ClientJobDetail onShortlistClick={() => setCurrentScreen('client-shortlist')} />}
          {currentScreen === 'client-shortlist' && <ClientShortlistView onFeedbackSubmit={() => setShowClientFeedbackModal(true)} />}
        </motion.div>
      </AnimatePresence>

      <JobDrawer isOpen={showJobDrawer} onClose={() => setShowJobDrawer(false)} />
      <CandidateDrawer isOpen={showCandidateDrawer} onClose={() => setShowCandidateDrawer(false)} />
      <AddToJobModal isOpen={showAddToJobModal} onClose={() => setShowAddToJobModal(false)} />
      <InterviewModal isOpen={showInterviewModal} onClose={() => setShowInterviewModal(false)} />
      <ClientFeedbackModal isOpen={showClientFeedbackModal} onClose={() => setShowClientFeedbackModal(false)} />
    </div>
  );
}

// TA-04: Job Detail
function JobDetail({ job, onBack, onAddCandidate, onScheduleInterview }: any) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Candidates', value: 'candidates' },
    { label: 'Shortlist', value: 'shortlist' },
    { label: 'Interviews', value: 'interviews' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
    { label: 'Settings', value: 'settings' },
  ];

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Back to Jobs
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">{job.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{job.client}</span>
            <span>•</span>
            <span>{job.type}</span>
            <span>•</span>
            <span>{job.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BonsaiStatusPill status="pending" label={job.stage} />
          <BonsaiButton variant="ghost" size="sm">Edit</BonsaiButton>
        </div>
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && <JobOverview job={job} />}
        {activeTab === 'candidates' && <JobCandidatesPipeline onAddCandidate={onAddCandidate} />}
        {activeTab === 'shortlist' && <JobShortlist />}
        {activeTab === 'interviews' && <JobInterviews onSchedule={onScheduleInterview} />}
        {activeTab === 'activity' && <JobActivity />}
        {activeTab === 'documents' && <JobDocuments />}
        {activeTab === 'settings' && <JobSettings />}
      </div>
    </div>
  );
}

function JobOverview(_props: { job: unknown }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HubStatTile label="Total candidates" value="8" sub="In pipeline" delay={0} />
        <HubStatTile label="Shortlisted" value="3" sub="With client" delay={0.05} />
        <HubStatTile label="Interviews" value="2" sub="Scheduled" delay={0.1} />
      </div>

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-4">Job Description</h3>
        <p className="text-sm text-foreground/90 mb-4">
          We're seeking a Senior React Developer to join our growing engineering team. 
          The ideal candidate has 5+ years of experience with modern React, TypeScript, 
          and has shipped production applications at scale.
        </p>
        <h4 className="font-medium text-foreground mb-2">Requirements:</h4>
        <ul className="list-disc list-inside text-sm text-foreground/90 space-y-1">
          <li>5+ years React experience</li>
          <li>Strong TypeScript skills</li>
          <li>Experience with state management (Redux, Zustand)</li>
          <li>Remote-first culture fit</li>
        </ul>
      </div>
    </div>
  );
}

// TA-10: Candidate Pipeline (inside Job)
function JobCandidatesPipeline({ onAddCandidate }: any) {
  const stages = [
    { name: 'Added', candidates: [{ id: '1', name: 'Alice Chen' }] },
    { name: 'Screened', candidates: [{ id: '2', name: 'Bob Smith' }, { id: '3', name: 'Carol Lee' }] },
    { name: 'Submitted', candidates: [{ id: '4', name: 'David Kim' }] },
    { name: 'Interviewing', candidates: [{ id: '5', name: 'Eve Martinez' }] },
    { name: 'Offer', candidates: [] },
    { name: 'Placed', candidates: [] },
    { name: 'Rejected', candidates: [{ id: '6', name: 'Frank Wilson' }] },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Candidate pipeline by application stage</p>
        <BonsaiButton size="sm" icon={<Plus />} onClick={onAddCandidate}>
          Add Candidate
        </BonsaiButton>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.name} className="flex-shrink-0 w-64">
            <div className="bg-secondary rounded-t-lg px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">{stage.name}</h3>
              <span className="text-xs font-medium text-muted-foreground bg-border px-2 py-1 rounded-full">
                {stage.candidates.length}
              </span>
            </div>
            <div className="bg-muted/50 rounded-b-lg p-3 min-h-[300px] space-y-2">
              {stage.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="hub-surface hub-surface-elevated p-3 cursor-move hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-foreground text-sm">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Senior Developer</p>
                </div>
              ))}
              {stage.candidates.length === 0 && (
                <p className="text-center text-xs text-muted-foreground/70 py-6">No candidates</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobShortlist() {
  return (
    <div className="hub-surface hub-surface-elevated p-6">
      <h3 className="font-semibold text-foreground mb-4">Shortlisted Candidates</h3>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Candidate {i}</p>
              <p className="text-sm text-muted-foreground">Shared with client • Awaiting feedback</p>
            </div>
            <BonsaiButton size="sm" variant="ghost">View</BonsaiButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobInterviews({ onSchedule }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Scheduled Interviews</h3>
        <BonsaiButton size="sm" icon={<Calendar />} onClick={onSchedule}>
          Schedule Interview
        </BonsaiButton>
      </div>
      <div className="hub-surface hub-surface-elevated p-6">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">Alice Chen - Technical Interview</p>
                  <p className="text-sm text-muted-foreground mt-1">Jan 20, 2026 at 2:00 PM</p>
                </div>
                <BonsaiStatusPill status="pending" label="Scheduled" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobActivity() {
  const activityItems = [
    {
      id: '1',
      title: 'Candidate moved to Interviewing',
      description: 'Eve Martinez moved from Submitted to Interviewing',
      timestamp: '2 hours ago',
      user: { name: 'System' },
    },
    {
      id: '2',
      title: 'Client feedback received',
      description: 'Tech Startup Inc approved Alice Chen',
      timestamp: '1 day ago',
      user: { name: 'Client' },
    },
  ];

  return (
    <div className="hub-surface hub-surface-elevated p-6">
      <BonsaiTimeline items={activityItems} />
    </div>
  );
}

function JobDocuments() {
  return (
    <div className="hub-surface hub-surface-elevated p-6 text-center text-muted-foreground">
      No documents attached
    </div>
  );
}

function JobSettings() {
  return (
    <div className="hub-surface hub-surface-elevated p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-4">Client Visibility</h3>
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
          <span className="text-sm text-foreground/90">Share job with client portal</span>
        </label>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-4">Shortlist Visibility Rules</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Show candidate names</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Show candidate resumes</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Show contact information</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Job Owner</h3>
        <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
          <option>John Doe (Recruiter)</option>
          <option>Jane Smith (Talent Manager)</option>
        </select>
      </div>
    </div>
  );
}

// TA-06: Candidates List
function CandidatesList({ onCandidateClick, onCreate }: any) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const candidates = [
    { id: '1', name: 'Alice Chen', role: 'Senior Frontend Developer', location: 'San Francisco', experience: '8 years', status: 'Active' },
    { id: '2', name: 'Bob Smith', role: 'Backend Engineer', location: 'New York', experience: '6 years', status: 'Active' },
    { id: '3', name: 'Carol Lee', role: 'Full Stack Developer', location: 'Remote', experience: '10 years', status: 'Placed' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Talent Pool</h1>
          <p className="text-sm text-muted-foreground">Browse and manage candidates</p>
        </div>
        <div className="flex items-center gap-2">
          <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
            Add Candidate
          </BonsaiButton>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="hub-surface hub-surface-elevated p-4">
          <p className="text-sm text-muted-foreground">Total Candidates</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{candidates.length}</p>
        </div>
        <div className="hub-surface hub-surface-elevated p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-semibold text-muted-foreground mt-1">2</p>
        </div>
        <div className="hub-surface hub-surface-elevated p-4">
          <p className="text-sm text-muted-foreground">In Process</p>
          <p className="text-2xl font-semibold text-muted-foreground mt-1">0</p>
        </div>
        <div className="hub-surface hub-surface-elevated p-4">
          <p className="text-sm text-muted-foreground">Placed</p>
          <p className="text-2xl font-semibold text-primary mt-1">1</p>
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Filters</h3>
        <div className="grid grid-cols-5 gap-4">
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Skills</option>
            <option>React</option>
            <option>TypeScript</option>
          </select>
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Locations</option>
            <option>Remote</option>
            <option>San Francisco</option>
          </select>
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Availability</option>
            <option>Available</option>
            <option>Busy</option>
          </select>
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Seniority</option>
            <option>Senior</option>
            <option>Mid-level</option>
          </select>
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Status</option>
            <option>Active</option>
            <option>Placed</option>
          </select>
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="divide-y divide-border">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => onCandidateClick(candidate)}
              className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.role} • {candidate.experience} • {candidate.location}</p>
                </div>
                <BonsaiStatusPill status={candidate.status === 'Active' ? 'active' : 'draft'} label={candidate.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// TA-07: Candidate Detail
function CandidateDetail({ candidate, onBack }: any) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Applications', value: 'applications' },
    { label: 'Activity', value: 'activity' },
    { label: 'Documents', value: 'documents' },
    { label: 'GDPR', value: 'gdpr' },
  ];

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Back to Candidates
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">{candidate.name}</h1>
          <p className="text-foreground/90">{candidate.role}</p>
          <p className="text-sm text-muted-foreground">{candidate.experience} • {candidate.location}</p>
        </div>
        <BonsaiButton variant="ghost" size="sm">Edit</BonsaiButton>
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {['React', 'TypeScript', 'Node.js', 'GraphQL'].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
            <h3 className="font-semibold text-foreground mb-2">Summary</h3>
            <p className="text-sm text-foreground/90">
              Experienced frontend developer with a passion for building scalable web applications.
            </p>
          </div>
        )}
        {activeTab === 'applications' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <p className="text-sm text-muted-foreground">Applied to 2 jobs</p>
          </div>
        )}
        {activeTab === 'gdpr' && (
          <div className="hub-surface hub-surface-elevated p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Data Privacy</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage candidate data and privacy settings</p>
              <div className="flex gap-3">
                <BonsaiButton size="sm" variant="ghost" icon={<FileText />}>
                  Export Data
                </BonsaiButton>
                <BonsaiButton size="sm" variant="ghost" icon={<Shield />}>
                  Do Not Contact
                </BonsaiButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// TA-14: Referral Portal
function ReferralPortal() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Employee Referral Portal</h1>
      
      <div className="hub-surface hub-surface-elevated p-6 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Submit a Referral</h3>
        <div className="space-y-4">
          <BonsaiInput label="Candidate Name" placeholder="Jane Doe" />
          <BonsaiInput label="Email" type="email" placeholder="jane@example.com" />
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Job Position</label>
            <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
              <option>Senior React Developer</option>
              <option>UX Designer</option>
            </select>
          </div>
          <BonsaiButton>Submit Referral</BonsaiButton>
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-4">My Referrals</h3>
        <div className="space-y-3">
          <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">John Smith</p>
              <p className="text-sm text-muted-foreground">Senior React Developer • Submitted Jan 15</p>
            </div>
            <BonsaiStatusPill status="pending" label="Under Review" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Client Portal Components
function ClientPortalJobs({ onJobClick }: any) {
  return (
    <div className="p-8 bg-secondary min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Your Staffing Positions</h1>
        <p className="text-sm text-foreground/90">Client Portal</p>
      </div>

      <div className="hub-surface hub-surface-elevated border-primary/25 p-6">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <button
              key={i}
              onClick={onJobClick}
              className="w-full p-4 bg-secondary rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <h3 className="font-semibold text-foreground">Senior React Developer</h3>
              <p className="text-sm text-foreground/90 mt-1">3 candidates in shortlist • 2 interviews scheduled</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientJobDetail({ onShortlistClick }: any) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Shortlist', value: 'shortlist' },
    { label: 'Interviews', value: 'interviews' },
    { label: 'Documents', value: 'documents' },
    { label: 'Updates', value: 'updates' },
  ];

  return (
    <div className="p-8 bg-secondary min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Senior React Developer</h1>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="hub-surface hub-surface-elevated border-primary/25 p-6">
            <h3 className="font-semibold text-foreground mb-2">Job Description</h3>
            <p className="text-sm text-muted-foreground">Full job details and requirements...</p>
          </div>
        )}
        {activeTab === 'shortlist' && (
          <div>
            <button
              onClick={onShortlistClick}
              className="w-full hub-surface hub-surface-elevated border-primary/25 p-6 hover:bg-secondary transition-colors text-left"
            >
              <h3 className="font-semibold text-foreground">View Shortlisted Candidates (3)</h3>
              <p className="text-sm text-foreground/90 mt-1">Review and provide feedback</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// CPT-03: Client Shortlist View
function ClientShortlistView({ onFeedbackSubmit }: any) {
  const [feedback, setFeedback] = useState<{[key: string]: 'approved' | 'rejected' | null}>({});

  const candidates = [
    { id: '1', name: 'Alice Chen', role: 'Senior Frontend Developer', experience: '8 years' },
    { id: '2', name: 'Bob Smith', role: 'Full Stack Engineer', experience: '6 years' },
    { id: '3', name: 'Carol Lee', role: 'React Specialist', experience: '10 years' },
  ];

  const handleFeedback = (id: string, decision: 'approved' | 'rejected') => {
    setFeedback({ ...feedback, [id]: decision });
    alert(`Candidate ${decision}!\n\nFeedback will be shared with recruiter.\nActivity entry created in internal system.`);
  };

  return (
    <div className="p-8 bg-secondary min-h-screen">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Shortlisted Candidates</h1>

      <div className="grid grid-cols-1 gap-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="hub-surface hub-surface-elevated border-primary/25 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                <p className="text-sm text-foreground/90">{candidate.role} • {candidate.experience}</p>
              </div>
              {feedback[candidate.id] && (
                <BonsaiStatusPill
                  status={feedback[candidate.id] === 'approved' ? 'active' : 'cancelled'}
                  label={feedback[candidate.id] === 'approved' ? 'Approved' : 'Rejected'}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <BonsaiButton size="sm" variant="ghost" icon={<FileText />}>
                View Resume
              </BonsaiButton>
              {!feedback[candidate.id] && (
                <>
                  <BonsaiButton
                    size="sm"
                    variant="ghost"
                    icon={<CheckCircle />}
                    onClick={() => handleFeedback(candidate.id, 'approved')}
                  >
                    Approve
                  </BonsaiButton>
                  <BonsaiButton
                    size="sm"
                    variant="ghost"
                    icon={<XCircle />}
                    onClick={() => handleFeedback(candidate.id, 'rejected')}
                  >
                    Reject
                  </BonsaiButton>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Drawers and Modals
function JobDrawer({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <aside
        className="relative z-10 flex h-full w-full max-w-2xl flex-col hub-modal-solid border-l border-border shadow-modal overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Create Job</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 bg-background-2 p-6">
          <BonsaiInput label="Job Title" required placeholder="Senior React Developer" />
          <BonsaiInput label="Client" required placeholder="Select client" />
          <div className="grid grid-cols-2 gap-4">
            <BonsaiInput label="Type" placeholder="Full-time" />
            <BonsaiInput label="Location" placeholder="Remote" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
            <textarea rows={6} className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35" />
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
            <BonsaiButton variant="primary">Create Job</BonsaiButton>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CandidateDrawer({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <aside
        className="relative z-10 flex h-full w-full max-w-2xl flex-col hub-modal-solid border-l border-border shadow-modal overflow-y-auto"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Add Candidate</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 bg-background-2 p-6">
          <div className="grid grid-cols-2 gap-4">
            <BonsaiInput label="First Name" required />
            <BonsaiInput label="Last Name" required />
          </div>
          <BonsaiInput label="Email" type="email" required />
          <BonsaiInput label="Current Role" />
          <BonsaiInput label="Years of Experience" type="number" />
          <BonsaiInput label="Location" />
          <BonsaiInput label="Skills (comma-separated)" placeholder="React, TypeScript, Node.js" />
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
            <BonsaiButton variant="primary">Add Candidate</BonsaiButton>
          </div>
        </div>
      </aside>
    </div>
  );
}

// TA-09: Add to Job Modal
function AddToJobModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border hub-modal-solid shadow-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Add Candidate to Job</h2>
        </div>
        <div className="space-y-4 bg-background-2 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Select Job</label>
            <select className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/35">
              <option>Senior React Developer - Tech Startup Inc</option>
              <option>UX Designer - Acme Corporation</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Initial Stage</label>
            <select className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/35">
              <option>Added</option>
              <option>Screened</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Notes (optional)</label>
            <textarea rows={3} className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
          <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton variant="primary" onClick={() => { alert('Candidate added to job!'); onClose(); }}>
            Add to Job
          </BonsaiButton>
        </div>
      </div>
    </div>
  );
}

// TA-11: Interview Modal
function InterviewModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border hub-modal-solid max-h-[min(90vh,640px)] flex flex-col shadow-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Schedule Interview</h2>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-background-2 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Candidate</label>
            <select className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/35">
              <option>Alice Chen</option>
              <option>Bob Smith</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Interview Type</label>
            <select className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/35">
              <option>Phone Screen</option>
              <option>Technical Interview</option>
              <option>Final Interview</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <BonsaiInput label="Date" type="date" />
            <BonsaiInput label="Time" type="time" />
          </div>
          <BonsaiInput label="Duration (minutes)" type="number" defaultValue="60" />
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Interviewer(s)</label>
            <input type="text" placeholder="John Doe, Jane Smith" className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/35" />
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
          <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton variant="primary" onClick={() => { alert('Interview scheduled!'); onClose(); }}>
            Schedule Interview
          </BonsaiButton>
        </div>
      </div>
    </div>
  );
}

function ClientFeedbackModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border hub-modal-solid shadow-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-background-2 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">Client Feedback</h2>
        </div>
        <div className="bg-background-2 p-6">
          <p className="mb-4 text-sm text-muted-foreground">Feedback captured from client portal</p>
          <div className="rounded-lg border border-border bg-[color:var(--success-muted)] p-4">
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Client approved Alice Chen</strong><br />
              Comment: &quot;Great technical skills, good culture fit&quot;
            </p>
          </div>
        </div>
        <div className="flex justify-end border-t border-border bg-background-2 px-6 py-4">
          <BonsaiButton variant="primary" onClick={onClose}>Close</BonsaiButton>
        </div>
      </div>
    </div>
  );
}
