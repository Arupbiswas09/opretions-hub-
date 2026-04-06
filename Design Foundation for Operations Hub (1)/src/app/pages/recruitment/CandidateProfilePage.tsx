import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { candidates, candidateApplications, jobs } from './data';
import { Tag } from '@/app/components/ui/tag';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  ExternalLink,
  Sparkles,
  Share2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { toast } from 'sonner';

const sourceLabels = {
  referral: 'Referral',
  linkedin: 'LinkedIn',
  'direct-application': 'Direct Application',
  'recruiter-outreach': 'Recruiter Outreach',
  agency: 'Agency',
};

const stageLabels = {
  new: 'New',
  screening: 'Screening',
  interview: 'Interview',
  'client-review': 'Client Review',
  offer: 'Offer',
  placed: 'Placed',
  rejected: 'Rejected',
};

const stageVariants = {
  new: 'neutral' as const,
  screening: 'status-in-progress' as const,
  interview: 'status-in-progress' as const,
  'client-review': 'status-waiting' as const,
  offer: 'status-pending' as const,
  placed: 'status-done' as const,
  rejected: 'status-blocked' as const,
};

export const CandidateProfilePage: React.FC = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const candidate = candidates.find((c) => c.id === candidateId);

  if (!candidate) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Candidate not found</p>
          <Button onClick={() => navigate('/recruitment')} className="mt-4">
            Back to Recruitment
          </Button>
        </div>
      </div>
    );
  }

  const applications = candidateApplications.filter((app) => app.candidateId === candidate.id);

  const handleMoveToNextStage = () => {
    toast.success('Move to next stage functionality coming soon');
  };

  const handleReject = () => {
    toast.success('Reject candidate functionality coming soon');
  };

  const handleShareWithClient = () => {
    toast.success('Share with client modal would open here');
  };

  const handleCreateTask = () => {
    toast.success('Create task functionality coming soon');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-8 py-4 shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">{getInitials(candidate.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold">{candidate.name}</h1>
                <p className="text-sm text-muted-foreground">{candidate.currentRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Tag variant="neutral">{sourceLabels[candidate.source]}</Tag>
              <Tag variant="neutral">{candidate.availability}</Tag>
              {candidate.aiFitScore && candidate.aiFitScore >= 90 && (
                <Tag variant="status-done">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {candidate.aiFitScore}% Fit
                </Tag>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCreateTask}>
              Create Task
            </Button>
            <Button variant="outline" onClick={handleShareWithClient}>
              <Share2 className="h-4 w-4 mr-2" />
              Share with Client
            </Button>
            <Button variant="default" onClick={handleMoveToNextStage}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Move to Next Stage
            </Button>
            <Button variant="outline" onClick={handleReject}>
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-surface">
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${candidate.email}`} className="text-sm hover:underline">
                      {candidate.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{candidate.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{candidate.location}</span>
                  </div>
                  {candidate.linkedinUrl && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline text-blue-600"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {candidate.portfolioUrl && (
                    <div className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={candidate.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline text-blue-600"
                      >
                        Portfolio
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Skills & Experience */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Skills & Experience</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Experience</div>
                    <div className="text-sm font-medium">{candidate.experienceYears} years</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Analysis */}
              {candidate.aiSummary && (
                <Card className="p-6 border-blue-200 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">AI Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Summary</div>
                      <p className="text-sm leading-relaxed">{candidate.aiSummary}</p>
                    </div>
                    {candidate.aiFitScore && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Fit Score</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${candidate.aiFitScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{candidate.aiFitScore}%</span>
                        </div>
                      </div>
                    )}
                    {candidate.aiSuggestedQuestions && candidate.aiSuggestedQuestions.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Suggested Interview Questions</div>
                        <ul className="space-y-2">
                          {candidate.aiSuggestedQuestions.map((question, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span>{question}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Documents */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Documents</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Resume / CV</div>
                        <div className="text-xs text-muted-foreground">{candidate.cvUrl}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Application History */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Application History</h3>
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications yet</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => {
                      const job = jobs.find((j) => j.id === app.jobId);
                      if (!job) return null;

                      return (
                        <div
                          key={app.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/recruitment/jobs/${job.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-medium text-sm">{job.title}</div>
                              <div className="text-xs text-muted-foreground">{job.clientName}</div>
                            </div>
                            <Tag variant={stageVariants[app.stage]}>{stageLabels[app.stage]}</Tag>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                          {app.recruiterNotes.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <div className="text-xs text-muted-foreground">Latest Note:</div>
                              <div className="text-sm mt-1">
                                {app.recruiterNotes[app.recruiterNotes.length - 1].content}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Source</div>
                    <div className="text-sm font-medium">{sourceLabels[candidate.source]}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Availability</div>
                    <div className="text-sm font-medium">{candidate.availability}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Added</div>
                    <div className="text-sm font-medium">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Last Activity</div>
                    <div className="text-sm font-medium">
                      {new Date(candidate.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Active Applications */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Active Applications</h3>
                <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Jobs in pipeline</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
