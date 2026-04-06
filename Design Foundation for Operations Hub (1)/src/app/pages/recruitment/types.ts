// Recruitment module types

export type JobStatus = 'open' | 'on-hold' | 'closed';
export type JobPriority = 'high' | 'medium' | 'low';
export type RoleType = 'tech' | 'product' | 'data' | 'design' | 'operations';
export type ContractType = 'full-time' | 'contract' | 'part-time' | 'freelance';

export type PipelineStage = 'new' | 'screening' | 'interview' | 'client-review' | 'offer' | 'placed' | 'rejected';

export type CandidateSource = 'referral' | 'linkedin' | 'direct-application' | 'recruiter-outreach' | 'agency';

export interface Job {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: JobStatus;
  priority: JobPriority;
  roleType: RoleType;
  location: string;
  contractType: ContractType;
  startDate: string;
  salaryRange: string;
  description: string;
  keyRequirements: string[];
  assignedRecruiterId: string;
  assignedRecruiterName: string;
  daysOpen: number;
  sla: number; // days
  createdAt: string;
  projectId?: string;
  projectName?: string;
  candidateCounts: {
    new: number;
    screening: number;
    interview: number;
    clientReview: number;
    offer: number;
    placed: number;
    rejected: number;
  };
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  availability: string;
  source: CandidateSource;
  skills: string[];
  experienceYears: number;
  cvUrl: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  lastActivity: string;
  applications: CandidateApplication[];
  aiSummary?: string;
  aiFitScore?: number;
  aiSuggestedQuestions?: string[];
}

export interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  stage: PipelineStage;
  appliedAt: string;
  lastUpdated: string;
  recruiterNotes: RecruiterNote[];
  clientFeedback: ClientFeedback[];
}

export interface RecruiterNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ClientFeedback {
  id: string;
  contactName: string;
  rating: 'positive' | 'neutral' | 'negative';
  feedback: string;
  createdAt: string;
}

export interface PipelineColumn {
  stage: PipelineStage;
  label: string;
  candidates: CandidateInPipeline[];
}

export interface CandidateInPipeline {
  id: string;
  applicationId: string;
  candidateId: string;
  name: string;
  currentRole: string;
  availability: string;
  source: CandidateSource;
  lastActivity: string;
  aiFitScore?: number;
}
