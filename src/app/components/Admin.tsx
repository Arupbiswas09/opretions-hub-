'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, Database, Link as LinkIcon, Check, X, Globe, FileText, ClipboardCheck, Layers, GitBranch, MapPin, UserCog, Eye, EyeOff, GripVertical, Plus, Trash2, Edit, Archive, AlertCircle, BarChart3, Briefcase, Users, Building2, FolderOpen, User, Headphones, ClipboardList, Mail, Square } from 'lucide-react';
import { BonsaiButton } from './bonsai/BonsaiButton';
import { BonsaiStatusPill } from './bonsai/BonsaiStatusPill';
import { BonsaiTabs } from './bonsai/BonsaiTabs';
import { EnhancedTable } from './operations/EnhancedTable';
import { moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';

type Screen = 
  | 'overview' 
  | 'modules' | 'modules-preview'
  | 'permissions' | 'permissions-detail'
  | 'fields' | 'fields-add' | 'fields-visibility'
  | 'portals' | 'portals-client' | 'portals-employee' | 'portals-freelancer'
  | 'approvals'
  | 'integrations'
  | 'audit' | 'gdpr'
  | 'schema' | 'schema-fields' | 'schema-field-edit' | 'schema-visibility' | 'schema-layout'
  | 'pipelines' | 'pipeline-editor' | 'pipeline-rules'
  | 'form-mapping' | 'form-mapping-detail' | 'form-mapping-conflict' | 'form-mapping-preview'
  | 'portal-rules' | 'portal-rules-fields' | 'portal-rules-approval' | 'portal-rules-audit';

export default function Admin() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('overview');
  const [showPermissionDrawer, setShowPermissionDrawer] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  const navBtn = (id: Screen | string, label: string, match?: (s: string) => boolean) => (
    <button
      key={id}
      type="button"
      onClick={() => setCurrentScreen(id as Screen)}
      className={moduleSubNavButtonClass(
        (match ? match(currentScreen) : currentScreen === id) ?? false,
      )}
    >{label}</button>
  );

  return (
    <div className="min-h-full">
      <div className="px-8 py-3 border-b border-border">
        <div className="flex items-center gap-1 flex-wrap">
          {navBtn('overview', 'Overview')}
          {navBtn('modules', 'Modules', s => s.startsWith('modules'))}
          {navBtn('permissions', 'Permissions', s => s.startsWith('permissions'))}
          {navBtn('portals', 'Portals', s => s.startsWith('portals'))}
          {navBtn('schema', 'Schema', s => s.startsWith('schema'))}
          {navBtn('pipelines', 'Pipelines', s => s.startsWith('pipeline'))}
          <ModuleSubNavDivider />
          {navBtn('fields', 'Fields')}
          {navBtn('approvals', 'Approvals')}
          {navBtn('integrations', 'Integrations')}
          {navBtn('audit', 'Audit')}
          {navBtn('form-mapping', 'Form Mapping', s => s.startsWith('form-mapping'))}
          {navBtn('portal-rules', 'Portal Rules', s => s.startsWith('portal-rules'))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          {currentScreen === 'overview' && <AdminOverview onNavigate={setCurrentScreen} />}
          {currentScreen === 'modules' && <ModulesSettings onNavigate={setCurrentScreen} />}
          {currentScreen === 'modules-preview' && <ModulesSidebarPreview onNavigate={setCurrentScreen} />}
          {currentScreen === 'permissions' && <PermissionsMatrix onNavigate={setCurrentScreen} showDrawer={showPermissionDrawer} setShowDrawer={setShowPermissionDrawer} />}
          {currentScreen === 'fields' && <CustomFieldsBuilder onNavigate={setCurrentScreen} />}
          {currentScreen === 'portals' && <PortalSettings onNavigate={setCurrentScreen} />}
          {currentScreen === 'portals-client' && <ClientPortalSettings onNavigate={setCurrentScreen} />}
          {currentScreen === 'portals-employee' && <EmployeePortalSettings onNavigate={setCurrentScreen} />}
          {currentScreen === 'portals-freelancer' && <FreelancerPortalSettings onNavigate={setCurrentScreen} />}
          {currentScreen === 'approvals' && <ApprovalsConfiguration onNavigate={setCurrentScreen} />}
          {currentScreen === 'integrations' && <IntegrationsSettings />}
          {currentScreen === 'audit' && <AuditLog onNavigate={setCurrentScreen} />}
          {currentScreen === 'gdpr' && <GDPRSettings onNavigate={setCurrentScreen} />}
          {currentScreen === 'schema' && <EntitySchemaManager onNavigate={setCurrentScreen} />}
          {currentScreen === 'schema-fields' && <EntityFieldsList onNavigate={setCurrentScreen} />}
          {currentScreen === 'schema-layout' && <FieldLayoutDesigner onNavigate={setCurrentScreen} />}
          {currentScreen === 'pipelines' && <PipelineManager onNavigate={setCurrentScreen} />}
          {currentScreen === 'pipeline-editor' && <PipelineStageEditor onNavigate={setCurrentScreen} />}
          {currentScreen === 'form-mapping' && <FormMappingDashboard onNavigate={setCurrentScreen} />}
          {currentScreen === 'form-mapping-detail' && <FormMappingDetail onNavigate={setCurrentScreen} />}
          {currentScreen === 'form-mapping-preview' && <SubmissionMappingPreview onNavigate={setCurrentScreen} />}
          {currentScreen === 'portal-rules' && <PortalDataUpdateRules onNavigate={setCurrentScreen} />}
          {currentScreen === 'portal-rules-fields' && <AllowedFieldsConfig onNavigate={setCurrentScreen} />}
          {currentScreen === 'portal-rules-approval' && <ApprovalRulesConfig onNavigate={setCurrentScreen} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// AD-01: Admin Settings Overview — Editorial
function AdminOverview({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const sections = [
    {
      title: 'Core Configuration',
      cards: [
        { id: 'modules', label: 'Module Management', description: 'Enable or disable system modules', shortcut: '→' },
        { id: 'permissions', label: 'Roles & Permissions', description: 'Configure access control by role', shortcut: '→' },
        { id: 'fields', label: 'Custom Fields', description: 'Add custom fields to modules', shortcut: '→' },
      ]
    },
    {
      title: 'Portals & Access',
      cards: [
        { id: 'portals', label: 'Portal Settings', description: 'Configure client, employee & freelancer portals', shortcut: '→' },
        { id: 'approvals', label: 'Approvals', description: 'Configure approval workflows', shortcut: '→' },
        { id: 'audit', label: 'Audit & Compliance', description: 'View audit logs and GDPR settings', shortcut: '→' },
      ]
    },
    {
      title: 'Advanced Configuration',
      cards: [
        { id: 'schema', label: 'Schema & Fields', description: 'Manage entity schemas and field layouts', shortcut: '→' },
        { id: 'pipelines', label: 'Pipelines', description: 'Configure deal, job & project pipelines', shortcut: '→' },
        { id: 'form-mapping', label: 'Form Mapping', description: 'Map forms to system fields', shortcut: '→' },
        { id: 'portal-rules', label: 'Portal Update Rules', description: 'Control self-serve profile updates', shortcut: '→' },
      ]
    },
    {
      title: 'Integrations',
      cards: [
        { id: 'integrations', label: 'Integrations', description: 'Connect external services', shortcut: '→' },
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <div className="mb-10">
        <h1 className="text-[28px] font-semibold text-foreground tracking-[-0.02em] leading-tight">Admin Settings</h1>
        <p className="text-[14px] text-muted-foreground/80 mt-1.5">Configure system settings, permissions, and workflows</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-[0.08em] mb-3">{section.title}</h2>
            <div className="hub-surface hub-surface-elevated backdrop-blur-sm rounded-xl border border-border/40 overflow-hidden divide-y divide-border">
              {section.cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => onNavigate(card.id as Screen)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left group hover:bg-muted/50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium text-foreground group-hover:text-foreground transition-colors">{card.label}</div>
                    <div className="text-[12px] text-muted-foreground/80 mt-0.5">{card.description}</div>
                  </div>
                  <span className="text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all text-[14px] ml-4 flex-shrink-0">→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AD-02: Modules Toggle List (Enhanced with Forms)
function ModulesSettings({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [modules, setModules] = useState([
    { id: 'dashboard', name: 'Dashboard', enabled: true, locked: true },
    { id: 'sales', name: 'Sales', enabled: true, locked: false },
    { id: 'contacts', name: 'Contacts', enabled: true, locked: false },
    { id: 'clients', name: 'Clients', enabled: true, locked: false },
    { id: 'projects', name: 'Projects', enabled: true, locked: false },
    { id: 'talent', name: 'Talent', enabled: false, locked: false },
    { id: 'people', name: 'People (HRIS)', enabled: true, locked: false },
    { id: 'finance', name: 'Finance', enabled: false, locked: false },
    { id: 'support', name: 'Support', enabled: true, locked: false },
    { id: 'forms', name: 'Forms & Intake', enabled: true, locked: false },
    { id: 'admin', name: 'Admin', enabled: true, locked: true },
  ]);

  const toggleModule = (id: string) => {
    setModules(modules.map(m => 
      m.id === id && !m.locked ? { ...m, enabled: !m.enabled } : m
    ));
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Module Management</h1>
          <p className="text-sm text-muted-foreground">Enable or disable system modules</p>
        </div>
        <BonsaiButton size="sm" variant="ghost" onClick={() => onNavigate('modules-preview')}>
          Preview Sidebar →
        </BonsaiButton>
      </div>

      <div className="mb-4 p-4 bg-secondary border border-border rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Disabled modules will be hidden from the sidebar and all user roles.
        </p>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="divide-y divide-border">
          {modules.map((module) => (
            <div key={module.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${module.enabled ? 'bg-primary/10' : 'bg-secondary'} flex items-center justify-center`}>
                  <Settings className={`w-5 h-5 ${module.enabled ? 'text-primary' : 'text-muted-foreground/80'}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{module.name}</p>
                  {module.locked && (
                    <p className="text-xs text-muted-foreground">Core module (always enabled)</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleModule(module.id)}
                disabled={module.locked}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  module.enabled ? 'bg-primary' : 'bg-border'
                } ${module.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background-2 transition-transform ${
                    module.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// AD-02a: Sidebar Preview State
function ModulesSidebarPreview({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const enabledModules: { id: string; name: string; icon: React.ElementType }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'sales', name: 'Sales', icon: Briefcase },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'clients', name: 'Clients', icon: Building2 },
    { id: 'projects', name: 'Projects', icon: FolderOpen },
    { id: 'people', name: 'People', icon: User },
    { id: 'support', name: 'Support', icon: Headphones },
    { id: 'forms', name: 'Forms', icon: ClipboardList },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('modules')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Modules
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Sidebar Preview</h1>
        <p className="text-sm text-muted-foreground">How the sidebar appears with Finance disabled</p>
      </div>

      <div className="hub-surface hub-surface-elevated p-6 max-w-xs">
        <h3 className="font-semibold text-foreground mb-4">Operations Hub</h3>
        <div className="space-y-2">
          {enabledModules.map((module) => {
            const Icon = module.icon;
            return (
            <div key={module.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50">
              <Icon className="w-4 h-4 text-muted-foreground" style={{ strokeWidth: 1.7 }} />
              <span className="text-sm font-medium text-foreground">{module.name}</span>
            </div>
            );
          })}
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Finance</strong> module is hidden (disabled)
          </p>
        </div>
      </div>
    </div>
  );
}

// AD-03: Roles & Permissions Matrix (Enhanced with more roles)
function PermissionsMatrix({ onNavigate, showDrawer, setShowDrawer }: { onNavigate: (screen: Screen) => void; showDrawer: boolean; setShowDrawer: (show: boolean) => void }) {
  const roles = ['Admin', 'Ops Manager', 'Sales', 'Delivery Manager', 'Employee', 'Freelancer', 'Client Admin', 'Client User'];
  const modules = [
    { name: 'Sales', permissions: ['view', 'create', 'edit', 'delete', 'export'] },
    { name: 'Contacts', permissions: ['view', 'create', 'edit', 'delete', 'export'] },
    { name: 'Clients', permissions: ['view', 'create', 'edit', 'delete', 'export'] },
    { name: 'Projects', permissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { name: 'Talent', permissions: ['view', 'create', 'edit', 'delete', 'export'] },
    { name: 'People', permissions: ['view', 'create', 'edit', 'delete', 'approve'] },
    { name: 'Finance', permissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { name: 'Support', permissions: ['view', 'create', 'edit', 'delete'] },
    { name: 'Forms', permissions: ['view', 'create', 'edit', 'delete', 'approve'] },
    { name: 'Admin', permissions: ['view'] },
  ];

  const [permissions, setPermissions] = useState<{[key: string]: boolean}>({});

  const togglePermission = (role: string, module: string, permission: string) => {
    const key = `${role}-${module}-${permission}`;
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasPermission = (role: string, module: string, permission: string) => {
    const key = `${role}-${module}-${permission}`;
    if (role === 'Admin') return true;
    return permissions[key] || false;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground">Configure access control by role and module</p>
      </div>

      <div className="hub-surface hub-surface-elevated overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground/90 sticky left-0 bg-muted/50">
                Module
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-foreground/90">
                Permission
              </th>
              {roles.map(role => (
                <th key={role} className="text-center px-2 py-3 text-xs font-semibold text-foreground/90">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {modules.flatMap(module => 
              module.permissions.map((permission, idx) => (
                <tr 
                  key={`${module.name}-${permission}`} 
                  className={`${idx === 0 ? 'bg-muted/50/50' : ''} hover:bg-muted/50 cursor-pointer`}
                  onClick={() => setShowDrawer(true)}
                >
                  {idx === 0 && (
                    <td
                      rowSpan={module.permissions.length}
                      className="px-4 py-3 font-medium text-foreground border-r border-border sticky left-0 bg-background-2"
                    >
                      {module.name}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                    {permission}
                  </td>
                  {roles.map(role => (
                    <td key={role} className="px-2 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePermission(role, module.name, permission); }}
                        disabled={role === 'Admin'}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                          hasPermission(role, module.name, permission)
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground/80'
                        } ${role === 'Admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {hasPermission(role, module.name, permission) && <Check className="w-4 h-4" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-secondary border border-border rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click any module row to view fine-grained permissions and notes.
        </p>
      </div>

      {/* AD-03a: Permission Detail Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-background-2 w-full max-w-md h-full overflow-y-auto border-l border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Sales Permissions</h2>
              <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-secondary rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Fine-Grained Permissions</h3>
                <div className="space-y-2">
                  {['View own deals only', 'View team deals', 'View all deals', 'Edit deal stages', 'Delete archived deals'].map((perm, i) => (
                    <label key={i} className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
                      <span className="text-sm text-foreground/90">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                <textarea
                  rows={3}
                  placeholder="Add permission notes..."
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3">
                <BonsaiButton variant="primary">Save Changes</BonsaiButton>
                <BonsaiButton variant="ghost" onClick={() => setShowDrawer(false)}>Cancel</BonsaiButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// AD-04: Custom Fields Builder (Enhanced with visibility)
function CustomFieldsBuilder({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [selectedModule, setSelectedModule] = useState('Projects');
  const [showAddModal, setShowAddModal] = useState(false);
  const [fields, setFields] = useState([
    { id: '1', name: 'Internal Code', type: 'Text', required: false, visibility: 'Internal-only' },
    { id: '2', name: 'Risk Level', type: 'Dropdown', required: false, visibility: 'Internal-only' },
  ]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Custom Fields</h1>
        <p className="text-sm text-muted-foreground">Add custom fields to modules and entities</p>
      </div>

      <div className="hub-surface hub-surface-elevated p-6 mb-6">
        <label className="block text-sm font-medium text-foreground/90 mb-2">Select Module</label>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground"
        >
          <option>Projects</option>
          <option>Clients</option>
          <option>Contacts</option>
          <option>People</option>
          <option>Sales</option>
        </select>
      </div>

      <div className="hub-surface hub-surface-elevated mb-4">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Custom Fields for {selectedModule}</h3>
          <BonsaiButton size="sm" variant="primary" onClick={() => setShowAddModal(true)}>+ Add Field</BonsaiButton>
        </div>
        <div className="divide-y divide-border">
          {fields.map(field => (
            <div key={field.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{field.name}</p>
                <p className="text-sm text-muted-foreground">
                  Type: {field.type} • {field.required ? 'Required' : 'Optional'} • {field.visibility}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-foreground/90 hover:bg-secondary rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AD-04a: Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
          <div className="absolute inset-0 hub-overlay-backdrop" aria-hidden onClick={() => setShowAddModal(false)} />
          <div
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border hub-modal-solid shadow-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border bg-background-2 px-6 py-4">
              <h2 className="text-xl font-semibold text-foreground">Add Custom Field</h2>
            </div>
            <div className="space-y-4 bg-background-2 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground/90">Field Name</label>
                <input type="text" className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" placeholder="e.g., Project Budget" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground/90">Field Type</label>
                <select className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground">
                  <option>Text</option>
                  <option>Textarea</option>
                  <option>Number</option>
                  <option>Date</option>
                  <option>Select (Dropdown)</option>
                  <option>Multi-select</option>
                  <option>Boolean (Yes/No)</option>
                  <option>URL</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground/90">Visibility</label>
                <select className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground">
                  <option>Internal-only</option>
                  <option>Client-visible</option>
                  <option>Freelancer-visible</option>
                  <option>All users</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-border text-primary" />
                  <span className="text-sm text-foreground/90">Required field</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border bg-background-2 px-6 py-4">
              <BonsaiButton variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</BonsaiButton>
              <BonsaiButton variant="primary" onClick={() => { setShowAddModal(false); alert('Field added!'); }}>Add Field</BonsaiButton>
            </div>
          </div>
        </div>
      )}

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-4">Field Types Available</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Text', 'Number', 'Date', 'Dropdown', 'Checkbox', 'Radio', 'Textarea', 'URL'].map(type => (
            <div key={type} className="p-3 border border-border rounded-lg text-center text-sm text-foreground/90">
              {type}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// AD-05: Portal Settings Overview
function PortalSettings({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Portal Settings</h1>
        <p className="text-sm text-muted-foreground">Configure client, employee, and freelancer portal features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('portals-client')}
          className="hub-surface hub-surface-elevated border border-primary/25 p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Client Portal</h3>
          <p className="text-sm text-muted-foreground">Configure proposals, approvals, invoices, meetings</p>
        </button>

        <button
          onClick={() => onNavigate('portals-employee')}
          className="hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Employee Portal</h3>
          <p className="text-sm text-muted-foreground">Configure onboarding, training, performance, profile changes</p>
        </button>

        <button
          onClick={() => onNavigate('portals-freelancer')}
          className="hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
        >
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Freelancer Portal</h3>
          <p className="text-sm text-muted-foreground">Configure onboarding, self-bills, profile changes</p>
        </button>
      </div>
    </div>
  );
}

// AD-05a: Client Portal Settings
function ClientPortalSettings({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [features, setFeatures] = useState({
    proposals: true,
    invoiceApproval: true,
    requestsApprovals: true,
    timesheetApprovals: false,
    meetingsVisibility: true,
    formsInbox: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('portals')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Portal Settings
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Client Portal Settings</h1>
        <p className="text-sm text-muted-foreground">Configure what clients can see and do</p>
      </div>

      <div className="hub-surface hub-surface-elevated mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Portal Features</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { key: 'proposals', label: 'Proposals', description: 'View and approve/reject proposals' },
            { key: 'invoiceApproval', label: 'Invoice Approval', description: 'Approve/reject invoices for visibility and dispute' },
            { key: 'requestsApprovals', label: 'Requests/Approvals', description: 'Approve timesheets, requests, and other items' },
            { key: 'timesheetApprovals', label: 'Timesheet Approvals', description: 'Direct timesheet approval capability' },
            { key: 'meetingsVisibility', label: 'Meetings Visibility', description: 'View shared meeting summaries' },
            { key: 'formsInbox', label: 'Forms Inbox', description: 'Fill and submit forms sent by team' },
          ].map(({ key, label, description }) => (
            <div key={key} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={() => toggleFeature(key as keyof typeof features)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  features[key as keyof typeof features] ? 'bg-indigo-600' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background-2 transition-transform ${
                    features[key as keyof typeof features] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-4">Client Roles Permissions</h3>
        <div className="space-y-3">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium text-foreground mb-2">Client Admin</p>
            <p className="text-sm text-muted-foreground">Full access to all portal features, can manage other client users</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium text-foreground mb-2">Client User</p>
            <p className="text-sm text-muted-foreground">View-only access, can submit forms and view assigned content</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// AD-05b: Employee Portal Settings
function EmployeePortalSettings({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [features, setFeatures] = useState({
    onboarding: true,
    formsInbox: true,
    trainingHub: true,
    performanceReviews: true,
    profileChangeRequests: true,
    documentRequests: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('portals')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Portal Settings
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Employee Portal Settings</h1>
        <p className="text-sm text-muted-foreground">Configure what employees can see and do</p>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Portal Features</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { key: 'onboarding', label: 'Onboarding', description: 'Onboarding checklists and tasks' },
            { key: 'formsInbox', label: 'Forms Inbox', description: 'Fill and submit internal forms' },
            { key: 'trainingHub', label: 'Training Hub', description: 'View assigned training and knowledge articles' },
            { key: 'performanceReviews', label: 'Performance Reviews', description: 'View shared performance reviews' },
            { key: 'profileChangeRequests', label: 'Profile Change Requests', description: 'Request profile changes (GDPR-compliant)' },
            { key: 'documentRequests', label: 'Document Requests', description: 'Request employment documents' },
          ].map(({ key, label, description }) => (
            <div key={key} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={() => toggleFeature(key as keyof typeof features)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  features[key as keyof typeof features] ? 'bg-foreground/70' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background-2 transition-transform ${
                    features[key as keyof typeof features] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// AD-05c: Freelancer Portal Settings
function FreelancerPortalSettings({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [features, setFeatures] = useState({
    onboarding: true,
    formsInbox: true,
    profileChangeRequests: true,
    documentRequests: true,
    selfBills: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('portals')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Portal Settings
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Freelancer Portal Settings</h1>
        <p className="text-sm text-muted-foreground">Configure what freelancers can see and do</p>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Portal Features</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { key: 'onboarding', label: 'Onboarding', description: 'Onboarding checklists for contracts and documents' },
            { key: 'formsInbox', label: 'Forms Inbox', description: 'Fill and submit forms' },
            { key: 'profileChangeRequests', label: 'Profile Change Requests', description: 'Request profile changes (GDPR-compliant)' },
            { key: 'documentRequests', label: 'Document Requests', description: 'Request and upload documents' },
            { key: 'selfBills', label: 'Self-Bills', description: 'Auto-generated self-bills from approved timesheets' },
          ].map(({ key, label, description }) => (
            <div key={key} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={() => toggleFeature(key as keyof typeof features)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  features[key as keyof typeof features] ? 'bg-foreground/70' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background-2 transition-transform ${
                    features[key as keyof typeof features] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// AD-06: Approvals Configuration
function ApprovalsConfiguration({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [approvalTypes, setApprovalTypes] = useState({
    timesheets: true,
    invoices: true,
    requests: true,
    profileChanges: true,
    expenses: true,
    leave: true,
  });

  const toggleApprovalType = (key: keyof typeof approvalTypes) => {
    setApprovalTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Approvals Configuration</h1>
        <p className="text-sm text-muted-foreground">Configure approval workflows and default approvers</p>
      </div>

      <div className="hub-surface hub-surface-elevated mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Approval Types</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { key: 'timesheets', label: 'Timesheets', approver: 'Manager' },
            { key: 'invoices', label: 'Invoices', approver: 'Owner' },
            { key: 'requests', label: 'Requests', approver: 'Manager' },
            { key: 'profileChanges', label: 'Profile Changes', approver: 'Admin' },
            { key: 'expenses', label: 'Expenses', approver: 'Manager' },
            { key: 'leave', label: 'Leave', approver: 'Manager' },
          ].map(({ key, label, approver }) => (
            <div key={key} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">Default approver: {approver}</p>
                </div>
                <button
                  onClick={() => toggleApprovalType(key as keyof typeof approvalTypes)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    approvalTypes[key as keyof typeof approvalTypes] ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background-2 transition-transform ${
                      approvalTypes[key as keyof typeof approvalTypes] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <select className="px-3 py-1 text-sm border border-border rounded-lg">
                  <option>Owner</option>
                  <option>Manager</option>
                  <option>Ops Manager</option>
                  <option>Admin</option>
                </select>
                <input
                  type="number"
                  placeholder="SLA (days)"
                  className="w-32 px-3 py-1 text-sm border border-border rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-3">Approval Rules</h3>
        <ul className="space-y-2 text-sm text-foreground/90">
          <li>• Approvals are required before items can be marked as complete</li>
          <li>• Default approvers can be overridden on a per-item basis</li>
          <li>• SLA is optional and sends reminders when approaching deadline</li>
        </ul>
      </div>
    </div>
  );
}

// AD-07: Integrations Settings
function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState([
    { id: 'teams', name: 'Microsoft Teams', connected: false, logo: 'teams', channels: false, notifications: false },
    { id: 'outlook', name: 'Outlook', connected: false, logo: 'outlook', emailSync: false, calendarSync: false },
    { id: 'google', name: 'Google Workspace', connected: true, logo: 'google', emailSync: true, calendarSync: true },
  ]);

  const toggleConnection = (id: string) => {
    setIntegrations(integrations.map(i =>
      i.id === id ? { ...i, connected: !i.connected } : i
    ));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="text-sm text-muted-foreground">Connect external services and tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map(integration => (
          <div key={integration.id} className="hub-surface hub-surface-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="text-sm font-bold text-muted-foreground">{integration.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {integration.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <BonsaiStatusPill
                status={integration.connected ? 'active' : 'draft'}
                label={integration.connected ? 'Active' : 'Inactive'}
              />
            </div>

            {integration.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Configuration</p>
                  {integration.id === 'google' && (
                    <>
                      <label className="flex items-center gap-2 mb-1">
                        <input type="checkbox" checked={integration.emailSync} readOnly className="w-4 h-4 rounded" />
                        <span className="text-sm text-foreground">Email sync enabled</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={integration.calendarSync} readOnly className="w-4 h-4 rounded" />
                        <span className="text-sm text-foreground">Calendar sync enabled</span>
                      </label>
                    </>
                  )}
                  {integration.id === 'teams' && (
                    <>
                      <label className="flex items-center gap-2 mb-1">
                        <input type="checkbox" className="w-4 h-4 rounded" />
                        <span className="text-sm text-foreground">Channel notifications</span>
                      </label>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">Last synced: 5 minutes ago</p>
                </div>
                <div className="flex gap-2">
                  <BonsaiButton size="sm" variant="ghost">Configure</BonsaiButton>
                  <BonsaiButton size="sm" variant="ghost" onClick={() => toggleConnection(integration.id)}>
                    Disconnect
                  </BonsaiButton>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect {integration.name} to sync data and enable collaboration features.
                </p>
                <BonsaiButton size="sm" variant="primary" onClick={() => toggleConnection(integration.id)}>
                  Connect {integration.name}
                </BonsaiButton>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-secondary border border-border rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> Slack, Zoom, Jira, GitHub, and more integrations.
        </p>
      </div>
    </div>
  );
}

// AD-08: Audit Log
function AuditLog({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const events = [
    { id: '1', event: 'Profile change approved', type: 'GDPR Action', user: 'HR Admin', timestamp: '2 hours ago' },
    { id: '2', event: 'Finance module disabled', type: 'Portal Access Change', user: 'System Admin', timestamp: '5 hours ago' },
    { id: '3', event: 'Timesheet approved', type: 'Approval', user: 'Manager', timestamp: '1 day ago' },
    { id: '4', event: 'Client portal login', type: 'Portal Access Change', user: 'Client Admin', timestamp: '2 days ago' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground">System activity and compliance tracking</p>
        </div>
        <BonsaiButton size="sm" variant="ghost" onClick={() => onNavigate('gdpr')}>
          GDPR Settings →
        </BonsaiButton>
      </div>

      <div className="hub-surface hub-surface-elevated mb-4">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search events..."
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg"
            />
            <select className="px-3 py-2 text-sm border border-border rounded-lg">
              <option>All Event Types</option>
              <option>Create/Update/Delete</option>
              <option>Approvals</option>
              <option>Portal Access Changes</option>
              <option>GDPR Actions</option>
            </select>
          </div>
        </div>
        <EnhancedTable
          columns={[
            { key: 'event', label: 'Event', sortable: true },
            { key: 'type', label: 'Type', sortable: true },
            { key: 'user', label: 'User', sortable: true },
            { key: 'timestamp', label: 'Timestamp', sortable: true },
          ]}
          data={events}
          searchable={false}
          filterable={false}
        />
      </div>

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-2">Audit Log Retention</h3>
        <p className="text-sm text-muted-foreground">Events are retained for 90 days. Exports available on request.</p>
      </div>
    </div>
  );
}

// AD-09: GDPR & Data Privacy Settings
function GDPRSettings({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('audit')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Audit Log
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">GDPR & Data Privacy</h1>
        <p className="text-sm text-muted-foreground">Configure data retention and privacy policies</p>
      </div>

      <div className="space-y-4">
        <div className="hub-surface hub-surface-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Data Retention</h3>
          <div className="space-y-3">
            {[
              { label: 'Audit logs', value: '90 days' },
              { label: 'Deleted records', value: '30 days' },
              { label: 'Profile change history', value: '1 year' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <input
                  type="text"
                  defaultValue={item.value}
                  className="w-32 px-3 py-1 text-sm border border-border rounded-lg text-right"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hub-surface hub-surface-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Data Export Settings</h3>
          <p className="text-sm text-muted-foreground mb-3">Users can request data exports from their portal profile</p>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Allow self-serve data exports</span>
          </label>
        </div>

        <div className="hub-surface hub-surface-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Deletion Policy</h3>
          <p className="text-sm text-muted-foreground">
            When a user requests account deletion, data is anonymized after 30 days. Critical records (invoices, contracts) are retained for legal compliance.
          </p>
        </div>

        <div className="p-4 bg-secondary border border-border rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Compliance:</strong> These settings help ensure GDPR, CCPA, and other data privacy regulation compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

// AD-10: Entity Schema Manager
function EntitySchemaManager({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const entities = [
    { id: 'clients', name: 'Clients', fields: 28 },
    { id: 'contacts', name: 'Contacts', fields: 24 },
    { id: 'deals', name: 'Deals', fields: 32 },
    { id: 'projects', name: 'Projects', fields: 36 },
    { id: 'jobs', name: 'Jobs', fields: 30 },
    { id: 'candidates', name: 'Candidates', fields: 26 },
    { id: 'people', name: 'People', fields: 42 },
    { id: 'invoices', name: 'Invoices', fields: 20 },
    { id: 'tickets', name: 'Tickets', fields: 18 },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Entity Schema Manager</h1>
        <p className="text-sm text-muted-foreground">Configure fields and layouts for entities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {entities.map((entity) => (
          <button
            key={entity.id}
            onClick={() => onNavigate('schema-fields')}
            className="hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{entity.name}</h3>
              <Database className="w-5 h-5 text-muted-foreground/80" />
            </div>
            <p className="text-sm text-muted-foreground">{entity.fields} fields configured</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// AD-11: Entity Fields List
function EntityFieldsList({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [fields, setFields] = useState([
    { id: '1', name: 'Company Name', type: 'Text', required: true, section: 'Basics', visibility: 'All users', order: 1 },
    { id: '2', name: 'Industry', type: 'Dropdown', required: false, section: 'Basics', visibility: 'All users', order: 2 },
    { id: '3', name: 'Website', type: 'URL', required: false, section: 'More options', visibility: 'All users', order: 3 },
    { id: '4', name: 'Internal Notes', type: 'Textarea', required: false, section: 'Internal only', visibility: 'Internal-only', order: 4 },
  ]);

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('schema')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Schema Manager
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clients - Fields</h1>
          <p className="text-sm text-muted-foreground">Manage fields, visibility, and layout</p>
        </div>
        <div className="flex gap-2">
          <BonsaiButton size="sm" variant="ghost" onClick={() => onNavigate('schema-layout')}>
            Layout Designer
          </BonsaiButton>
          <BonsaiButton size="sm" variant="primary" icon={<Plus />}>
            Add Field
          </BonsaiButton>
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="divide-y divide-border">
          {fields.map((field) => (
            <div key={field.id} className="p-4 flex items-center gap-4">
              <button className="text-muted-foreground/80 hover:text-muted-foreground cursor-move">
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-foreground">{field.name}</p>
                  {field.required && <span className="px-2 py-0.5 bg-secondary text-foreground/90 text-xs rounded">Required</span>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {field.type} • {field.section} • {field.visibility}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-background-2 translate-x-6" />
                </button>
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// AD-14: Field Layout Designer
function FieldLayoutDesigner({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('schema-fields')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Fields List
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Field Layout Designer</h1>
        <p className="text-sm text-muted-foreground">Drag fields into sections</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: 'Basics', fields: ['Company Name', 'Industry', 'Website'] },
          { title: 'More options', fields: ['Phone', 'Address', 'Tax ID'] },
          { title: 'Internal only', fields: ['Internal Notes', 'Risk Level'] },
        ].map((section, idx) => (
          <div key={idx} className="hub-surface hub-surface-elevated p-4">
            <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
            <div className="space-y-2">
              {section.fields.map((field, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg flex items-center gap-2 cursor-move">
                  <GripVertical className="w-4 h-4 text-muted-foreground/80" />
                  <span className="text-sm text-foreground">{field}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <BonsaiButton variant="primary">Save Layout</BonsaiButton>
      </div>
    </div>
  );
}

// AD-20: Pipeline Manager
function PipelineManager({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const pipelines = [
    { id: 'deals-project', name: 'Deals – Project', stages: 6 },
    { id: 'deals-talent', name: 'Deals – Talent', stages: 5 },
    { id: 'jobs', name: 'Jobs', stages: 4 },
    { id: 'candidates', name: 'Candidate Pipeline', stages: 7 },
    { id: 'projects', name: 'Projects Status', stages: 5 },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Pipeline Manager</h1>
        <p className="text-sm text-muted-foreground">Configure pipeline stages for deals, jobs, candidates, and projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipelines.map((pipeline) => (
          <button
            key={pipeline.id}
            onClick={() => onNavigate('pipeline-editor')}
            className="hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{pipeline.name}</h3>
              <GitBranch className="w-5 h-5 text-muted-foreground/80" />
            </div>
            <p className="text-sm text-muted-foreground">{pipeline.stages} stages configured</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// AD-21: Pipeline Stage Editor
function PipelineStageEditor({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [stages, setStages] = useState([
    { id: '1', name: 'Lead', color: 'gray', category: 'Open', isDefault: false },
    { id: '2', name: 'Qualified', color: 'blue', category: 'Open', isDefault: true },
    { id: '3', name: 'Proposal', color: 'yellow', category: 'Open', isDefault: false },
    { id: '4', name: 'Negotiation', color: 'orange', category: 'Open', isDefault: false },
    { id: '5', name: 'Won', color: 'green', category: 'Closed', isDefault: false },
    { id: '6', name: 'Lost', color: 'red', category: 'Closed', isDefault: false },
  ]);

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('pipelines')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Pipelines
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Deals – Project Pipeline</h1>
          <p className="text-sm text-muted-foreground">Manage stages, colors, and rules</p>
        </div>
        <BonsaiButton size="sm" variant="primary" icon={<Plus />}>
          Add Stage
        </BonsaiButton>
      </div>

      <div className="hub-surface hub-surface-elevated mb-4">
        <div className="divide-y divide-border">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="p-4 flex items-center gap-4">
              <button className="text-muted-foreground/80 hover:text-muted-foreground cursor-move">
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex-1 flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full bg-${stage.color}-500`} />
                <div>
                  <p className="font-medium text-foreground">{stage.name}</p>
                  <p className="text-sm text-muted-foreground">Category: {stage.category}</p>
                </div>
                {stage.isDefault && <span className="px-2 py-1 bg-secondary text-muted-foreground text-xs rounded">Default</span>}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hub-surface hub-surface-elevated p-6">
        <h3 className="font-semibold text-foreground mb-3">Pipeline Rules</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Stage requires next step date</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Stage requires follow-up task</span>
          </label>
        </div>
      </div>
    </div>
  );
}

// AD-30: Form Mapping Dashboard
function FormMappingDashboard({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const forms = [
    { id: '1', name: 'Client Intake Form', entity: 'Client', fields: 8, status: 'Mapped' },
    { id: '2', name: 'Candidate Application', entity: 'Candidate', fields: 12, status: 'Mapped' },
    { id: '3', name: 'Employee Onboarding', entity: 'Person', fields: 15, status: 'Partial' },
    { id: '4', name: 'Project Request', entity: 'Project', fields: 10, status: 'Not Mapped' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Form Mapping</h1>
        <p className="text-sm text-muted-foreground">Map form questions to system fields</p>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <EnhancedTable
          columns={[
            { key: 'name', label: 'Form Name', sortable: true },
            { key: 'entity', label: 'Target Entity', sortable: true },
            { key: 'fields', label: 'Fields', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
          ]}
          data={forms.map(form => ({
            ...form,
            fields: `${form.fields} questions`,
            status: (
              <BonsaiStatusPill
                status={form.status === 'Mapped' ? 'active' : form.status === 'Partial' ? 'pending' : 'draft'}
                label={form.status}
              />
            ),
          }))}
          onRowClick={() => onNavigate('form-mapping-detail')}
          searchable
          filterable
        />
      </div>
    </div>
  );
}

// AD-31: Form Mapping Detail
function FormMappingDetail({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const mappings = [
    { question: 'Company Name', field: 'Client.name', status: 'Mapped' },
    { question: 'Industry', field: 'Client.industry', status: 'Mapped' },
    { question: 'Project Budget', field: 'Deal.budget', status: 'Mapped' },
    { question: 'Contact Email', field: 'Contact.email', status: 'Mapped' },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('form-mapping')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Form Mapping
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Client Intake Form - Mapping</h1>
          <p className="text-sm text-muted-foreground">Map each question to a system field</p>
        </div>
        <BonsaiButton size="sm" variant="ghost" onClick={() => onNavigate('form-mapping-preview')}>
          Preview Mapping →
        </BonsaiButton>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="divide-y divide-border">
          {mappings.map((mapping, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">{mapping.question}</p>
                <p className="text-sm text-muted-foreground">→ {mapping.field}</p>
              </div>
              <div className="flex items-center gap-2">
                <BonsaiStatusPill status="active" label={mapping.status} />
                <button className="p-2 text-muted-foreground hover:bg-secondary rounded">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-secondary border border-border rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> If a field already has a value, you can set conflict resolution rules (overwrite/append/ignore).
        </p>
      </div>
    </div>
  );
}

// AD-33: Submission Mapping Preview
function SubmissionMappingPreview({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const submission = {
    'Company Name': 'Acme Corp',
    'Industry': 'Technology',
    'Project Budget': '$50,000',
    'Contact Email': 'john@acme.com',
  };

  const mappedData = [
    { entity: 'Client', field: 'name', value: 'Acme Corp' },
    { entity: 'Client', field: 'industry', value: 'Technology' },
    { entity: 'Deal', field: 'budget', value: '$50,000' },
    { entity: 'Contact', field: 'email', value: 'john@acme.com' },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('form-mapping-detail')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Form Mapping
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Submission Mapping Preview</h1>
        <p className="text-sm text-muted-foreground">How submission data will be mapped to system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hub-surface hub-surface-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Form Submission</h3>
          <div className="space-y-3">
            {Object.entries(submission).map(([key, value]) => (
              <div key={key} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">{key}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hub-surface hub-surface-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Mapped to System</h3>
          <div className="space-y-3">
            {mappedData.map((item, idx) => (
              <div key={idx} className="p-3 bg-secondary border border-border rounded-lg">
                <p className="text-xs text-foreground/90 mb-1">{item.entity}.{item.field}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <BonsaiButton variant="primary">Confirm Mapping</BonsaiButton>
      </div>
    </div>
  );
}

// AD-40: Portal Data Update Rules
function PortalDataUpdateRules({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const [activeTab, setActiveTab] = useState('client');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Portal Data Update Rules</h1>
        <p className="text-sm text-muted-foreground">Control self-serve profile updates with approval</p>
      </div>

      <BonsaiTabs
        tabs={[
          { label: 'Client', value: 'client' },
          { label: 'Employee', value: 'employee' },
          { label: 'Freelancer', value: 'freelancer' },
        ]}
        value={activeTab}
        onValueChange={setActiveTab}
      />

      <div className="mt-6 space-y-4">
        <button
          onClick={() => onNavigate('portal-rules-fields')}
          className="w-full hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
        >
          <h3 className="font-semibold text-foreground mb-2">Allowed Fields</h3>
          <p className="text-sm text-muted-foreground">Configure which fields {activeTab}s can request changes for</p>
        </button>

        <button
          onClick={() => onNavigate('portal-rules-approval')}
          className="w-full hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
        >
          <h3 className="font-semibold text-foreground mb-2">Approval Rules</h3>
          <p className="text-sm text-muted-foreground">Set who approves changes and SLA</p>
        </button>

        <button
          className="w-full hub-surface hub-surface-elevated p-6 hover:shadow-md transition-shadow text-left"
        >
          <h3 className="font-semibold text-foreground mb-2">Audit Trail</h3>
          <p className="text-sm text-muted-foreground">View sample change request lifecycle</p>
        </button>
      </div>
    </div>
  );
}

// AD-41: Allowed Fields Config
function AllowedFieldsConfig({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  const fields = [
    { name: 'Phone', allowed: true, sensitive: false },
    { name: 'Email', allowed: true, sensitive: true },
    { name: 'Address', allowed: true, sensitive: false },
    { name: 'Bank Account', allowed: false, sensitive: true },
    { name: 'Emergency Contact', allowed: true, sensitive: false },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('portal-rules')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Portal Rules
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Allowed Fields - Client</h1>
        <p className="text-sm text-muted-foreground">Select which fields clients can request changes for</p>
      </div>

      <div className="hub-surface hub-surface-elevated">
        <div className="divide-y divide-border">
          {fields.map((field, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" defaultChecked={field.allowed} className="w-4 h-4 rounded border-border text-primary" />
                <div>
                  <p className="font-medium text-foreground">{field.name}</p>
                  {field.sensitive && <span className="text-xs text-muted-foreground">Sensitive field</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <BonsaiButton variant="primary">Save Changes</BonsaiButton>
      </div>
    </div>
  );
}

// AD-42: Approval Rules Config
function ApprovalRulesConfig({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="p-8">
      <button
        onClick={() => onNavigate('portal-rules')}
        className="flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground mb-6"
      >
        ← Back to Portal Rules
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Approval Rules - Client</h1>
        <p className="text-sm text-muted-foreground">Set who approves client profile changes</p>
      </div>

      <div className="hub-surface hub-surface-elevated p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-2">Default Approver</label>
          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
            <option>Owner</option>
            <option>Manager</option>
            <option>Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/90 mb-2">SLA (days)</label>
          <input
            type="number"
            defaultValue={3}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary" />
            <span className="text-sm text-foreground/90">Send reminder before SLA expires</span>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <BonsaiButton variant="primary">Save Changes</BonsaiButton>
      </div>
    </div>
  );
}
