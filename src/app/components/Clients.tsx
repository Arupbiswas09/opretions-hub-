'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CL01ClientsList } from './clients/CL01ClientsList';
import { CL02ClientDrawer } from './clients/CL02ClientDrawer';
import { CL03ClientDetail } from './clients/CL03ClientDetail';
import { CL06CreateRequestModal } from './clients/CL06CreateRequestModal';
import { CL07InviteUserModal } from './clients/CL07InviteUserModal';
import { CL08EditRoleModal } from './clients/CL08EditRoleModal';
import { CL09DeactivateUserDialog } from './clients/CL09DeactivateUserDialog';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';

type Screen = 'list' | 'detail';

interface Client {
  id: string; name: string; industry: string;
  status: 'Active' | 'Onboarding' | 'Inactive' | 'Archived';
  owner: string; contacts: number; projects: number; revenue: string;
  lastActivity: string; tags: string[]; website?: string;
  phone?: string; email?: string; address?: string;
}

export default function Clients() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDrawer, setShowClientDrawer] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [selectedPortalUser, setSelectedPortalUser] = useState<any>(null);

  const handleClientClick = (client: Client) => { setSelectedClient(client); setCurrentScreen('detail'); };
  const handleCreateClient = () => { setClientToEdit(null); setShowClientDrawer(true); };
  const handleEditClient = () => { setClientToEdit(selectedClient); setShowClientDrawer(true); };

  const handleSaveClient = (client: any) => {
    setSelectedClient({
      id: Date.now().toString(), name: client.name, industry: client.industry,
      status: client.status, owner: client.accountOwner, contacts: 0, projects: 0,
      revenue: '$0', lastActivity: 'Just now',
      tags: client.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      website: client.website, phone: client.phone, email: client.email,
      address: client.address ? `${client.city}, ${client.state}` : undefined,
    });
    setCurrentScreen('detail');
  };

  return (
    <div className="min-h-full">
      <ModuleSubNav>
        {([{ id: 'list', label: 'All Clients' }, { id: 'detail', label: 'Detail' }] as const).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id === 'detail' && !selectedClient) {
                setSelectedClient({ id: '1', name: 'Acme Corporation', industry: 'Technology', status: 'Active', owner: 'John Doe', contacts: 5, projects: 3, revenue: '$125,000', lastActivity: 'Today', tags: ['Enterprise', 'VIP'], website: 'https://acmecorp.com', phone: '(555) 123-4567', email: 'contact@acmecorp.com', address: 'San Francisco, CA' });
              }
              setCurrentScreen(s.id);
            }}
            className={moduleSubNavButtonClass(currentScreen === s.id)}
          >
            {s.label}
          </button>
        ))}
        <ModuleSubNavDivider />
        <button type="button" onClick={() => setShowClientDrawer(true)} className={moduleSubNavButtonClass(false)}>+ Client</button>
        <button type="button" onClick={() => setShowRequestModal(true)} className={moduleSubNavButtonClass(false)}>Request</button>
        <button type="button" onClick={() => setShowInviteUserModal(true)} className={moduleSubNavButtonClass(false)}>Invite</button>
        <button
          type="button"
          onClick={() => { setSelectedPortalUser({ id: '1', name: 'Jennifer Davis', email: 'jennifer@acmecorp.com', role: 'Admin' }); setShowEditRoleModal(true); }}
          className={moduleSubNavButtonClass(false)}
        >
          Roles
        </button>
      </ModuleSubNav>

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'list' && <CL01ClientsList onClientClick={handleClientClick} onCreateClient={handleCreateClient} onBulkAction={() => {}} />}
          {currentScreen === 'detail' && selectedClient && <CL03ClientDetail client={selectedClient} onEdit={handleEditClient} onInviteUser={() => setShowInviteUserModal(true)} onCreateRequest={() => setShowRequestModal(true)} onViewRequest={() => {}} />}
        </motion.div>
      </AnimatePresence>

      <CL02ClientDrawer isOpen={showClientDrawer} onClose={() => setShowClientDrawer(false)} onSave={handleSaveClient} initialClient={clientToEdit} />
      <CL06CreateRequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} onCreate={() => {}} />
      <CL07InviteUserModal isOpen={showInviteUserModal} onClose={() => setShowInviteUserModal(false)} onInvite={() => {}} />
      <CL08EditRoleModal isOpen={showEditRoleModal} onClose={() => setShowEditRoleModal(false)} onSave={() => {}} user={selectedPortalUser} />
      <CL09DeactivateUserDialog isOpen={showDeactivateDialog} onClose={() => setShowDeactivateDialog(false)} onConfirm={() => {}} user={selectedPortalUser} />
    </div>
  );
}
