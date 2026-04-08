import { NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../../lib/supabase/admin';

/**
 * POST /api/admin/seed
 * Seeds the database with realistic test data for all modules.
 * Requires HUB_BYPASS_AUTH=1 or admin role.
 * Idempotent: clears org data then re-inserts.
 */

/* ── Fixed UUIDs for referential integrity ── */
const ORG_ID = process.env.HUB_DEV_ORG_ID || '00000000-0000-0000-0000-000000000001';
const USER_ID = process.env.HUB_DEV_USER_ID || '00000000-0000-0000-0000-000000000099';

export async function POST() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const db = getSupabaseAdmin();
  const orgId = ORG_ID;

  try {
    // ── Step 0: Ensure organization exists (FK target for all tables) ──
    await db.from('organizations').upsert(
      { id: orgId, name: 'Operations Hub Demo' },
      { onConflict: 'id' }
    );

    // ── Step 1: Clean existing org data (reverse dependency order) ──
    const tables = [
      'activity_log', 'form_responses', 'time_entries', 'timesheets',
      'candidates', 'referrals', 'meetings', 'notifications',
      'support_tickets', 'expenses', 'invoices', 'issues', 'tasks',
      'approvals', 'jobs', 'forms', 'projects', 'proposals',
      'contracts', 'deals', 'contacts', 'people', 'clients',
    ];
    for (const t of tables) {
      await db.from(t).delete().eq('org_id', orgId);
    }

    // ── Step 2: Clients ──
    const clientsData = [
      { id: 'c0000000-0001-0000-0000-000000000001', org_id: orgId, name: 'Acme Corp', billing_address: { street: '100 Market St', city: 'San Francisco', state: 'CA', zip: '94105', country: 'US' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000002', org_id: orgId, name: 'Tech Startup Inc', billing_address: { street: '55 Broadway', city: 'New York', state: 'NY', zip: '10006', country: 'US' }, payment_terms: 'Net 15' },
      { id: 'c0000000-0001-0000-0000-000000000003', org_id: orgId, name: 'Local Retail Co', billing_address: { street: '789 Oak Ave', city: 'Austin', state: 'TX', zip: '73301', country: 'US' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000004', org_id: orgId, name: 'Global Finance Ltd', billing_address: { street: '1 Canary Wharf', city: 'London', country: 'UK' }, payment_terms: 'Net 45' },
      { id: 'c0000000-0001-0000-0000-000000000005', org_id: orgId, name: 'Zenith Healthcare', billing_address: { street: '200 Wellness Blvd', city: 'Chicago', state: 'IL', zip: '60601', country: 'US' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000006', org_id: orgId, name: 'Nordic Design Studio', billing_address: { street: '15 Drottninggatan', city: 'Stockholm', country: 'SE' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000007', org_id: orgId, name: 'Pacific Media Group', billing_address: { street: '88 Sunset Blvd', city: 'Los Angeles', state: 'CA', zip: '90028', country: 'US' }, payment_terms: 'Net 15' },
      { id: 'c0000000-0001-0000-0000-000000000008', org_id: orgId, name: 'Quantum AI Labs', billing_address: { street: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'CA', zip: '94043', country: 'US' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000009', org_id: orgId, name: 'Atlas Construction', billing_address: { street: '321 Builder Lane', city: 'Denver', state: 'CO', zip: '80202', country: 'US' }, payment_terms: 'Net 45' },
      { id: 'c0000000-0001-0000-0000-000000000010', org_id: orgId, name: 'Emerald Education', billing_address: { street: '400 Campus Drive', city: 'Boston', state: 'MA', zip: '02101', country: 'US' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000011', org_id: orgId, name: 'Sapphire Logistics', billing_address: { street: '500 Harbor Way', city: 'Seattle', state: 'WA', zip: '98101', country: 'US' }, payment_terms: 'Net 30' },
      { id: 'c0000000-0001-0000-0000-000000000012', org_id: orgId, name: 'Crimson Sports Agency', billing_address: { street: '777 Arena Blvd', city: 'Miami', state: 'FL', zip: '33101', country: 'US' }, payment_terms: 'Net 15' },
    ];
    await db.from('clients').insert(clientsData);

    // ── Step 3: Contacts ──
    const contactsData = [
      { org_id: orgId, first_name: 'Jennifer', last_name: 'Davis', email: 'jennifer.davis@acmecorp.com', phone: '+1 415-555-0101', company: 'Acme Corp', tags: ['decision-maker', 'enterprise'] },
      { org_id: orgId, first_name: 'Michael', last_name: 'Chen', email: 'michael.chen@acmecorp.com', phone: '+1 415-555-0102', company: 'Acme Corp', tags: ['technical'] },
      { org_id: orgId, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@techstartup.io', phone: '+1 212-555-0201', company: 'Tech Startup Inc', tags: ['cto', 'technical'] },
      { org_id: orgId, first_name: 'David', last_name: 'Kim', email: 'david.kim@localretail.com', phone: '+1 512-555-0301', company: 'Local Retail Co', tags: ['marketing'] },
      { org_id: orgId, first_name: 'Lisa', last_name: 'Patel', email: 'lisa.patel@globalfinance.com', phone: '+44 20-7946-0501', company: 'Global Finance Ltd', tags: ['decision-maker', 'finance'] },
      { org_id: orgId, first_name: 'Robert', last_name: 'Wilson', email: 'robert@zenithhealth.com', phone: '+1 312-555-0601', company: 'Zenith Healthcare', tags: ['procurement'] },
      { org_id: orgId, first_name: 'Emma', last_name: 'Larsson', email: 'emma@nordicdesign.se', phone: '+46 8-123-4567', company: 'Nordic Design Studio', tags: ['creative-director'] },
      { org_id: orgId, first_name: 'James', last_name: 'Thompson', email: 'james.t@pacificmedia.com', phone: '+1 310-555-0801', company: 'Pacific Media Group', tags: ['content', 'media'] },
      { org_id: orgId, first_name: 'Priya', last_name: 'Sharma', email: 'priya@quantumai.co', phone: '+1 650-555-0901', company: 'Quantum AI Labs', tags: ['ai', 'engineering'] },
      { org_id: orgId, first_name: 'Carlos', last_name: 'Rodriguez', email: 'carlos@atlasconstruction.com', phone: '+1 720-555-1001', company: 'Atlas Construction', tags: ['operations'] },
      { org_id: orgId, first_name: 'Amanda', last_name: 'Foster', email: 'amanda@emeraldedu.org', phone: '+1 617-555-1101', company: 'Emerald Education', tags: ['education'] },
      { org_id: orgId, first_name: 'Chris', last_name: 'Analytics', email: 'chris@sapphirelogistics.com', phone: '+1 206-555-1201', company: 'Sapphire Logistics', tags: ['supply-chain'] },
    ];
    await db.from('contacts').insert(contactsData);

    // ── Step 4: Deals ──
    const dealsData = [
      { org_id: orgId, title: 'Website Redesign', client_id: clientsData[0].id, value: 45000, stage: 'proposal_sent', probability: 75, close_date: '2026-05-15', description: 'Full website redesign with new brand identity for Acme Corp' },
      { org_id: orgId, title: 'Mobile App Development', client_id: clientsData[1].id, value: 120000, stage: 'negotiation', probability: 60, close_date: '2026-06-30', description: 'Cross-platform mobile app for Tech Startup' },
      { org_id: orgId, title: 'Brand Identity Package', client_id: clientsData[2].id, value: 25000, stage: 'qualified', probability: 40, close_date: '2026-04-30', description: 'Complete brand refresh including logo, typography, and guidelines' },
      { org_id: orgId, title: 'Data Analytics Platform', client_id: clientsData[3].id, value: 85000, stage: 'discovery', probability: 30, close_date: '2026-07-31', description: 'Custom analytics dashboard and reporting platform' },
      { org_id: orgId, title: 'Patient Portal', client_id: clientsData[4].id, value: 95000, stage: 'proposal_sent', probability: 65, close_date: '2026-06-15', description: 'HIPAA-compliant patient portal with telehealth features' },
      { org_id: orgId, title: 'E-commerce Migration', client_id: clientsData[5].id, value: 55000, stage: 'lead', probability: 20, close_date: '2026-08-15', description: 'Migrate existing store to modern headless commerce stack' },
      { org_id: orgId, title: 'Content Management System', client_id: clientsData[6].id, value: 38000, stage: 'won', probability: 100, close_date: '2026-03-01', description: 'Custom CMS for media publishing workflow' },
      { org_id: orgId, title: 'AI Chatbot Integration', client_id: clientsData[7].id, value: 72000, stage: 'negotiation', probability: 80, close_date: '2026-05-01', description: 'RAG-powered support chatbot with knowledge base integration' },
    ];
    await db.from('deals').insert(dealsData);

    // ── Step 4b: Proposals ──
    const proposalsData = [
      { org_id: orgId, title: 'Website Redesign Proposal', status: 'sent', value: 45000, sent_date: '2026-03-10' },
      { org_id: orgId, title: 'Mobile App — Statement of Work', status: 'draft', value: 120000 },
      { org_id: orgId, title: 'Patient Portal Discovery', status: 'accepted', value: 25000, sent_date: '2026-02-20' },
      { org_id: orgId, title: 'AI Chatbot POC Proposal', status: 'sent', value: 72000, sent_date: '2026-03-25' },
    ];
    await db.from('proposals').insert(proposalsData);

    // ── Step 4c: Contracts ──
    const contractsData = [
      { org_id: orgId, client_id: clientsData[0].id, title: 'Acme Corp — MSA 2026', status: 'signed', value: 100000, signed_date: '2026-01-10' },
      { org_id: orgId, client_id: clientsData[1].id, title: 'Tech Startup — Development Contract', status: 'draft', value: 120000 },
      { org_id: orgId, client_id: clientsData[6].id, title: 'Pacific Media — CMS Support', status: 'signed', value: 38000, signed_date: '2025-10-01' },
      { org_id: orgId, client_id: clientsData[7].id, title: 'Quantum AI — Chatbot Implementation', status: 'sent', value: 72000 },
    ];
    await db.from('contracts').insert(contractsData);

    // ── Step 5: Projects ──
    const projectsData = [
      { id: 'a0000000-0001-0000-0000-000000000001', org_id: orgId, client_id: clientsData[0].id, name: 'Website Redesign', description: 'Full responsive website redesign for Acme Corp', status: 'active', start_date: '2026-01-15', end_date: '2026-05-15', budget_hours: 480 },
      { id: 'a0000000-0001-0000-0000-000000000002', org_id: orgId, client_id: clientsData[1].id, name: 'Mobile App Dev', description: 'Cross-platform mobile app using React Native', status: 'active', start_date: '2026-02-01', end_date: '2026-07-31', budget_hours: 960 },
      { id: 'a0000000-0001-0000-0000-000000000003', org_id: orgId, client_id: clientsData[2].id, name: 'Brand Identity', description: 'Logo, brand guidelines, and asset creation', status: 'active', start_date: '2026-01-01', end_date: '2026-04-30', budget_hours: 200 },
      { id: 'a0000000-0001-0000-0000-000000000004', org_id: orgId, client_id: clientsData[4].id, name: 'Patient Portal MVP', description: 'Phase 1 of HIPAA-compliant patient portal', status: 'planning', start_date: '2026-04-01', end_date: '2026-09-30', budget_hours: 720 },
      { id: 'a0000000-0001-0000-0000-000000000005', org_id: orgId, client_id: clientsData[6].id, name: 'Pacific CMS', description: 'Custom content management system for publishers', status: 'completed', start_date: '2025-10-01', end_date: '2026-02-28', budget_hours: 400 },
      { id: 'a0000000-0001-0000-0000-000000000006', org_id: orgId, client_id: clientsData[7].id, name: 'AI Chatbot POC', description: 'Proof of concept for RAG chatbot', status: 'active', start_date: '2026-03-01', end_date: '2026-05-31', budget_hours: 320 },
    ];
    await db.from('projects').insert(projectsData);

    // ── Step 6: Tasks ──
    const tasksData = [
      { org_id: orgId, project_id: projectsData[0].id, title: 'Review Q2 budget proposal', status: 'todo', priority: 'high', due_date: '2026-04-12', tags: ['finance', 'review'] },
      { org_id: orgId, project_id: projectsData[0].id, title: 'Homepage hero section design', status: 'in_progress', priority: 'high', due_date: '2026-04-15', tags: ['design'] },
      { org_id: orgId, project_id: projectsData[0].id, title: 'Responsive layouts testing', status: 'in_progress', priority: 'medium', due_date: '2026-04-18', tags: ['qa', 'testing'] },
      { org_id: orgId, project_id: projectsData[0].id, title: 'SEO metadata implementation', status: 'todo', priority: 'medium', due_date: '2026-04-20', tags: ['seo'] },
      { org_id: orgId, project_id: projectsData[1].id, title: 'Send SOW to Tech Startup', status: 'todo', priority: 'high', due_date: '2026-04-10', tags: ['sales'] },
      { org_id: orgId, project_id: projectsData[1].id, title: 'API integration — auth flow', status: 'in_progress', priority: 'high', due_date: '2026-04-14', tags: ['backend'] },
      { org_id: orgId, project_id: projectsData[1].id, title: 'Push notification service', status: 'todo', priority: 'medium', due_date: '2026-04-22', tags: ['backend', 'mobile'] },
      { org_id: orgId, project_id: projectsData[2].id, title: 'Logo concepts v3', status: 'done', priority: 'high', due_date: '2026-03-20', tags: ['design'] },
      { org_id: orgId, project_id: projectsData[2].id, title: 'Finalize brand guidelines', status: 'in_progress', priority: 'medium', due_date: '2026-04-25', tags: ['design', 'brand'] },
      { org_id: orgId, project_id: null, title: 'Approve timesheet — Jane S.', status: 'done', priority: 'low', due_date: '2026-04-05', tags: ['internal', 'hr'] },
      { org_id: orgId, project_id: projectsData[3].id, title: 'HIPAA compliance review', status: 'todo', priority: 'high', due_date: '2026-04-30', tags: ['compliance', 'legal'] },
      { org_id: orgId, project_id: projectsData[5].id, title: 'RAG pipeline architecture doc', status: 'in_progress', priority: 'high', due_date: '2026-04-16', tags: ['ai', 'architecture'] },
    ];
    await db.from('tasks').insert(tasksData);

    // ── Step 7: Issues ──
    const issuesData = [
      { org_id: orgId, project_id: projectsData[0].id, title: 'Mobile nav not closing on route change', type: 'bug', priority: 'high', status: 'open' },
      { org_id: orgId, project_id: projectsData[0].id, title: 'Add dark mode support', type: 'feature', priority: 'medium', status: 'in_progress' },
      { org_id: orgId, project_id: projectsData[1].id, title: 'Crash on Android 12 — camera permission', type: 'bug', priority: 'urgent', status: 'open' },
      { org_id: orgId, project_id: projectsData[1].id, title: 'Offline mode caching strategy', type: 'feature', priority: 'high', status: 'in_progress' },
      { org_id: orgId, project_id: projectsData[2].id, title: 'Color palette contrast ratio fails WCAG', type: 'bug', priority: 'medium', status: 'resolved' },
    ];
    await db.from('issues').insert(issuesData);

    // ── Step 8: People ──
    const peopleData = [
      { id: 'ae000000-0001-0000-0000-000000000001', org_id: orgId, full_name: 'John Doe', email: 'john.doe@company.com', phone: '+1 555-0123', department: 'Engineering', role: 'Senior Developer', employment_type: 'full-time', status: 'active', start_date: '2023-03-15' },
      { id: 'ae000000-0001-0000-0000-000000000002', org_id: orgId, full_name: 'Jane Smith', email: 'jane.smith@company.com', phone: '+1 555-0456', department: 'Design', role: 'Lead Designer', employment_type: 'full-time', status: 'active', start_date: '2022-08-01' },
      { id: 'ae000000-0001-0000-0000-000000000003', org_id: orgId, full_name: 'Mike Johnson', email: 'mike.johnson@company.com', phone: '+1 555-0789', department: 'Engineering', role: 'Frontend Developer', employment_type: 'full-time', status: 'active', start_date: '2024-01-10' },
      { id: 'ae000000-0001-0000-0000-000000000004', org_id: orgId, full_name: 'Sarah Lee', email: 'sarah.lee@company.com', phone: '+1 555-0321', department: 'Sales', role: 'Account Executive', employment_type: 'full-time', status: 'active', start_date: '2023-06-20' },
      { id: 'ae000000-0001-0000-0000-000000000005', org_id: orgId, full_name: 'Alex Rivera', email: 'alex.rivera@contractor.io', phone: '+1 555-0654', department: 'Engineering', role: 'DevOps Engineer', employment_type: 'contractor', status: 'active', start_date: '2025-01-05' },
      { id: 'ae000000-0001-0000-0000-000000000006', org_id: orgId, full_name: 'Emily Watson', email: 'emily.watson@company.com', phone: '+1 555-0987', department: 'HR', role: 'HR Manager', employment_type: 'full-time', status: 'active', start_date: '2021-11-01' },
      { id: 'ae000000-0001-0000-0000-000000000007', org_id: orgId, full_name: 'Daniel Park', email: 'daniel.park@company.com', phone: '+1 555-1122', department: 'Engineering', role: 'Backend Developer', employment_type: 'full-time', status: 'active', start_date: '2024-04-15' },
      { id: 'ae000000-0001-0000-0000-000000000008', org_id: orgId, full_name: 'Olivia Brown', email: 'olivia.brown@company.com', phone: '+1 555-3344', department: 'Marketing', role: 'Marketing Manager', employment_type: 'full-time', status: 'active', start_date: '2023-09-01' },
      { id: 'ae000000-0001-0000-0000-000000000009', org_id: orgId, full_name: 'Chris Taylor', email: 'chris.taylor@freelance.co', phone: '+1 555-5566', department: 'Design', role: 'UI/UX Designer', employment_type: 'freelancer', status: 'active', start_date: '2025-06-01' },
      { id: 'ae000000-0001-0000-0000-000000000010', org_id: orgId, full_name: 'Maria Garcia', email: 'maria.garcia@company.com', phone: '+1 555-7788', department: 'Finance', role: 'Financial Analyst', employment_type: 'full-time', status: 'active', start_date: '2024-02-12' },
      { id: 'ae000000-0001-0000-0000-000000000011', org_id: orgId, full_name: 'Tom Wilson', email: 'tom.wilson@company.com', phone: '+1 555-9900', department: 'Engineering', role: 'QA Engineer', employment_type: 'full-time', status: 'on_leave', start_date: '2023-07-10' },
      { id: 'ae000000-0001-0000-0000-000000000012', org_id: orgId, full_name: 'Anna Kowalski', email: 'anna.kowalski@company.com', phone: '+48 22-555-0101', department: 'Support', role: 'Support Lead', employment_type: 'full-time', status: 'active', start_date: '2022-05-15' },
    ];
    await db.from('people').insert(peopleData);

    // ── Step 9: Approvals ──
    const approvalsData = [
      { org_id: orgId, type: 'timesheet', status: 'pending', payload: { employee: 'John Doe', week: 'Week 14 — Apr 2026', hours: 42, project: 'Website Redesign' }, amount: null, due_date: '2026-04-12' },
      { org_id: orgId, type: 'timesheet', status: 'pending', payload: { employee: 'Mike Johnson', week: 'Week 14 — Apr 2026', hours: 38, project: 'Mobile App Dev' }, amount: null, due_date: '2026-04-12' },
      { org_id: orgId, type: 'timesheet', status: 'pending', payload: { employee: 'Daniel Park', week: 'Week 14 — Apr 2026', hours: 40, project: 'AI Chatbot POC' }, amount: null, due_date: '2026-04-12' },
      { org_id: orgId, type: 'leave', status: 'pending', payload: { employee: 'Jane Smith', leave_type: 'Vacation', start_date: '2026-04-21', end_date: '2026-04-25', days: 5, reason: 'Family vacation' }, amount: null, due_date: '2026-04-18' },
      { org_id: orgId, type: 'leave', status: 'approved', payload: { employee: 'Tom Wilson', leave_type: 'Medical', start_date: '2026-04-01', end_date: '2026-04-14', days: 10, reason: 'Medical leave' }, amount: null },
      { org_id: orgId, type: 'expense', status: 'pending', payload: { employee: 'Sarah Lee', description: 'Client dinner — Acme Corp', category: 'meals', receipt: true }, amount: 285.50, due_date: '2026-04-15' },
      { org_id: orgId, type: 'expense', status: 'pending', payload: { employee: 'John Doe', description: 'Conference registration — React Summit', category: 'education', receipt: true }, amount: 799.00, due_date: '2026-04-20' },
      { org_id: orgId, type: 'expense', status: 'approved', payload: { employee: 'Alex Rivera', description: 'AWS hosting — March', category: 'software', receipt: true }, amount: 1240.00 },
      { org_id: orgId, type: 'invoice', status: 'pending', payload: { invoice_number: 'INV-2026-042', client: 'Acme Corp', description: 'Q1 milestone payment' }, amount: 12400 },
    ];
    await db.from('approvals').insert(approvalsData);

    // ── Step 10: Invoices ──
    const invoicesData = [
      { org_id: orgId, client_id: clientsData[0].id, number: 'INV-2026-001', status: 'sent', issue_date: '2026-03-01', due_date: '2026-03-31', subtotal: 15000, tax: 1500, total: 16500, line_items: [{ description: 'Website Redesign — Phase 1', qty: 1, rate: 15000, amount: 15000 }] },
      { org_id: orgId, client_id: clientsData[0].id, number: 'INV-2026-042', status: 'overdue', issue_date: '2026-03-15', due_date: '2026-04-02', subtotal: 12400, tax: 0, total: 12400, line_items: [{ description: 'Q1 milestone — development', qty: 80, rate: 155, amount: 12400 }] },
      { org_id: orgId, client_id: clientsData[1].id, number: 'INV-2026-003', status: 'paid', issue_date: '2026-02-01', due_date: '2026-02-15', subtotal: 30000, tax: 3000, total: 33000, line_items: [{ description: 'Mobile App — Sprint 1-3', qty: 200, rate: 150, amount: 30000 }] },
      { org_id: orgId, client_id: clientsData[2].id, number: 'INV-2026-004', status: 'draft', issue_date: '2026-04-01', due_date: '2026-04-30', subtotal: 8500, tax: 850, total: 9350, line_items: [{ description: 'Brand Guidelines v1', qty: 1, rate: 8500, amount: 8500 }] },
      { org_id: orgId, client_id: clientsData[6].id, number: 'INV-2026-005', status: 'paid', issue_date: '2026-01-15', due_date: '2026-01-30', subtotal: 19000, tax: 1900, total: 20900, line_items: [{ description: 'CMS Development — Final payment', qty: 1, rate: 19000, amount: 19000 }] },
      { org_id: orgId, client_id: clientsData[4].id, number: 'INV-2026-006', status: 'sent', issue_date: '2026-04-05', due_date: '2026-05-05', subtotal: 25000, tax: 2500, total: 27500, line_items: [{ description: 'Patient Portal — Discovery & design', qty: 100, rate: 250, amount: 25000 }] },
      { org_id: orgId, client_id: clientsData[7].id, number: 'INV-2026-007', status: 'sent', issue_date: '2026-03-28', due_date: '2026-04-28', subtotal: 18000, tax: 0, total: 18000, line_items: [{ description: 'AI Chatbot — POC milestone 1', qty: 120, rate: 150, amount: 18000 }] },
    ];
    await db.from('invoices').insert(invoicesData);

    // ── Step 11: Expenses ──
    const expensesData = [
      { org_id: orgId, description: 'Client dinner — Acme Corp', amount: 285.50, category: 'meals', status: 'submitted', expense_date: '2026-04-02' },
      { org_id: orgId, description: 'Conference registration — React Summit', amount: 799.00, category: 'education', status: 'submitted', expense_date: '2026-04-05' },
      { org_id: orgId, description: 'AWS hosting — March', amount: 1240.00, category: 'software', status: 'approved', expense_date: '2026-03-31' },
      { org_id: orgId, description: 'Office supplies — monitors', amount: 1450.00, category: 'equipment', status: 'approved', expense_date: '2026-03-20' },
      { org_id: orgId, description: 'Figma team license', amount: 540.00, category: 'software', status: 'approved', expense_date: '2026-03-15' },
      { org_id: orgId, description: 'Travel to NYC — client meeting', amount: 620.00, category: 'travel', status: 'submitted', expense_date: '2026-04-08' },
      { org_id: orgId, description: 'Team lunch — Q1 celebration', amount: 380.00, category: 'meals', status: 'approved', expense_date: '2026-03-28' },
    ];
    await db.from('expenses').insert(expensesData);

    // ── Step 12: Jobs ──
    const jobsData = [
      { id: 'd0000000-0001-0000-0000-000000000001', org_id: orgId, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', employment_type: 'full-time', status: 'open', posted_date: '2026-03-01' },
      { id: 'd0000000-0001-0000-0000-000000000002', org_id: orgId, title: 'Product Designer', department: 'Design', location: 'San Francisco', employment_type: 'full-time', status: 'open', posted_date: '2026-03-15' },
      { id: 'd0000000-0001-0000-0000-000000000003', org_id: orgId, title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', employment_type: 'contractor', status: 'open', posted_date: '2026-03-20' },
      { id: 'd0000000-0001-0000-0000-000000000004', org_id: orgId, title: 'Marketing Coordinator', department: 'Marketing', location: 'New York', employment_type: 'full-time', status: 'closed', posted_date: '2026-01-15' },
    ];
    await db.from('jobs').insert(jobsData);

    // ── Step 13: Candidates ──
    const candidatesData = [
      { org_id: orgId, job_id: jobsData[0].id, full_name: 'Alice Chen', email: 'alice.chen@gmail.com', stage: 'shortlisted', source: 'LinkedIn', notes: 'Strong portfolio, 6 years React experience' },
      { org_id: orgId, job_id: jobsData[0].id, full_name: 'Bob Martinez', email: 'bob.m@outlook.com', stage: 'interview', source: 'Referral', notes: 'Referred by Mike Johnson, ex-Google' },
      { org_id: orgId, job_id: jobsData[0].id, full_name: 'Carol Williams', email: 'carol.w@proton.me', stage: 'applied', source: 'Career Page', notes: 'Strong backend skills, transitioning to frontend' },
      { org_id: orgId, job_id: jobsData[0].id, full_name: 'Derek Thornton', email: 'derek.t@yahoo.com', stage: 'applied', source: 'LinkedIn', notes: 'Bootcamp graduate, enthusiastic' },
      { org_id: orgId, job_id: jobsData[1].id, full_name: 'Eva Kowalski', email: 'eva.k@design.co', stage: 'shortlisted', source: 'Dribbble', notes: 'Award-winning portfolio, Figma expert' },
      { org_id: orgId, job_id: jobsData[1].id, full_name: 'Frank Nguyen', email: 'frank.n@gmail.com', stage: 'interview', source: 'Career Page', notes: '5 years product design, ex-Spotify' },
      { org_id: orgId, job_id: jobsData[2].id, full_name: 'Grace Liu', email: 'grace.liu@cloud.io', stage: 'applied', source: 'LinkedIn', notes: 'AWS certified, Terraform specialist' },
      { org_id: orgId, job_id: jobsData[2].id, full_name: 'Henry Foster', email: 'henry.f@devops.pro', stage: 'shortlisted', source: 'Referral', notes: 'Kubernetes expert, 8 years experience' },
    ];
    await db.from('candidates').insert(candidatesData);

    // ── Step 14: Timesheets & Time Entries ──
    const timesheetsData = [
      { id: 'e5000000-0001-0000-0000-000000000001', org_id: orgId, person_id: null, project_id: projectsData[0].id, week_start: '2026-03-30', status: 'submitted', total_hours: 42 },
      { id: 'e5000000-0001-0000-0000-000000000002', org_id: orgId, person_id: null, project_id: projectsData[1].id, week_start: '2026-03-30', status: 'draft', total_hours: 18 },
    ];
    await db.from('timesheets').insert(timesheetsData);

    const timeEntriesData = [
      { org_id: orgId, timesheet_id: timesheetsData[0].id, entry_date: '2026-03-30', hours: 3.5, description: 'Homepage hero section design', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[0].id, entry_date: '2026-03-31', hours: 4.0, description: 'Navigation component refactor', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[0].id, entry_date: '2026-04-01', hours: 2.0, description: 'Client review meeting + revisions', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[0].id, entry_date: '2026-04-02', hours: 5.0, description: 'Responsive layouts testing', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[0].id, entry_date: '2026-04-03', hours: 3.5, description: 'Footer section + SEO metadata', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[1].id, entry_date: '2026-03-30', hours: 2.0, description: 'API integration — auth flow', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[1].id, entry_date: '2026-03-31', hours: 1.5, description: 'Push notification architecture', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[1].id, entry_date: '2026-04-01', hours: 4.0, description: 'Database schema migrations', billable: true },
      { org_id: orgId, timesheet_id: timesheetsData[1].id, entry_date: '2026-04-02', hours: 2.0, description: 'Unit test coverage', billable: false },
      { org_id: orgId, timesheet_id: timesheetsData[1].id, entry_date: '2026-04-03', hours: 3.0, description: 'Code review + deployment', billable: true },
    ];
    await db.from('time_entries').insert(timeEntriesData);

    // ── Step 15: Notifications ──
    const notificationsData = [
      { org_id: orgId, user_id: null, title: 'Timesheet Approval Required', body: 'John Doe submitted 42 hours for Week 14', entity_type: 'approvals', read_at: null },
      { org_id: orgId, user_id: null, title: 'Invoice Overdue — INV-2026-042', body: 'Acme Corp $12,400 — 3 days past due', entity_type: 'invoices', read_at: null },
      { org_id: orgId, user_id: null, title: 'Leave Request: Jane Smith', body: 'Vacation Apr 21-25, 2026 (5 days)', entity_type: 'approvals', read_at: null },
      { org_id: orgId, user_id: null, title: 'New Deal Created', body: 'Website Redesign for Acme Corp — $45K', entity_type: 'deals', read_at: new Date(Date.now() - 3600000).toISOString() },
      { org_id: orgId, user_id: null, title: 'Project Milestone Completed', body: 'Q1 Launch milestone reached 100%', entity_type: 'projects', read_at: new Date(Date.now() - 7200000).toISOString() },
      { org_id: orgId, user_id: null, title: 'Candidate Applied', body: 'Senior React Developer role — Alice Chen', entity_type: 'candidates', read_at: new Date(Date.now() - 86400000).toISOString() },
      { org_id: orgId, user_id: null, title: 'Expense Report Submitted', body: 'Sarah Lee — Client dinner $285.50', entity_type: 'expenses', read_at: null },
      { org_id: orgId, user_id: null, title: 'New Support Ticket', body: 'Portal login issue — Jennifer Davis', entity_type: 'support_tickets', read_at: new Date(Date.now() - 172800000).toISOString() },
    ];
    await db.from('notifications').insert(notificationsData);

    // ── Step 16: Support Tickets ──
    const supportTicketsData = [
      { org_id: orgId, subject: 'Portal login not working', description: 'Getting 403 error when trying to access the client portal. Tried clearing cookies and different browsers.', priority: 'high', status: 'open' },
      { org_id: orgId, subject: 'Invoice download broken', description: 'PDF download for INV-2026-001 returns a blank page. Chrome and Firefox both affected.', priority: 'normal', status: 'in_progress' },
      { org_id: orgId, subject: 'Request: Add team member to project', description: 'Please add Daniel Park to the Website Redesign project with edit access.', priority: 'low', status: 'resolved' },
      { org_id: orgId, subject: 'Data export timeout', description: 'Trying to export contacts as CSV but it times out after 30 seconds. We have ~2000 contacts.', priority: 'normal', status: 'open' },
    ];
    await db.from('support_tickets').insert(supportTicketsData);

    // ── Step 17: Forms ──
    const formsData = [
      { org_id: orgId, title: 'Client Onboarding', status: 'active', fields: [
        { id: 'f1', label: 'Company Name', type: 'text', required: true },
        { id: 'f2', label: 'Primary Contact Email', type: 'email', required: true },
        { id: 'f3', label: 'Phone Number', type: 'text', required: false },
        { id: 'f4', label: 'Industry', type: 'select', options: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Other'], required: true },
        { id: 'f5', label: 'Project Budget Range', type: 'select', options: ['< $10K', '$10K-$50K', '$50K-$100K', '$100K+'], required: true },
        { id: 'f6', label: 'Additional Notes', type: 'textarea', required: false },
      ]},
      { id: 'b0000000-0002-0000-0000-000000000001', org_id: orgId, title: 'Employee Feedback Survey', status: 'active', fields: [
        { id: 'f1', label: 'Overall Satisfaction (1-10)', type: 'number', required: true },
        { id: 'f2', label: 'What do you enjoy most?', type: 'textarea', required: true },
        { id: 'f3', label: 'Areas for Improvement', type: 'textarea', required: false },
        { id: 'f4', label: 'Would you recommend us?', type: 'select', options: ['Yes', 'No', 'Maybe'], required: true },
      ]},
      { org_id: orgId, title: 'Vendor Registration', status: 'draft', fields: [
        { id: 'f1', label: 'Business Name', type: 'text', required: true },
        { id: 'f2', label: 'Tax ID / EIN', type: 'text', required: true },
        { id: 'f3', label: 'Address', type: 'textarea', required: true },
        { id: 'f4', label: 'Services Offered', type: 'textarea', required: true },
      ]},
      { org_id: orgId, title: 'Exit Interview', status: 'active', fields: [
        { id: 'f1', label: 'Primary reason for leaving', type: 'select', options: ['Better opportunity', 'Relocation', 'Compensation', 'Work-life balance', 'Other'], required: true },
        { id: 'f2', label: 'Detailed feedback', type: 'textarea', required: true },
      ]},
    ];
    await db.from('forms').insert(formsData);

    // ── Step 18: Meetings ──
    const meetingsData = [
      { org_id: orgId, title: 'Weekly 1:1 — John & Manager', starts_at: new Date(Date.now() + 86400000).toISOString(), duration_minutes: 30, location: 'Google Meet', notes: 'Discuss Q2 goals and project progress' },
      { org_id: orgId, title: 'Team Sync — Engineering', starts_at: new Date(Date.now() + 172800000).toISOString(), duration_minutes: 45, location: 'Zoom', notes: 'Sprint review and planning' },
      { org_id: orgId, title: 'Client Review — Acme Corp', starts_at: new Date(Date.now() + 259200000).toISOString(), duration_minutes: 60, location: 'On-site', notes: 'Present Phase 2 designs' },
      { org_id: orgId, title: 'Design Critique', starts_at: new Date(Date.now() + 345600000).toISOString(), duration_minutes: 30, location: 'Figma / Google Meet', notes: 'Review brand identity deliverables' },
    ];
    await db.from('meetings').insert(meetingsData);

    // ── Step 19: Activity Log ──
    const activityData = [
      { org_id: orgId, user_id: null, entity_type: 'projects', action: 'created', metadata: { name: 'AI Chatbot POC' } },
      { org_id: orgId, user_id: null, entity_type: 'settings', action: 'updated', metadata: { field: 'Workspace settings' } },
      { org_id: orgId, user_id: null, entity_type: 'invoices', action: 'sent', metadata: { number: 'INV-2026-001', client: 'Acme Corp' } },
      { org_id: orgId, user_id: null, entity_type: 'deals', action: 'created', metadata: { title: 'AI Chatbot Integration', value: 72000 } },
      { org_id: orgId, user_id: null, entity_type: 'people', action: 'created', metadata: { name: 'Chris Taylor', role: 'UI/UX Designer' } },
      { org_id: orgId, user_id: null, entity_type: 'support_tickets', action: 'resolved', metadata: { subject: 'Request: Add team member' } },
    ];
    await db.from('activity_log').insert(activityData);

    // ── Summary ──
    const summary = {
      clients: clientsData.length,
      contacts: contactsData.length,
      deals: dealsData.length,
      proposals: proposalsData.length,
      contracts: contractsData.length,
      projects: projectsData.length,
      tasks: tasksData.length,
      issues: issuesData.length,
      people: peopleData.length,
      approvals: approvalsData.length,
      invoices: invoicesData.length,
      expenses: expensesData.length,
      jobs: jobsData.length,
      candidates: candidatesData.length,
      timesheets: timesheetsData.length,
      time_entries: timeEntriesData.length,
      notifications: notificationsData.length,
      support_tickets: supportTicketsData.length,
      forms: formsData.length,
      meetings: meetingsData.length,
      activity_log: activityData.length,
    };

    const totalRecords = Object.values(summary).reduce((s, n) => s + n, 0);

    return NextResponse.json({
      success: true,
      message: `Seeded ${totalRecords} records across ${Object.keys(summary).length} tables`,
      org_id: orgId,
      summary,
    });
  } catch (err) {
    console.error('[POST /api/admin/seed]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seed failed' },
      { status: 500 },
    );
  }
}
