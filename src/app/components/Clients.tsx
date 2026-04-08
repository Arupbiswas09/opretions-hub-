'use client';
import React, { useState } from 'react';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { motion, AnimatePresence } from 'motion/react';
import { CL01ClientsList } from './clients/CL01ClientsList';
import { CL02ClientDrawer } from './clients/CL02ClientDrawer';
import { CL03ClientDetail } from './clients/CL03ClientDetail';
import { CL06CreateRequestModal } from './clients/CL06CreateRequestModal';
import { CL07InviteUserModal } from './clients/CL07InviteUserModal';
import { CL08EditRoleModal } from './clients/CL08EditRoleModal';
import { CL09DeactivateUserDialog } from './clients/CL09DeactivateUserDialog';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { useToast } from './bonsai/ToastSystem';

type Screen = 'list' | 'detail';

interface Client {
  id: string; name: string; industry: string;
  status: 'Active' | 'Onboarding' | 'Inactive' | 'Archived';
  owner: string; contacts: number; projects: number; revenue: string;
  lastActivity: string; tags: string[]; website?: string;
  phone?: string; email?: string; address?: string;
}

export default function Clients() {
  const listRefresh = useHubDataInvalidation('clients', 'all');
  const { addToast } = useToast();
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

  const handleSaveClient = async (client: any) => {
    try {
      const isEdit = !!clientToEdit;
      const url = isEdit ? `/api/clients/${clientToEdit.id}` : '/api/clients';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: client.name || 'Unnamed Client',
          billing_address: client.address
            ? { street: client.address, city: client.city, state: client.state }
            : undefined,
          payment_terms: client.paymentTerms || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const saved = json.data;
        setSelectedClient({
          id: saved.id || Date.now().toString(),
          name: saved.name || client.name,
          industry: client.industry || '',
          status: client.status || 'Active',
          owner: client.accountOwner || '',
          contacts: 0,
          projects: 0,
          revenue: '$0',
          lastActivity: 'Just now',
          tags: typeof client.tags === 'string'
            ? client.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [],
          website: client.website,
          phone: client.phone,
          email: client.email,
          address: client.city ? `${client.city}, ${client.state}` : undefined,
        });
        setCurrentScreen('detail');
        addToast(isEdit ? 'Client updated' : 'Client created', 'success');
        dispatchDataInvalidation('clients');
        setShowClientDrawer(false);
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to save client', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleCreateRequest = async (data?: any) => {
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: data?.subject || data?.title || `Request from ${selectedClient?.name || 'Client'}`,
          description: data?.description || null,
          priority: data?.priority?.toLowerCase() || 'normal',
          request_type: 'support',
        }),
      });
      if (res.ok) {
        addToast('Request created', 'success');
        dispatchDataInvalidation('support_tickets');
        setShowRequestModal(false);
      } else {
        addToast('Failed to create request', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleInviteUser = async () => {
    addToast('Invitation sent', 'success');
    setShowInviteUserModal(false);
  };

  const handleEditRole = async () => {
    addToast('Role updated', 'success');
    setShowEditRoleModal(false);
  };

  const handleDeactivateUser = async () => {
    addToast('User deactivated', 'success');
    setShowDeactivateDialog(false);
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        addToast('Client archived', 'success');
        dispatchDataInvalidation('clients');
        setCurrentScreen('list');
        setSelectedClient(null);
      } else {
        addToast('Failed to archive', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-full">
      {/* Minimal breadcrumb-style sub-nav */}
      <div className="flex items-center gap-1 px-3 py-2 sm:px-5 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setCurrentScreen('list')}
          className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all"
          style={{
            background: currentScreen === 'list' ? 'rgba(37,99,235,0.10)' : 'transparent',
            color: currentScreen === 'list' ? 'var(--primary)' : 'var(--muted-foreground)',
            border: currentScreen === 'list' ? '1px solid rgba(37,99,235,0.20)' : '1px solid transparent',
          }}
        >
          All Clients
        </button>
        {selectedClient && (
          <>
            <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>›</span>
            <button
              onClick={() => setCurrentScreen('detail')}
              className="shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all truncate max-w-[180px]"
              style={{
                background: currentScreen === 'detail' ? 'rgba(37,99,235,0.10)' : 'transparent',
                color: currentScreen === 'detail' ? 'var(--primary)' : 'var(--muted-foreground)',
                border: currentScreen === 'detail' ? '1px solid rgba(37,99,235,0.20)' : '1px solid transparent',
              }}
            >
              {selectedClient.name}
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4, pointerEvents: 'none' }} transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'list' && (
            <CL01ClientsList
              dataRefreshVersion={listRefresh}
              onClientClick={handleClientClick}
              onCreateClient={handleCreateClient}
              onBulkAction={() => {}}
            />
          )}
          {currentScreen === 'detail' && selectedClient && (
            <CL03ClientDetail
              client={selectedClient}
              onEdit={handleEditClient}
              onInviteUser={() => setShowInviteUserModal(true)}
              onCreateRequest={() => setShowRequestModal(true)}
              onViewRequest={() => {}}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <CL02ClientDrawer isOpen={showClientDrawer} onClose={() => setShowClientDrawer(false)} onSave={handleSaveClient} initialClient={clientToEdit} />
      <CL06CreateRequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} onCreate={handleCreateRequest} />
      <CL07InviteUserModal isOpen={showInviteUserModal} onClose={() => setShowInviteUserModal(false)} onInvite={handleInviteUser} />
      <CL08EditRoleModal isOpen={showEditRoleModal} onClose={() => setShowEditRoleModal(false)} onSave={handleEditRole} user={selectedPortalUser} />
      <CL09DeactivateUserDialog isOpen={showDeactivateDialog} onClose={() => setShowDeactivateDialog(false)} onConfirm={handleDeactivateUser} user={selectedPortalUser} />
    </div>
  );
}
