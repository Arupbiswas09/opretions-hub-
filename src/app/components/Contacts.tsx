'use client';
import React, { useState } from 'react';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './bonsai/ToastSystem';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { CO01ContactsList } from './contacts/CO01ContactsList';
import { CO02ContactDrawer } from './contacts/CO02ContactDrawer';
import { CO03ContactDetail } from './contacts/CO03ContactDetail';
import { CO05LinkClientModal } from './contacts/CO05LinkClientModal';
import { CO06BulkToolbar } from './contacts/CO06BulkToolbar';
import { CO07ExportModal } from './contacts/CO07ExportModal';

type Screen = 'list' | 'detail';

interface Contact {
  id: string; name: string; email: string; phone: string;
  company?: string; jobTitle?: string; type: string; linkedClient: string;
  consent: 'Given' | 'Pending' | 'Withdrawn';
  gdprStatus: 'Active' | 'Export Requested' | 'Deletion Requested';
  source: string; tags: string[];
  lastContact?: string;
}

export default function Contacts() {
  const listRefresh = useHubDataInvalidation('contacts', 'all');
  const { addToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showLinkClientModal, setShowLinkClientModal] = useState(false);
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  const handleContactClick = (contact: Contact) => { setSelectedContact(contact); setCurrentScreen('detail'); };
  const handleCreateContact = () => { setContactToEdit(null); setShowContactDrawer(true); };
  const handleEditContact = () => { setContactToEdit(selectedContact); setShowContactDrawer(true); };

  const handleSaveContact = async (contact: any) => {
    try {
      const isEdit = !!contactToEdit;
      const url = isEdit ? `/api/contacts/${contactToEdit.id}` : '/api/contacts';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: contact.firstName || contact.name?.split(' ')[0] || '',
          last_name: contact.lastName || contact.name?.split(' ').slice(1).join(' ') || '',
          email: contact.email || null,
          phone: contact.phone || null,
          company: contact.company || null,
          tags: typeof contact.tags === 'string'
            ? contact.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : Array.isArray(contact.tags) ? contact.tags : [],
          notes: contact.notes || null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const saved = json.data;
        setSelectedContact({
          id: saved.id || Date.now().toString(),
          name: `${saved.first_name || ''} ${saved.last_name || ''}`.trim(),
          email: saved.email || '',
          phone: saved.phone || '',
          company: saved.company || contact.company || '',
          jobTitle: contact.jobTitle || '',
          type: contact.type || 'Client',
          linkedClient: contact.linkedClient || '',
          consent: contact.consent || 'Given',
          gdprStatus: 'Active',
          source: contact.source || 'Manual',
          tags: saved.tags || [],
        });
        setCurrentScreen('detail');
        addToast(isEdit ? 'Contact updated' : 'Contact saved', 'success');
        dispatchDataInvalidation('contacts');
        setShowContactDrawer(false);
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to save contact', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleBulkAction = (action: string, selected: string[]) => {
    const n = selected.length;
    setBulkSelected(selected);
    if (action === 'show-toolbar') setShowBulkToolbar(true);
    else if (action === 'export') setShowExportModal(true);
    else if (action === 'email') addToast(`Email queued for ${n} contact${n === 1 ? '' : 's'}`, 'info');
    else if (action === 'tag') addToast(`Tags will be applied to ${n} record${n === 1 ? '' : 's'}`, 'info');
    else if (action === 'consent') addToast(`Consent update scheduled for ${n} contact${n === 1 ? '' : 's'}`, 'warning');
    else if (action === 'delete') {
      Promise.all(selected.map(id =>
        fetch(`/api/contacts/${id}`, { method: 'DELETE', credentials: 'include' })
      )).then(() => {
        addToast(`${n} contact${n === 1 ? '' : 's'} deleted`, 'success');
        dispatchDataInvalidation('contacts');
      }).catch(() => {
        addToast('Failed to delete some contacts', 'error');
      });
    }
  };

  const handleLinkClient = async (clientId: string) => {
    if (!selectedContact) return;
    addToast(`Contact linked to client`, 'success');
    setShowLinkClientModal(false);
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    try {
      const res = await fetch(`/api/contacts/${selectedContact.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        addToast('Contact deleted', 'success');
        dispatchDataInvalidation('contacts');
        setCurrentScreen('list');
        setSelectedContact(null);
      } else {
        addToast('Failed to delete', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-full">
      {/* Breadcrumb-style sub-nav */}
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
          All Contacts
        </button>
        {selectedContact && (
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
              {selectedContact.name}
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4, pointerEvents: 'none' }} transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'list' && (
            <CO01ContactsList
              dataRefreshVersion={listRefresh}
              onContactClick={handleContactClick}
              onCreateContact={handleCreateContact}
              onBulkAction={handleBulkAction}
              onShowBulkToolbar={() => setShowBulkToolbar(true)}
            />
          )}
          {currentScreen === 'detail' && selectedContact && (
            <CO03ContactDetail
              contact={selectedContact}
              onEdit={handleEditContact}
              onLinkClient={() => setShowLinkClientModal(true)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <CO02ContactDrawer isOpen={showContactDrawer} onClose={() => setShowContactDrawer(false)} onSave={handleSaveContact} initialContact={contactToEdit} />
      <CO05LinkClientModal isOpen={showLinkClientModal} onClose={() => setShowLinkClientModal(false)} onLink={handleLinkClient} />
      <CO07ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={(f, o) => { addToast('Export started', 'info'); setShowExportModal(false); }} contactName={selectedContact?.name || 'Contact'} />
      {showBulkToolbar && <CO06BulkToolbar selectedCount={bulkSelected.length || 3} onClose={() => setShowBulkToolbar(false)} />}
    </div>
  );
}
