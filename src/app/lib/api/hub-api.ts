'use client';

/**
 * Hub API Client — universal data layer for all modules.
 * Every CRUD action in the UI routes through these functions.
 * They call the Next.js API routes which in turn use Supabase (service role).
 */

/* ─── Generic helpers ─────────────────────────────────────── */

async function api<T = unknown>(
  path: string,
  opts: RequestInit = {},
): Promise<{ data: T; total?: number; error?: string }> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    ...opts,
  });
  const json = await res.json();
  if (!res.ok) {
    return { data: null as unknown as T, error: json.error || `HTTP ${res.status}` };
  }
  return json;
}

type ListParams = Record<string, string | number | boolean | null | undefined>;

function qs(params: ListParams): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '' && v !== false) p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

/* ─── TASKS ───────────────────────────────────────────────── */

export interface TaskRow {
  id: string;
  org_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  project_name?: string | null;
  assignee_name?: string | null;
}

export async function listTasks(params: ListParams = {}) {
  return api<TaskRow[]>(`/api/tasks${qs(params)}`);
}

export async function getTask(id: string) {
  return api<TaskRow>(`/api/tasks/${id}`);
}

export async function createTask(body: Partial<TaskRow>) {
  return api<TaskRow>('/api/tasks', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateTask(id: string, body: Partial<TaskRow>) {
  return api<TaskRow>(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteTask(id: string) {
  return api(`/api/tasks/${id}`, { method: 'DELETE' });
}

/* ─── ISSUES ──────────────────────────────────────────────── */

export interface IssueRow {
  id: string;
  org_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  reporter_id: string | null;
  assignee_id: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string | null;
  assignee_name?: string | null;
  reporter_name?: string | null;
}

export async function listIssues(params: ListParams = {}) {
  return api<IssueRow[]>(`/api/issues${qs(params)}`);
}

export async function getIssue(id: string) {
  return api<IssueRow>(`/api/issues/${id}`);
}

export async function createIssue(body: Partial<IssueRow>) {
  return api<IssueRow>('/api/issues', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateIssue(id: string, body: Partial<IssueRow>) {
  return api<IssueRow>(`/api/issues/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteIssue(id: string) {
  return api(`/api/issues/${id}`, { method: 'DELETE' });
}

/* ─── APPROVALS ───────────────────────────────────────────── */

export interface ApprovalRow {
  id: string;
  org_id: string;
  type: string;
  requester_id: string | null;
  status: string;
  payload: Record<string, unknown>;
  amount: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  display_title?: string;
  requester_name?: string | null;
}

export async function listApprovals(params: ListParams = {}) {
  return api<ApprovalRow[]>(`/api/approvals${qs(params)}`);
}

export async function createApproval(body: Partial<ApprovalRow & { title?: string }>) {
  return api<ApprovalRow>('/api/approvals', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateApproval(id: string, body: Partial<ApprovalRow>) {
  return api<ApprovalRow>(`/api/approvals/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

/* ─── CONTACTS ────────────────────────────────────────────── */

export interface ContactRow {
  id: string;
  org_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function listContacts(params: ListParams = {}) {
  return api<ContactRow[]>(`/api/contacts${qs(params)}`);
}

export async function createContact(body: Partial<ContactRow>) {
  return api<ContactRow>('/api/contacts', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteContact(id: string) {
  return api(`/api/contacts/${id}`, { method: 'DELETE' });
}

/* ─── CLIENTS ─────────────────────────────────────────────── */

export interface ClientRow {
  id: string;
  org_id: string;
  name: string;
  billing_address: Record<string, unknown> | null;
  payment_terms: string | null;
  account_manager_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function listClients(params: ListParams = {}) {
  return api<ClientRow[]>(`/api/clients${qs(params)}`);
}

export async function createClient(body: Partial<ClientRow>) {
  return api<ClientRow>('/api/clients', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteClient(id: string) {
  return api(`/api/clients/${id}`, { method: 'DELETE' });
}

/* ─── DEALS ───────────────────────────────────────────────── */

export interface DealRow {
  id: string;
  org_id: string;
  title: string;
  client_id: string | null;
  value: number | null;
  stage: string;
  owner_id: string | null;
  close_date: string | null;
  probability: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  client_name?: string | null;
}

export async function listDeals(params: ListParams = {}) {
  return api<DealRow[]>(`/api/deals${qs(params)}`);
}

export async function createDeal(body: Partial<DealRow>) {
  return api<DealRow>('/api/deals', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateDeal(id: string, body: Partial<DealRow>) {
  return api<DealRow>(`/api/deals/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteDeal(id: string) {
  return api(`/api/deals/${id}`, { method: 'DELETE' });
}

/* ─── PROJECTS ────────────────────────────────────────────── */

export interface ProjectRow {
  id: string;
  org_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget_hours: number | null;
  created_at: string;
  updated_at: string;
  client_name?: string | null;
}

export async function listProjects(params: ListParams = {}) {
  return api<ProjectRow[]>(`/api/projects${qs(params)}`);
}

export async function createProject(body: Partial<ProjectRow>) {
  return api<ProjectRow>('/api/projects', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteProject(id: string) {
  return api(`/api/projects/${id}`, { method: 'DELETE' });
}

/* ─── INVOICES ────────────────────────────────────────────── */

export interface InvoiceRow {
  id: string;
  org_id: string;
  client_id: string | null;
  number: string | null;
  status: string;
  issue_date: string | null;
  due_date: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  line_items: unknown[];
  created_at: string;
  updated_at: string;
}

export async function listInvoices(params: ListParams = {}) {
  return api<InvoiceRow[]>(`/api/invoices${qs(params)}`);
}

export async function createInvoice(body: Record<string, unknown>) {
  return api<InvoiceRow>('/api/invoices', { method: 'POST', body: JSON.stringify(body) });
}

/* ─── EXPENSES ────────────────────────────────────────────── */

export interface ExpenseRow {
  id: string;
  org_id: string;
  description: string;
  amount: number;
  category: string | null;
  person_id: string | null;
  project_id: string | null;
  status: string;
  expense_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function listExpenses(params: ListParams = {}) {
  return api<ExpenseRow[]>(`/api/expenses${qs(params)}`);
}

export async function createExpense(body: Partial<ExpenseRow>) {
  return api<ExpenseRow>('/api/expenses', { method: 'POST', body: JSON.stringify(body) });
}

/* ─── SUPPORT TICKETS ─────────────────────────────────────── */

export interface SupportTicketRow {
  id: string;
  org_id: string;
  subject: string;
  description: string | null;
  requester_id: string | null;
  priority: string;
  status: string;
  assigned_to_id: string | null;
  created_at: string;
  updated_at: string;
  request_type?: string;
  display_title?: string;
  requester_name?: string | null;
}

export async function listSupportTickets(params: ListParams = {}) {
  return api<SupportTicketRow[]>(`/api/support-tickets${qs(params)}`);
}

export async function createSupportTicket(body: Partial<SupportTicketRow & { request_type?: string }>) {
  return api<SupportTicketRow>('/api/support-tickets', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateSupportTicket(id: string, body: Partial<SupportTicketRow>) {
  return api<SupportTicketRow>(`/api/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

/* ─── PEOPLE ──────────────────────────────────────────────── */

export interface PersonRow {
  id: string;
  org_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  role: string | null;
  employment_type: string | null;
  status: string;
  manager_id: string | null;
  start_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function listPeople(params: ListParams = {}) {
  return api<PersonRow[]>(`/api/hub/people${qs(params)}`);
}

export async function createPerson(body: Partial<PersonRow>) {
  return api<PersonRow>('/api/hub/people', { method: 'POST', body: JSON.stringify(body) });
}

export async function updatePerson(id: string, body: Partial<PersonRow>) {
  return api<PersonRow>(`/api/hub/people/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deletePerson(id: string) {
  return api(`/api/hub/people/${id}`, { method: 'DELETE' });
}

/* ─── NOTIFICATIONS ───────────────────────────────────────── */

export interface NotificationRow {
  id: string;
  org_id: string;
  user_id: string | null;
  title: string;
  body: string | null;
  read_at: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function listNotifications(params: ListParams = {}) {
  return api<NotificationRow[]>(`/api/notifications${qs(params)}`);
}

export async function markNotificationRead(id: string) {
  return api(`/api/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read_at: new Date().toISOString() }) });
}

export async function markAllNotificationsRead() {
  return api('/api/notifications/mark-all-read', { method: 'POST' });
}

/* ─── TIME ENTRIES ────────────────────────────────────────── */

export interface TimeEntryRow {
  id: string;
  org_id: string;
  timesheet_id: string | null;
  entry_date: string;
  hours: number;
  description: string | null;
  billable: boolean;
  created_at: string;
  updated_at: string;
  project_name?: string | null;
}

export async function listTimeEntries(params: ListParams = {}) {
  return api<TimeEntryRow[]>(`/api/time-entries${qs(params)}`);
}

export async function createTimeEntry(body: Partial<TimeEntryRow> & { project_id?: string }) {
  return api<TimeEntryRow>('/api/time-entries', { method: 'POST', body: JSON.stringify(body) });
}

/* ─── TIMESHEETS ──────────────────────────────────────────── */

export interface TimesheetRow {
  id: string;
  org_id: string;
  person_id: string | null;
  project_id: string | null;
  week_start: string;
  status: string;
  total_hours: number | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string | null;
  person_name?: string | null;
}

export async function listTimesheets(params: ListParams = {}) {
  return api<TimesheetRow[]>(`/api/timesheets${qs(params)}`);
}

/* ─── JOBS ────────────────────────────────────────────────── */

export interface JobRow {
  id: string;
  org_id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  status: string;
  posted_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function listJobs(params: ListParams = {}) {
  return api<JobRow[]>(`/api/jobs${qs(params)}`);
}

export async function createJob(body: Partial<JobRow>) {
  return api<JobRow>('/api/jobs', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateJob(id: string, body: Partial<JobRow>) {
  return api<JobRow>(`/api/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

/* ─── CANDIDATES ──────────────────────────────────────────── */

export interface CandidateRow {
  id: string;
  org_id: string;
  job_id: string | null;
  full_name: string;
  email: string | null;
  stage: string;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  job_title?: string | null;
}

export async function listCandidates(params: ListParams = {}) {
  return api<CandidateRow[]>(`/api/candidates${qs(params)}`);
}

export async function createCandidate(body: Partial<CandidateRow>) {
  return api<CandidateRow>('/api/candidates', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateCandidate(id: string, body: Partial<CandidateRow>) {
  return api<CandidateRow>(`/api/candidates/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

/* ─── FORMS ───────────────────────────────────────────────── */

export interface FormRow {
  id: string;
  org_id: string;
  title: string;
  fields: unknown[];
  status: string;
  created_at: string;
  updated_at: string;
}

export async function listForms(params: ListParams = {}) {
  return api<FormRow[]>(`/api/forms${qs(params)}`);
}

export async function createForm(body: Partial<FormRow>) {
  return api<FormRow>('/api/forms', { method: 'POST', body: JSON.stringify(body) });
}

export async function updateForm(id: string, body: Partial<FormRow>) {
  return api<FormRow>(`/api/forms/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

/* ─── FORM RESPONSES ──────────────────────────────────────── */

export interface FormResponseRow {
  id: string;
  org_id: string;
  form_id: string;
  values: Record<string, unknown>;
  created_at: string;
}

export async function listFormResponses(params: ListParams = {}) {
  return api<FormResponseRow[]>(`/api/forms/responses${qs(params)}`);
}

/* ─── PROPOSALS ───────────────────────────────────────────── */

export interface ProposalRow {
  id: string;
  org_id: string;
  deal_id: string | null;
  title: string;
  status: string;
  value: number | null;
  sent_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function listProposals(params: ListParams = {}) {
  return api<ProposalRow[]>(`/api/proposals${qs(params)}`);
}

export async function createProposal(body: Partial<ProposalRow>) {
  return api<ProposalRow>('/api/proposals', { method: 'POST', body: JSON.stringify(body) });
}

/* ─── MEETINGS ────────────────────────────────────────────── */

export interface MeetingRow {
  id: string;
  org_id: string;
  title: string;
  starts_at: string;
  duration_minutes: number | null;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export async function listMeetings(params: ListParams = {}) {
  return api<MeetingRow[]>(`/api/meetings${qs(params)}`);
}

/* ─── ACTIVITY LOG ────────────────────────────────────────── */

export interface ActivityLogRow {
  id: string;
  org_id: string;
  user_id: string | null;
  entity_type: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function listActivityLog(params: ListParams = {}) {
  return api<ActivityLogRow[]>(`/api/activity-log${qs(params)}`);
}

/* ─── KPI / DASHBOARD ─────────────────────────────────────── */

export interface DashboardKPI {
  revenue: number;
  billable_hours: number;
  pending_approvals: number;
  active_clients: number;
  active_projects: number;
  open_tasks: number;
}

export async function getDashboardKPI() {
  return api<DashboardKPI>('/api/kpi/dashboard');
}

/* ─── GENERIC UPDATE HELPERS ──────────────────────────────── */

export async function updateProject(id: string, body: Partial<ProjectRow>) {
  return api<ProjectRow>(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function updateInvoice(id: string, body: Partial<InvoiceRow>) {
  return api<InvoiceRow>(`/api/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function updateExpense(id: string, body: Partial<ExpenseRow>) {
  return api<ExpenseRow>(`/api/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}
