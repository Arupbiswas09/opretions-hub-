import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { jobs, candidateApplications, candidates } from './data';
import { Job, CandidateInPipeline, PipelineStage } from './types';
import { Tag } from '@/app/components/ui/tag';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Share2,
  Users,
  X,
  Clock,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

const statusVariants = {
  open: 'status-in-progress' as const,
  'on-hold': 'status-waiting' as const,
  closed: 'status-done' as const,
};

const statusLabels = {
  open: 'Open',
  'on-hold': 'On Hold',
  closed: 'Closed',
};

const priorityVariants = {
  high: 'priority-high' as const,
  medium: 'priority-medium' as const,
  low: 'priority-low' as const,
};

const pipelineStages: { stage: PipelineStage; label: string }[] = [
  { stage: 'new', label: 'New' },
  { stage: 'screening', label: 'Screening' },
  { stage: 'interview', label: 'Interview' },
  { stage: 'client-review', label: 'Client Review' },
  { stage: 'offer', label: 'Offer' },
  { stage: 'placed', label: 'Placed' },
  { stage: 'rejected', label: 'Rejected' },
];

const sourceLabels = {
  referral: 'Referral',
  linkedin: 'LinkedIn',
  'direct-application': 'Direct Application',
  'recruiter-outreach': 'Recruiter Outreach',
  agency: 'Agency',
};

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pipeline');

  const job = jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Job not found</p>
          <Button onClick={() => navigate('/recruitment')} className="mt-4">
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  // Get candidates for this job
  const jobApplications = candidateApplications.filter((app) => app.jobId === job.id);
  const candidatesInPipeline: CandidateInPipeline[] = jobApplications.map((app) => {
    const candidate = candidates.find((c) => c.id === app.candidateId);
    if (!candidate) return null;

    return {
      id: candidate.id,
      applicationId: app.id,
      candidateId: candidate.id,
      name: candidate.name,
      currentRole: candidate.currentRole,
      availability: candidate.availability,
      source: candidate.source,
      lastActivity: candidate.lastActivity,
      aiFitScore: candidate.aiFitScore,
    };
  }).filter((c): c is CandidateInPipeline => c !== null);

  const handleAddCandidate = () => {
    toast.success('Add candidate modal would open here');
  };

  const handleShareWithClient = () => {
    toast.success('Share with client modal would open here');
  };

  const handleCloseJob = () => {
    toast.success('Close job confirmation would open here');
  };

  const handleCandidateClick = (candidateId: string) => {
    navigate(`/recruitment/candidates/${candidateId}`);
  };

  const getSLAStatus = (job: Job) => {
    const percentUsed = (job.daysOpen / job.sla) * 100;
    if (percentUsed >= 90) return 'critical';
    if (percentUsed >= 70) return 'warning';
    return 'ok';
  };

  const slaStatus = getSLAStatus(job);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-8 py-4 shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/recruitment')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">{job.title}</h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{job.clientName}</span>
                  {job.projectName && (
                    <>
                      <span>•</span>
                      <span>{job.projectName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag variant={statusVariants[job.status]}>{statusLabels[job.status]}</Tag>
              <Tag variant={priorityVariants[job.priority]}>
                {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
              </Tag>
              <Tag variant="neutral">{job.contractType}</Tag>
              {slaStatus === 'critical' && <Tag variant="priority-high">SLA Critical</Tag>}
              {slaStatus === 'warning' && <Tag variant="priority-medium">SLA Warning</Tag>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAddCandidate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
            <Button variant="outline" onClick={handleShareWithClient}>
              <Share2 className="h-4 w-4 mr-2" />
              Share with Client
            </Button>
            {job.status === 'open' && (
              <Button variant="outline" onClick={handleCloseJob}>
                <X className="h-4 w-4 mr-2" />
                Close Job
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-surface">
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Job Details Card */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">Job Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div className="text-sm font-medium">{job.location}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Contract Type</div>
                      <div className="text-sm font-medium">{job.contractType}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Start Date</div>
                      <div className="text-sm font-medium">
                        {new Date(job.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Salary Range</div>
                      <div className="text-sm font-medium">{job.salaryRange}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">SLA</div>
                      <div className={`text-sm font-medium ${
                        slaStatus === 'critical' ? 'text-red-600' :
                        slaStatus === 'warning' ? 'text-amber-600' :
                        ''
                      }`}>
                        {job.daysOpen} / {job.sla} days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Recruiter</div>
                      <div className="text-sm font-medium">{job.assignedRecruiterName}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Description</div>
                  <p className="text-sm leading-relaxed">{job.description}</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Key Requirements</div>
                  <ul className="space-y-1">
                    {job.keyRequirements.map((req, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Pipeline Summary Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Pipeline Summary</h3>
              <div className="space-y-3">
                {pipelineStages.filter(stage => stage.stage !== 'rejected').map((stage) => {
                  const count = job.candidateCounts[stage.stage];
                  return (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{stage.label}</span>
                      <span className="text-sm font-semibold">{count}</span>
                    </div>
                  );
                })}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-sm text-muted-foreground">Rejected</span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {job.candidateCounts.rejected}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="feedback">Client Feedback</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="mt-6">
              {candidatesInPipeline.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No candidates in pipeline yet</p>
                    <Button onClick={handleAddCandidate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Candidate
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidatesInPipeline.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className="p-4 hover:shadow-md cursor-pointer transition-all"
                      onClick={() => handleCandidateClick(candidate.candidateId)}
                    >
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {candidate.currentRole}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Tag variant="neutral" className="text-xs">
                            {sourceLabels[candidate.source]}
                          </Tag>
                          {candidate.aiFitScore && candidate.aiFitScore >= 90 && (
                            <Tag variant="status-done" className="text-xs">
                              {candidate.aiFitScore}% Fit
                            </Tag>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Available: {candidate.availability}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="communication" className="mt-6">
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Communication timeline coming soon</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="mt-6">
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Client feedback coming soon</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Job notes coming soon</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
