import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Job, JobStatus, JobPriority, RoleType } from './types';
import { Tag } from '@/app/components/ui/tag';
import { Button } from '@/app/components/ui/button';
import { Plus, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';

interface JobsListViewProps {
  jobs: Job[];
}

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

const roleTypeLabels = {
  tech: 'Tech',
  product: 'Product',
  data: 'Data',
  design: 'Design',
  operations: 'Operations',
};

export const JobsListView: React.FC<JobsListViewProps> = ({ jobs }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<JobPriority | 'all'>('all');
  const [roleTypeFilter, setRoleTypeFilter] = useState<RoleType | 'all'>('all');
  const [recruiterFilter, setRecruiterFilter] = useState<string>('all');

  // Get unique values for filters
  const uniqueClients = useMemo(() => {
    const clients = Array.from(new Set(jobs.map((j) => j.clientName)));
    return clients.sort();
  }, [jobs]);

  const uniqueRecruiters = useMemo(() => {
    const recruiters = Array.from(new Set(jobs.map((j) => j.assignedRecruiterName)));
    return recruiters.sort();
  }, [jobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (clientFilter !== 'all' && job.clientName !== clientFilter) return false;
      if (statusFilter !== 'all' && job.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && job.priority !== priorityFilter) return false;
      if (roleTypeFilter !== 'all' && job.roleType !== roleTypeFilter) return false;
      if (recruiterFilter !== 'all' && job.assignedRecruiterName !== recruiterFilter) return false;
      return true;
    });
  }, [jobs, searchQuery, clientFilter, statusFilter, priorityFilter, roleTypeFilter, recruiterFilter]);

  const hasActiveFilters =
    searchQuery !== '' ||
    clientFilter !== 'all' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    roleTypeFilter !== 'all' ||
    recruiterFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setClientFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setRoleTypeFilter('all');
    setRecruiterFilter('all');
  };

  const handleJobClick = (jobId: string) => {
    navigate(`/recruitment/jobs/${jobId}`);
  };

  const getPipelineSummary = (job: Job) => {
    const parts: string[] = [];
    if (job.candidateCounts.screening > 0) {
      parts.push(`${job.candidateCounts.screening} Screening`);
    }
    if (job.candidateCounts.interview > 0) {
      parts.push(`${job.candidateCounts.interview} Interview`);
    }
    if (job.candidateCounts.clientReview > 0) {
      parts.push(`${job.candidateCounts.clientReview} Review`);
    }
    if (job.candidateCounts.offer > 0) {
      parts.push(`${job.candidateCounts.offer} Offer`);
    }
    return parts.length > 0 ? parts.join(' / ') : 'No active candidates';
  };

  const getSLAStatus = (job: Job) => {
    const percentUsed = (job.daysOpen / job.sla) * 100;
    if (percentUsed >= 90) return 'critical';
    if (percentUsed >= 70) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {uniqueClients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as JobStatus | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val as JobPriority | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roleTypeFilter} onValueChange={(val) => setRoleTypeFilter(val as RoleType | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recruiterFilter} onValueChange={setRecruiterFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Recruiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recruiters</SelectItem>
              {uniqueRecruiters.map((recruiter) => (
                <SelectItem key={recruiter} value={recruiter}>
                  {recruiter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {filteredJobs.length} of {jobs.length} jobs
            </span>
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Job Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Pipeline</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">SLA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Recruiter</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => {
              const slaStatus = getSLAStatus(job);

              return (
                <tr
                  key={job.id}
                  onClick={() => handleJobClick(job.id)}
                  className="border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{job.title}</div>
                      <div className="flex items-center gap-2">
                        <Tag variant="neutral" className="text-xs">
                          {roleTypeLabels[job.roleType]}
                        </Tag>
                        <span className="text-xs text-muted-foreground">{job.location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{job.clientName}</div>
                    {job.projectName && (
                      <div className="text-xs text-muted-foreground">{job.projectName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Tag variant={priorityVariants[job.priority]}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </Tag>
                  </td>
                  <td className="px-4 py-3">
                    <Tag variant={statusVariants[job.status]}>{statusLabels[job.status]}</Tag>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-muted-foreground">{getPipelineSummary(job)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${
                        slaStatus === 'critical' ? 'text-red-600' :
                        slaStatus === 'warning' ? 'text-amber-600' :
                        'text-foreground'
                      }`}>
                        {job.daysOpen} / {job.sla} days
                      </div>
                      {slaStatus === 'critical' && (
                        <Tag variant="priority-high" className="text-xs">Urgent</Tag>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{job.assignedRecruiterName}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No jobs found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
