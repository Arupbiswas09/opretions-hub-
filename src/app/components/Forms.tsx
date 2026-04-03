'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Send, Eye, Settings, FileText, List, Layout, CheckCircle, Upload, X, Link as LinkIcon } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTimeline } from './bonsai/BonsaiTimeline';
import { BonsaiInput } from './bonsai/BonsaiFormFields';
import { EnhancedTable } from './operations/EnhancedTable';

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
      <div className="px-8 py-3 border-b border-stone-100/60">
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => setView('internal')} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${view === 'internal' ? 'bg-stone-800 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>Internal</button>
          <button onClick={() => setView('portal')} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${view === 'portal' ? 'bg-stone-800 text-white font-medium shadow-sm' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>Portals</button>

          {view === 'internal' && (<>
            <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
            {(['dashboard', 'forms-list', 'builder', 'preview', 'submission-detail', 'submissions-list'] as const).map(s => (
              <button key={s} onClick={() => { if (s === 'builder' && !selectedForm) setSelectedForm({ id: '1', title: 'Client Onboarding Form' }); setInternalScreen(s); }} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${internalScreen === s ? 'bg-stone-100 text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>{s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</button>
            ))}
            <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
            <button onClick={() => setShowFormDrawer(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">+ Form</button>
            <button onClick={() => setShowSendModal(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Send</button>
            <button onClick={() => setShowMappingModal(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Mapping</button>
          </>)}

          {view === 'portal' && (<>
            <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
            {(['client', 'employee', 'freelancer'] as const).map(t => (
              <button key={t} onClick={() => setPortalType(t)} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${portalType === t ? 'bg-stone-100 text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>{t[0].toUpperCase() + t.slice(1)}</button>
            ))}
            <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
            {(['inbox', 'fill', 'confirmation'] as const).map(s => (
              <button key={s} onClick={() => setPortalScreen(s)} className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${portalScreen === s ? 'bg-stone-100 text-stone-800 font-medium' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'}`}>{s[0].toUpperCase() + s.slice(1)}</button>
            ))}
          </>)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={screenKey} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Forms & Intake</h1>
          <p className="text-sm text-stone-500">Collect information and documents from clients and team</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
          Create Form
        </BonsaiButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <p className="text-sm text-stone-600 mb-1">Total Forms</p>
          <p className="text-3xl font-semibold text-stone-800">8</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <p className="text-sm text-stone-600 mb-1">Published</p>
          <p className="text-3xl font-semibold text-stone-600">5</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <p className="text-sm text-stone-600 mb-1">Submissions (Month)</p>
          <p className="text-3xl font-semibold text-primary">24</p>
        </div>
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <p className="text-sm text-stone-600 mb-1">Pending Review</p>
          <p className="text-3xl font-semibold text-stone-600">3</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Active Forms</h3>
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
              <div key={i} className="p-4 bg-stone-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 text-sm">{form.name}</p>
                  <p className="text-xs text-stone-600">{form.type} • {form.submissions} submissions</p>
                </div>
                <BonsaiButton size="sm" variant="ghost" icon={<Eye />}>View</BonsaiButton>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Recent Submissions</h3>
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
              <div key={i} className="p-4 bg-stone-50 rounded-lg">
                <p className="font-medium text-stone-800 text-sm">{sub.form}</p>
                <p className="text-xs text-stone-600">{sub.submitter} • {sub.time}</p>
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Forms</h1>
          <p className="text-sm text-stone-500">Manage intake forms and templates</p>
        </div>
        <BonsaiButton variant="primary" icon={<Plus />} onClick={onCreate}>
          Create Form
        </BonsaiButton>
      </div>

      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search forms..."
            className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm"
          />
          <select className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
            <option>All Types</option>
            <option>Client</option>
            <option>Employee</option>
            <option>Freelancer</option>
          </select>
          <select className="px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
            <option>All Status</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-stone-200">
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
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        ← Back to Forms
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">{form.title}</h1>
          <p className="text-sm text-stone-500">Form Builder</p>
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
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-stone-800">Form Fields</h3>
        <BonsaiButton size="sm" icon={<Plus />}>Add Field</BonsaiButton>
      </div>

      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-stone-600" />
                <div>
                  <p className="font-medium text-stone-800">{field.label}</p>
                  <p className="text-xs text-stone-600">
                    Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-stone-600 hover:bg-stone-200 rounded">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="p-2 text-stone-700 hover:bg-stone-100 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-stone-100 border border-stone-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Field Types:</strong> Text, Textarea, Select, Multi-select, Date, Checkbox, File Upload
        </p>
      </div>
    </div>
  );
}

function LogicTab() {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6">
      <h3 className="font-semibold text-stone-800 mb-4">Conditional Logic</h3>
      <p className="text-sm text-stone-600">Show or hide fields based on previous answers (simple rules only)</p>
      
      <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">No logic rules configured</p>
        <BonsaiButton size="sm" className="mt-3">Add Rule</BonsaiButton>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-stone-800 mb-4">Form Settings</h3>
        <div className="space-y-4">
          <BonsaiInput label="Form Title" defaultValue="Client Onboarding Form" />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm" defaultValue="Please complete this form to get started." />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Recipient Type</label>
            <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
              <option>Client</option>
              <option>Employee</option>
              <option>Freelancer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Status</label>
            <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
              <option>Draft</option>
              <option>Published</option>
              <option>Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-stone-800 mb-4">Submission Settings</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-stone-300 text-primary" />
            <span className="text-sm text-stone-700">Allow save as draft</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-stone-300 text-primary" />
            <span className="text-sm text-stone-700">Send confirmation email</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-primary" />
            <span className="text-sm text-stone-700">Allow multiple submissions</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function PreviewTab({ onPreview }: any) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 p-6 text-center">
      <FileText className="w-12 h-12 text-stone-400 mx-auto mb-4" />
      <h3 className="font-semibold text-stone-800 mb-2">Preview Form</h3>
      <p className="text-sm text-stone-600 mb-4">See how this form will appear to recipients</p>
      <BonsaiButton variant="primary" icon={<Eye />} onClick={onPreview}>
        Open Full Preview
      </BonsaiButton>
    </div>
  );
}

// FM-04: Form Preview
function FormPreview({ onBack }: any) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        ← Back to Builder
      </button>

      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Client Onboarding Form</h1>
        <p className="text-sm text-stone-600 mb-6">Please complete this form to get started.</p>

        <div className="space-y-6">
          <BonsaiInput label="Company Name" required placeholder="Enter company name" />
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Industry <span className="text-stone-700">*</span></label>
            <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
              <option>Select industry</option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Company Description <span className="text-stone-700">*</span></label>
            <textarea rows={4} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm" placeholder="Tell us about your company..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Incorporation Documents <span className="text-stone-700">*</span></label>
            <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm text-stone-600">Drop files here or click to upload</p>
              <p className="text-xs text-stone-500 mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200">
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
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        ← Back to Submissions
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Client Onboarding Form</h1>
          <p className="text-sm text-stone-500">Submitted by Acme Corp • 2 hours ago</p>
        </div>
        <BonsaiStatusPill status="pending" label="Pending Review" />
      </div>

      <BonsaiTabs tabs={tabs} value={activeTab} onValueChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'submission' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Submission Answers</h3>
            <div className="space-y-4">
              {[
                { question: 'Company Name', answer: 'Acme Corporation' },
                { question: 'Industry', answer: 'Technology' },
                { question: 'Company Description', answer: 'A leading software company specializing in enterprise solutions.' },
              ].map((item, i) => (
                <div key={i} className="pb-4 border-b border-stone-200 last:border-0">
                  <p className="text-sm font-medium text-stone-700 mb-1">{item.question}</p>
                  <p className="text-sm text-stone-800">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Uploaded Documents</h3>
            <div className="space-y-2">
              <div className="p-3 bg-stone-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-stone-600" />
                  <div>
                    <p className="font-medium text-stone-800 text-sm">incorporation-cert.pdf</p>
                    <p className="text-xs text-stone-600">1.2 MB</p>
                  </div>
                </div>
                <BonsaiButton size="sm" variant="ghost">Download</BonsaiButton>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <BonsaiTimeline
              items={[
                { id: '1', title: 'Form submitted', description: 'Acme Corp completed the form', timestamp: '2 hours ago', user: { name: 'Acme Corp' } },
                { id: '2', title: 'Form sent', description: 'Sent to admin@acme.com', timestamp: '1 day ago', user: { name: 'System' } },
              ]}
            />
          </div>
        )}
        {activeTab === 'mapping' && (
          <div className="bg-white rounded-lg border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Field Mapping</h3>
            <p className="text-sm text-stone-600 mb-4">Answers mapped to system fields:</p>
            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800">Company Name</p>
                  <p className="text-xs text-stone-600">→ Client.name</p>
                </div>
                <LinkIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="p-3 bg-stone-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-800">Industry</p>
                  <p className="text-xs text-stone-600">→ Client.industry</p>
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
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Form Submissions</h1>

      <div className="bg-white rounded-lg border border-stone-200">
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
                status={sub.status === 'Reviewed' ? 'active' : 'pending'}
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
    client: { bg: 'bg-stone-100', border: 'border-indigo-200', text: 'text-indigo-900', accent: 'indigo' },
    employee: { bg: 'bg-stone-100', border: 'border-stone-200', text: 'text-stone-800', accent: 'blue' },
    freelancer: { bg: 'bg-stone-100', border: 'border-stone-200', text: 'text-stone-800', accent: 'green' },
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
      <p className="text-sm text-stone-600 mb-6">{portalName} Portal</p>

      <div className={`bg-white rounded-lg border ${theme.border}`}>
        <div className={`divide-y divide-${theme.accent}-100`}>
          {[
            { form: 'Client Onboarding Form', sent: '1 day ago', status: 'Pending' },
            { form: 'Project Requirements', sent: '3 days ago', status: 'Draft' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate('fill')}
              className={`w-full p-6 hover:bg-${theme.accent}-50 transition-colors text-left`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold ${theme.text}`}>{item.form}</h3>
                <BonsaiStatusPill
                  status={item.status === 'Draft' ? 'draft' : 'pending'}
                  label={item.status}
                />
              </div>
              <p className="text-sm text-stone-600">Sent {item.sent}</p>
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
      <button onClick={() => onNavigate('inbox')} className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-800 mb-6">
        ← Back to Inbox
      </button>

      <div className={`bg-white rounded-lg border ${theme.border} p-8`}>
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Client Onboarding Form</h1>
        <p className="text-sm text-stone-600 mb-6">Please complete this form to get started.</p>

        <div className="space-y-6">
          <BonsaiInput label="Company Name" required placeholder="Enter company name" />
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Industry <span className="text-stone-700">*</span></label>
            <select className={`w-full px-3 py-2 bg-white border ${theme.border} rounded-lg text-sm`}>
              <option>Select industry</option>
              <option>Technology</option>
              <option>Finance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Company Description <span className="text-stone-700">*</span></label>
            <textarea rows={4} className={`w-full px-3 py-2 bg-white border ${theme.border} rounded-lg text-sm`} placeholder="Tell us about your company..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Incorporation Documents <span className="text-stone-700">*</span></label>
            <div className={`border-2 border-dashed ${theme.border} rounded-lg p-6 text-center`}>
              <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm text-stone-600">Drop files here or click to upload</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-200">
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
      <div className={`bg-white rounded-lg border ${theme.border} p-12`}>
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-stone-600" />
        </div>
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Form Submitted Successfully!</h1>
        <p className="text-stone-600 mb-6">
          Thank you for completing the Client Onboarding Form. We've received your submission and will review it shortly.
        </p>
        <div className={`p-4 bg-${theme.accent}-50 border ${theme.border} rounded-lg mb-6`}>
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
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-800">Create Form</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <BonsaiInput label="Form Title" required placeholder="e.g., Client Onboarding Form" />
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm" placeholder="What is this form for?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Recipient Type</label>
            <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
              <option>Client</option>
              <option>Employee</option>
              <option>Freelancer</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
            <BonsaiButton variant="primary" onClick={() => { alert('Form created!'); onClose(); }}>Create Form</BonsaiButton>
          </div>
        </div>
      </div>
    </>
  );
}

function SendFormModal({ isOpen, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-800">Send Form</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Recipient</label>
            <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
              <option>Select recipient...</option>
              <option>Acme Corporation (Client)</option>
              <option>John Doe (Employee)</option>
              <option>Sarah Johnson (Freelancer)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Attach to Record</label>
            <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
              <option>Select record...</option>
              <option>Project: Website Redesign</option>
              <option>Client: Acme Corporation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Message (optional)</label>
            <textarea rows={3} className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm" placeholder="Add a message to the recipient..." />
          </div>
          <div className="p-3 bg-stone-100 border border-stone-200 rounded-lg">
            <p className="text-sm text-blue-800">
              This will send an email notification and create an activity entry in the attached record.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3">
          <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton variant="primary" icon={<Send />} onClick={() => { alert('Form sent successfully!\n\nActivity entry created.\nEmail notification sent.'); onClose(); }}>
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-stone-200">
          <h2 className="text-xl font-semibold text-stone-800">Field Mapping Rules</h2>
          <p className="text-sm text-stone-500">Map form fields to system fields</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            {[
              { formField: 'Company Name', systemField: 'Client.name' },
              { formField: 'Industry', systemField: 'Client.industry' },
              { formField: 'Company Description', systemField: 'Client.description' },
            ].map((mapping, i) => (
              <div key={i} className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Form Field</p>
                    <p className="font-medium text-stone-800">{mapping.formField}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-600 mb-1">Maps To</p>
                    <select className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm" defaultValue={mapping.systemField}>
                      <option value="">Don't map</option>
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
        <div className="px-6 py-4 border-t border-stone-200 flex justify-end gap-3">
          <BonsaiButton variant="ghost" onClick={onClose}>Cancel</BonsaiButton>
          <BonsaiButton variant="primary" onClick={() => { alert('Mapping rules saved!'); onClose(); }}>
            Save Mappings
          </BonsaiButton>
        </div>
      </div>
    </div>
  );
}
