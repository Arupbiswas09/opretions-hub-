'use client';
import React, { useState } from 'react';
import { useToast } from './bonsai/ToastSystem';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Send, Eye, Settings, FileText, List, Layout, CheckCircle, Upload, X, Link as LinkIcon } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiInput } from './bonsai/BonsaiFormFields';
import { StatCard } from './bonsai/StatCard';
import { EnhancedTable } from './operations/EnhancedTable';
import { moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';

type InternalScreen = 'dashboard' | 'forms-list' | 'builder' | 'preview' | 'submission-detail' | 'submissions-list';
type PortalType = 'client' | 'employee' | 'freelancer';
type PortalScreen = 'inbox' | 'fill' | 'confirmation';

export default function Forms() {
  const [view, setView] = useState<'internal' | 'portal'>('internal');
  const [internalScreen, setInternalScreen] = useState<InternalScreen>('dashboard');
  const [portalType, setPortalType] = useState<PortalType>('client');
  const [portalScreen, setPortalScreen] = useState<PortalScreen>('inbox');
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [showFormDrawer, setShowFormDrawer] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);

  const screenKey = view === 'internal' ? internalScreen : `${portalType}-${portalScreen}`;

  return (
    <div className="min-h-full">
      <div className="border-b border-border px-3 py-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button type="button" onClick={() => setView('internal')} className={moduleSubNavButtonClass(view === 'internal')}>Internal</button>
          <button type="button" onClick={() => setView('portal')} className={moduleSubNavButtonClass(view === 'portal')}>Portals</button>

          {view === 'internal' && (<>
            <ModuleSubNavDivider />
            {(['dashboard', 'forms-list', 'builder', 'preview', 'submission-detail', 'submissions-list'] as const).map(s => (
              <button key={s} type="button" onClick={() => { if (s === 'builder' && !selectedForm) setSelectedForm({ id: '1', title: 'Client Onboarding Form' }); setInternalScreen(s); }} className={moduleSubNavButtonClass(internalScreen === s)}>{s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</button>
            ))}
            <ModuleSubNavDivider />
            <button type="button" onClick={() => setShowFormDrawer(true)} className={moduleSubNavButtonClass(false)}>+ Form</button>
            <button type="button" onClick={() => setShowSendModal(true)} className={moduleSubNavButtonClass(false)}>Send</button>
            <button type="button" onClick={() => setShowMappingModal(true)} className={moduleSubNavButtonClass(false)}>Mapping</button>
          </>)}

          {view === 'portal' && (<>
            <ModuleSubNavDivider />
            {(['client', 'employee', 'freelancer'] as const).map(t => (
              <button key={t} type="button" onClick={() => setPortalType(t)} className={moduleSubNavButtonClass(portalType === t)}>{t[0].toUpperCase() + t.slice(1)}</button>
            ))}
            <ModuleSubNavDivider />
            {(['inbox', 'fill', 'confirmation'] as const).map(s => (
              <button key={s} type="button" onClick={() => setPortalScreen(s)} className={moduleSubNavButtonClass(portalScreen === s)}>{s[0].toUpperCase() + s.slice(1)}</button>
            ))}
          </>)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={screenKey} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4, pointerEvents: 'none' }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          {view === 'internal' && (<>
            {internalScreen === 'dashboard' && <FormsDashboard onNavigate={setInternalScreen} onCreate={() => setShowFormDrawer(true)} />}
            {internalScreen === 'forms-list' && <FormsList onNavigate={setInternalScreen} onCreate={() => setShowFormDrawer(true)} onFormClick={(form: any) => { setSelectedForm(form); setInternalScreen('builder'); }} />}
            {internalScreen === 'builder' && selectedForm && <FormBuilder form={selectedForm} onBack={() => setInternalScreen('forms-list')} onPreview={() => setInternalScreen('preview')} onSend={() => setShowSendModal(true)} />}
            {internalScreen === 'preview' && <FormPreview onBack={() => setInternalScreen('builder')} />}
            {internalScreen === 'submission-detail' && <SubmissionDetail onBack={() => setInternalScreen('submissions-list')} />}
            {internalScreen === 'submissions-list' && <SubmissionsList onNavigate={setInternalScreen} />}
          </>)}

          {view === 'portal' && <PortalView portalType={portalType} screen={portalScreen} onNavigate={setPortalScreen} />}
        </motion.div>
      </AnimatePresence>

      <FormDrawer isOpen={showFormDrawer} onClose={() => setShowFormDrawer(false)} />
      <SendFormModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <MappingModal isOpen={showMappingModal} onClose={() => setShowMappingModal(false)} />
    </div>
  );
}

// FM-01: Forms Dashboard
function FormsDashboard({ onNavigate, onCreate }: any) {
  return (
    <div className="px-3 py-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Forms & Intake</h1>
          <p className="text-sm text-muted-foreground">Collect information and documents from clients and team</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
          Create Form
        </BonsaiButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Forms" value="8" variant="elevated" />
        <StatCard label="Published" value="5" variant="elevated" />
        <StatCard label="Submissions (Month)" value="24" variant="elevated" />
        <StatCard label="Pending Review" value="3" variant="elevated" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hub-surface hub-surface-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Active Forms</h3>
            <button onClick={() => onNavigate('forms-list')} className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Client Onboarding Form', type: 'Client', submissions: 12 },
              { name: 'Employee Info Update', type: 'Employee', submissions: 8 },
              { name: 'Freelancer Contract', type: 'Freelancer', submissions: 4 },
            ].map((form, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground text-sm">{form.name}</p>
                  <p className="text-xs text-muted-foreground">{form.type} • {form.submissions} submissions</p>
                </div>
                <BonsaiButton size="sm" variant="ghost" icon={<Eye />}>View</BonsaiButton>
              </div>
            ))}
          </div>
        </div>

        <div className="hub-surface hub-surface-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Submissions</h3>
            <button onClick={() => onNavigate('submissions-list')} className="text-sm text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {[
              { form: 'Client Onboarding Form', submitter: 'Acme Corp', time: '2 hours ago' },
              { form: 'Employee Info Update', submitter: 'John Doe', time: '5 hours ago' },
              { form: 'Freelancer Contract', submitter: 'Sarah Johnson', time: '1 day ago' },
            ].map((sub, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground text-sm">{sub.form}</p>
                <p className="text-xs text-muted-foreground">{sub.submitter} • {sub.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// FM-02: Forms List
function FormsList({ onNavigate, onCreate, onFormClick }: any) {
  const forms = [
    { id: '1', title: 'Client Onboarding Form', recipientType: 'Client', status: 'Published', submissions: 12, created: 'Jan 10, 2026' },
    { id: '2', title: 'Employee Info Update', recipientType: 'Employee', status: 'Published', submissions: 8, created: 'Jan 5, 2026' },
    { id: '3', title: 'Project Intake Form', recipientType: 'Client', status: 'Draft', submissions: 0, created: 'Jan 15, 2026' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Forms</h1>
          <p className="text-sm text-muted-foreground">Manage intake forms and templates</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
          Create Form
        </BonsaiButton>
      </div>

      <div className="hub-surface hub-surface-elevated p-6 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search forms..."
            className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground"
          />
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Types</option>
            <option>Client</option>
            <option>Employee</option>
            <option>Freelancer</option>
          </select>
          <select className="px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <EnhancedTable
          columns={[
            { key: 'title', label: 'Form Title', sortable: true },
            { key: 'recipientType', label: 'Recipient Type', sortable: true },
            { key: 'submissions', label: 'Submissions', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'created', label: 'Created', sortable: true },
          ]}
          data={forms.map(form => ({
            ...form,
            status: (
              <BonsaiStatusPill
                status={form.status === 'Published' ? 'active' : 'draft'}
                label={form.status}
              />
            ),
          }))}
          onRowClick={(row) => onFormClick(row)}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// FM-03: Form Builder
function FormBuilder({ form, onBack, onPreview, onSend }: any) {
  const [activeTab, setActiveTab] = useState('fields');

  const tabs = [
    { label: 'Fields', value: 'fields' },
    { label: 'Logic', value: 'logic' },
    { label: 'Settings', value: 'settings' },
    { label: 'Preview', value: 'preview' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Back to Forms
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{form.title}</h1>
          <p className="text-sm text-muted-foreground">Form Builder</p>
        </div>
        <div className="flex items-center gap-2">
          <BonsaiButton variant="ghost" size="sm" icon={<Eye />} onClick={onPreview}>
            Preview
          </BonsaiButton>
          <BonsaiButton variant="ghost" size="sm" icon={<Send />} onClick={onSend}>
            Send Form
          </BonsaiButton>
          <BonsaiButton variant="primary" size="sm">
            Publish
          </BonsaiButton>
        </div>
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'fields' && <FieldsTab />}
        {activeTab === 'logic' && <LogicTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'preview' && <PreviewTab onPreview={onPreview} />}
      </div>
    </div>
  );
}

function FieldsTab() {
  const fields = [
    { id: '1', label: 'Company Name', type: 'text', required: true },
    { id: '2', label: 'Industry', type: 'select', required: false },
    { id: '3', label: 'Company Description', type: 'textarea', required: true },
    { id: '4', label: 'Incorporation Documents', type: 'file', required: true },
  ];

  return (
    <div className="hub-surface hub-surface-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Form Fields</h3>
        <BonsaiButton size="sm" icon={<Plus />}>Add Field</BonsaiButton>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{field.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:bg-border rounded">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 text-foreground/90 hover:bg-secondary rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-secondary border border-border rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Field Types:</strong> Text, Textarea, Select, Multi-select, Date, Checkbox, File Upload
        </p>
      </div>
    </div>
  );
}

function LogicTab() {
  return (
    <div className="hub-surface hub-surface-elevated p-6">
      <h3 className="font-semibold text-foreground mb-4">Conditional Logic</h3>
      <p className="text-sm text-muted-foreground">Show or hide fields based on previous answers (simple rules only)</p>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-foreground/90">No logic rules configured</p>
        <BonsaiButton size="sm" className="mt-3">Add Rule</BonsaiButton>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="hub-surface hub-surface-elevated p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-foreground mb-4">Form Settings</h3>
        <div className="space-y-4">
          <BonsaiInput label="Form Title" defaultValue="Client Onboarding Form" />
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground" defaultValue="Please complete this form to get started." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Recipient Type</label>
            <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
              <option>Client</option>
              <option>Employee</option>
              <option>Freelancer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Status</label>
            <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-4">Submission Settings</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Allow save as draft</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Send confirmation email</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Allow multiple submissions</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function PreviewTab({ onPreview }: any) {
  return (
    <div className="hub-surface hub-surface-elevated p-6 text-center">
      <FileText className="w-12 h-12 text-muted-foreground/80 mx-auto mb-4" />
      <h3 className="font-semibold text-foreground mb-2">Preview Form</h3>
      <p className="text-sm text-muted-foreground mb-4">See how this form will appear to recipients</p>
      <BonsaiButton variant="primary" icon={<Eye />} onClick={onPreview}>
        Open Full Preview
      </BonsaiButton>
    </div>
  );
}

// FM-04: Form Preview
function FormPreview({ onBack }: any) {
  return (
    <div className="mx-auto w-full max-w-3xl px-3 py-6 sm:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Back to Builder
      </button>

      <div className="hub-surface hub-surface-elevated p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Client Onboarding Form</h1>
        <p className="text-sm text-muted-foreground mb-6">Please complete this form to get started.</p>

        <div className="space-y-6">
          <BonsaiInput label="Company Name" required placeholder="Enter company name" />
          
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Industry <span className="text-foreground/90">*</span></label>
            <select className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground">
              <option>Select industry</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Company Description <span className="text-foreground/90">*</span></label>
            <textarea rows={4} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground" placeholder="Tell us about your company..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Incorporation Documents <span className="text-foreground/90">*</span></label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-muted-foreground/80 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <BonsaiButton variant="ghost">Save Draft</BonsaiButton>
            <BonsaiButton variant="primary">Submit</BonsaiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// FM-05: Submission Detail
function SubmissionDetail({ onBack }: any) {
  const [activeTab, setActiveTab] = useState('submission');

  const tabs = [
    { label: 'Submission', value: 'submission' },
    { label: 'Documents', value: 'documents' },
    { label: 'Activity', value: 'activity' },
    { label: 'Mapping', value: 'mapping' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Back to Submissions
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Client Onboarding Form</h1>
          <p className="text-sm text-muted-foreground">Submitted by Acme Corp • 2 hours ago</p>
        </div>
        <BonsaiStatusPill status="pending" label="Pending Review" />
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'submission' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Submission Answers</h3>
            <div className="space-y-4">
              {[
                { question: 'Company Name', answer: 'Acme Corporation' },
                { question: 'Industry', answer: 'Technology' },
                { question: 'Company Description', answer: 'A leading software company specializing in enterprise solutions.' },
              ].map((item, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0">
                  <p className="text-sm font-medium text-foreground/90 mb-1">{item.question}</p>
                  <p className="text-sm text-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Uploaded Documents</h3>
            <div className="space-y-2">
              <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground text-sm">incorporation-cert.pdf</p>
                    <p className="text-xs text-muted-foreground">1.2 MB</p>
                  </div>
                </div>
                <BonsaiButton size="sm" variant="ghost">Download</BonsaiButton>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Form submitted', description: 'Acme Corp completed the form', timestamp: '2 hours ago', user: { name: 'Acme Corp' } },
                { id: '2', title: 'Form sent', description: 'Sent to admin@acme.com', timestamp: '1 day ago', user: { name: 'System' } },
              ]}
            />
          </div>
        )}
        {activeTab === 'mapping' && (
          <div className="hub-surface hub-surface-elevated p-6">
            <h3 className="font-semibold text-foreground mb-4">Field Mapping</h3>
            <p className="text-sm text-muted-foreground mb-4">Answers mapped to system fields:</p>
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Company Name</p>
                  <p className="text-xs text-muted-foreground">→ Client.name</p>
                </div>
                <LinkIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Industry</p>
                  <p className="text-xs text-muted-foreground">→ Client.industry</p>
                </div>
                <LinkIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// FM-09: Submissions List
function SubmissionsList({ onNavigate }: any) {
  const submissions = [
    { id: '1', form: 'Client Onboarding Form', submitter: 'Acme Corp', submitted: '2 hours ago', status: 'Pending' },
    { id: '2', form: 'Employee Info Update', submitter: 'John Doe', submitted: '5 hours ago', status: 'Reviewed' },
    { id: '3', form: 'Freelancer Contract', submitter: 'Sarah Johnson', submitted: '1 day ago', status: 'Reviewed' },
  ];

  return (
    <div className="px-3 py-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Form Submissions</h1>

      <div className="hub-surface hub-surface-elevated">
        <EnhancedTable
          columns={[
            { key: 'form', label: 'Form', sortable: true },
            { key: 'submitter', label: 'Submitter', sortable: true },
            { key: 'submitted', label: 'Submitted', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={submissions.map(sub => ({
            ...sub,
            status: (
              <BonsaiStatusPill
                status={sub.status === 'Reviewed' ? 'completed' : 'pending'}
                label={sub.status}
              />
            ),
          }))}
          onRowClick={() => onNavigate('submission-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// Portal Views
function PortalView({ portalType, screen, onNavigate }: any) {
  const themeColors = {
    client: { bg: 'bg-secondary', border: 'border-primary/25', text: 'text-primary', accent: 'indigo' },
    employee: { bg: 'bg-secondary', border: 'border-border', text: 'text-foreground', accent: 'blue' },
    freelancer: { bg: 'bg-secondary', border: 'border-border', text: 'text-foreground', accent: 'green' },
  };

  const theme = themeColors[portalType];
  const portalName = portalType.charAt(0).toUpperCase() + portalType.slice(1);

  return (
    <div className={`min-h-screen ${theme.bg} p-8`}>
      {screen === 'inbox' && <PortalInbox portalType={portalType} theme={theme} portalName={portalName} onNavigate={onNavigate} />}
      {screen === 'fill' && <PortalFillForm portalType={portalType} theme={theme} portalName={portalName} onNavigate={onNavigate} />}
      {screen === 'confirmation' && <PortalConfirmation portalType={portalType} theme={theme} portalName={portalName} />}
    </div>
  );
}

function PortalInbox({ portalType, theme, portalName, onNavigate }: any) {
  return (
    <div>
      <h1 className={`text-2xl font-semibold ${theme.text} mb-6`}>Forms Inbox</h1>
      <p className="text-sm text-muted-foreground mb-6">{portalName} Portal</p>

      <div className={`hub-surface hub-surface-elevated rounded-lg border ${theme.border}`}>
        <div className="divide-y divide-border">
          {[
            { form: 'Client Onboarding Form', sent: '1 day ago', status: 'Pending' },
            { form: 'Project Requirements', sent: '3 days ago', status: 'Draft' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate('fill')}
              className="w-full p-6 hover:bg-[color:var(--row-hover-bg)] transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${theme.text}`}>{item.form}</h3>
                <BonsaiStatusPill
                  status={item.status === 'Draft' ? 'draft' : 'pending'}
                  label={item.status}
                />
              </div>
              <p className="text-sm text-muted-foreground">Sent {item.sent}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortalFillForm({ portalType, theme, portalName, onNavigate }: any) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => onNavigate('inbox')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        ← Back to Inbox
      </button>

      <div className={`hub-surface hub-surface-elevated rounded-lg border ${theme.border} p-8`}>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Client Onboarding Form</h1>
        <p className="text-sm text-muted-foreground mb-6">Please complete this form to get started.</p>

        <div className="space-y-6">
          <BonsaiInput label="Company Name" required placeholder="Enter company name" />
          
          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Industry <span className="text-foreground/90">*</span></label>
            <select className={`w-full px-3 py-2 bg-input-background border ${theme.border} rounded-lg text-sm text-foreground`}>
              <option>Select industry</option>
              <option>Technology</option>
              <option>Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Company Description <span className="text-foreground/90">*</span></label>
            <textarea rows={4} className={`w-full px-3 py-2 bg-input-background border ${theme.border} rounded-lg text-sm text-foreground`} placeholder="Tell us about your company..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/90 mb-2">Incorporation Documents <span className="text-foreground/90">*</span></label>
            <div className={`border-2 border-dashed ${theme.border} rounded-lg p-6 text-center`}>
              <Upload className="w-8 h-8 text-muted-foreground/80 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <BonsaiButton variant="ghost">Save Draft</BonsaiButton>
            <BonsaiButton variant="primary" onClick={() => onNavigate('confirmation')}>Submit</BonsaiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PortalConfirmation({ portalType, theme, portalName }: any) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className={`hub-surface hub-surface-elevated rounded-lg border ${theme.border} p-12`}>
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Form Submitted Successfully!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for completing the Client Onboarding Form. We've received your submission and will review it shortly.
        </p>
        <div className={`p-4 bg-muted/50 border ${theme.border} rounded-lg mb-6`}>
          <p className={`text-sm ${theme.text}`}>
            <strong>What's next?</strong><br />
            Our team will review your submission and contact you within 1-2 business days.
          </p>
        </div>
        <BonsaiButton variant="primary">Return to Dashboard</BonsaiButton>
      </div>
    </div>
  );
}

// Modals & Drawers
function FormDrawer({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
      <div
        className="absolute inset-0 hub-overlay-backdrop"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto rounded-xl rounded-r-none hub-modal-solid shadow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-drawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background-2 px-6 py-4">
          <h2 id="form-drawer-title" className="text-xl font-semibold text-foreground">Create Form</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-4 bg-background-2 p-6">
          <BonsaiInput label="Form Title" required placeholder="e.g., Client Onboarding Form" />
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={3}
              className="hub-field px-3 py-2 text-sm rounded-lg"
              placeholder="What is this form for?"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Recipient Type</label>
            <select className="hub-field px-3 py-2 text-sm rounded-lg">
              <option>Client</option>
              <option>Employee</option>
              <option>Freelancer</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
            <BonsaiButton variant="primary" onClick={async () => { try { const r = await fetch('/api/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Form', fields: [], status: 'draft' }) }); if (!r.ok) throw new Error('Failed'); } catch {} onClose(); }}>Create Form</BonsaiButton>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SendFormModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl hub-modal-solid shadow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-background-2 px-6 py-4 shrink-0">
          <h2 id="send-form-title" className="text-xl font-semibold text-foreground">Send Form</h2>
        </div>
        <div className="space-y-4 overflow-y-auto bg-background-2 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Recipient</label>
            <select className="hub-field px-3 py-2 text-sm rounded-lg">
              <option>Select recipient...</option>
              <option>Acme Corporation (Client)</option>
              <option>John Doe (Employee)</option>
              <option>Sarah Johnson (Freelancer)</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Attach to Record</label>
            <select className="hub-field px-3 py-2 text-sm rounded-lg">
              <option>Select record...</option>
              <option>Project: Website Redesign</option>
              <option>Client: Acme Corporation</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Message (optional)</label>
            <textarea
              rows={3}
              className="hub-field px-3 py-2 text-sm rounded-lg"
              placeholder="Add a message to the recipient..."
            />
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/[0.06] p-3 dark:border-border dark:bg-[color:var(--info-muted)]">
            <p className="text-sm leading-relaxed text-foreground">
              This will send an email notification and create an activity entry in the attached record.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
          <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton variant="primary" icon={<Send />} onClick={() => { onClose(); }}>
            Send Form
          </BonsaiButton>
        </div>
      </div>
    </div>
  );
}

function MappingModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[min(90vh,800px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl hub-modal-solid shadow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mapping-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border bg-background-2 px-6 py-4 shrink-0">
          <h2 id="mapping-modal-title" className="text-xl font-semibold text-foreground">Field Mapping Rules</h2>
          <p className="mt-1 text-sm text-muted-foreground">Map form fields to system fields</p>
        </div>
        <div className="space-y-4 overflow-y-auto bg-background-2 p-6">
          <div className="space-y-3">
            {[
              { formField: 'Company Name', systemField: 'Client.name' },
              { formField: 'Industry', systemField: 'Client.industry' },
              { formField: 'Company Description', systemField: 'Client.description' },
            ].map((mapping, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/40 p-4">
                <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Form field</p>
                    <p className="font-medium text-foreground">{mapping.formField}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Maps to</p>
                    <select
                      className="hub-field px-3 py-2 text-sm rounded-lg"
                      defaultValue={mapping.systemField}
                    >
                      <option value="">Don&apos;t map</option>
                      <option value="Client.name">Client.name</option>
                      <option value="Client.industry">Client.industry</option>
                      <option value="Client.description">Client.description</option>
                      <option value="Contact.name">Contact.name</option>
                      <option value="Person.name">Person.name</option>
                      <option value="Project.name">Project.name</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <BonsaiButton size="sm" icon={<Plus />}>Add Mapping</BonsaiButton>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
          <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton variant="primary" onClick={() => { onClose(); }}>
            Save Mappings
          </BonsaiButton>
        </div>
      </div>
    </div>
  );
}
