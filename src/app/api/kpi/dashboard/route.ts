import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';
import { getHubOrgOr401 } from '../../../lib/hub/org';

/** GET /api/kpi/dashboard — lightweight aggregate endpoint for dashboard KPIs */
export async function GET() {
  const org = await getHubOrgOr401();
  if (org instanceof NextResponse) return org;

  const admin = getSupabaseAdmin();
  const oid = org.orgId;

  const [invoicesRes, approvalsRes, clientsRes, projectsRes, tasksRes, expensesRes, timeRes] = await Promise.all([
    admin.from('invoices').select('total, status').eq('org_id', oid),
    admin.from('approvals').select('id').eq('org_id', oid).eq('status', 'pending'),
    admin.from('clients').select('id').eq('org_id', oid),
    admin.from('projects').select('id').eq('org_id', oid).eq('status', 'active'),
    admin.from('tasks').select('id, status').eq('org_id', oid),
    admin.from('expenses').select('amount, status').eq('org_id', oid),
    admin.from('time_entries').select('hours, billable').eq('org_id', oid),
  ]);

  const revenue = (invoicesRes.data ?? [])
    .filter((i: Record<string, unknown>) => i.status === 'paid' || i.status === 'sent')
    .reduce((s: number, i: Record<string, unknown>) => s + Number(i.total ?? 0), 0);

  const billableHours = (timeRes.data ?? [])
    .filter((e: Record<string, unknown>) => e.billable)
    .reduce((s: number, e: Record<string, unknown>) => s + Number(e.hours ?? 0), 0);

  const totalExpenses = (expensesRes.data ?? [])
    .reduce((s: number, e: Record<string, unknown>) => s + Number(e.amount ?? 0), 0);

  const openTasks = (tasksRes.data ?? [])
    .filter((t: Record<string, unknown>) => t.status !== 'done' && t.status !== 'completed').length;

  return NextResponse.json({
    data: {
      revenue: Math.round(revenue),
      expenses: Math.round(totalExpenses),
      billable_hours: Math.round(billableHours),
      pending_approvals: approvalsRes.data?.length ?? 0,
      active_clients: clientsRes.data?.length ?? 0,
      active_projects: projectsRes.data?.length ?? 0,
      open_tasks: openTasks,
      total_tasks: tasksRes.data?.length ?? 0,
    },
  });
}
