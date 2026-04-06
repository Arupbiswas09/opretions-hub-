'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './bonsai/ToastSystem';
import { CO01ContactsList } from './contacts/CO01ContactsList';
import { CO02ContactDrawer } from './contacts/CO02ContactDrawer';
import { CO03ContactDetail } from './contacts/CO03ContactDetail';
import { CO05LinkClientModal } from './contacts/CO05LinkClientModal';
import { CO06BulkToolbar } from './contacts/CO06BulkToolbar';
import { CO07ExportModal } from './contacts/CO07ExportModal';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';

type Screen = 'list' | 'detail';

interface Contact {
  id: string; name: string; email: string; phone: string;
  company?: string; jobTitle?: string; type: string; linkedClient: string;
  consent: 'Given' | 'Pending' | 'Withdrawn';
  gdprStatus: 'Active' | 'Export Requested' | 'Deletion Requested';
  source: string; tags: string[];
  lastContact?: string;
}

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'list', label: 'All Contacts' },
  { id: 'detail', label: 'Detail' },
];

export default function Contacts() {
  const { addToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDrawer, setShowContactDrawer] = useState(false);
  const [showLinkClientModal, setShowLinkClientModal] = useState(false);
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  const handleContactClick = (contact: Contact) => { setSelectedContact(contact); setCurrentScreen('detail'); };
  const handleCreateContact = () => { setContactToEdit(null); setShowContactDrawer(true); };
  const handleEditContact = () => { setContactToEdit(selectedContact); setShowContactDrawer(true); };

  const handleSaveContact = (contact: any) => {
    setSelectedContact({
      id: Date.now().toString(), name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email, phone: contact.phone, company: contact.company,
      jobTitle: contact.jobTitle, type: contact.type, linkedClient: contact.linkedClient,
      consent: contact.consent, gdprStatus: 'Active', source: contact.source,
      tags: contact.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
    });
    setCurrentScreen('detail');
    addToast(contactToEdit ? 'Contact updated' : 'Contact saved', 'success');
  };

  const handleBulkAction = (action: string, selected: string[]) => {
    const n = selected.length;
    if (action === 'show-toolbar') setShowBulkToolbar(true);
    else if (action === 'export') setShowExportModal(true);
    else if (action === 'email') addToast(`Email queued for ${n} contact${n === 1 ? '' : 's'}`, 'info');
    else if (action === 'tag') addToast(`Tags will be applied to ${n} record${n === 1 ? '' : 's'}`, 'info');
    else if (action === 'consent') addToast(`Consent update scheduled for ${n} contact${n === 1 ? '' : 's'}`, 'warning');
    else if (action === 'delete') addToast(`Delete request recorded (${n}) — confirm in audit log`, 'warning');
  };

  return (
    <div className="min-h-full">
      <ModuleSubNav>
        {SCREENS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (s.id === 'detail' && !selectedContact) {
                setSelectedContact({
                  id: '1', name: 'Jennifer Davis', email: 'jennifer@acmecorp.com',
                  phone: '(555) 123-4567', company: 'Acme Corp', jobTitle: 'Marketing Director',
                  type: 'Client', linkedClient: 'Acme Corp', consent: 'Given',
                  gdprStatus: 'Active', source: 'Website', tags: ['VIP', 'Decision Maker'],
                });
              }
              setCurrentScreen(s.id);
            }}
            className={moduleSubNavButtonClass(currentScreen === s.id)}
          >
            {s.label}
          </button>
        ))}
        <ModuleSubNavDivider />
        <button type="button" onClick={() => setShowContactDrawer(true)} className={moduleSubNavButtonClass(false)}>+ Contact</button>
        <button type="button" onClick={() => setShowLinkClientModal(true)} className={moduleSubNavButtonClass(false)}>Link Client</button>
        <button type="button" onClick={() => setShowBulkToolbar(!showBulkToolbar)} className={moduleSubNavButtonClass(false)}>Bulk</button>
        <button type="button" onClick={() => setShowExportModal(true)} className={moduleSubNavButtonClass(false)}>Export</button>
      </ModuleSubNav>

      <AnimatePresence mode="wait">
        <motion.div key={currentScreen} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}>
          {currentScreen === 'list' && <CO01ContactsList onContactClick={handleContactClick} onCreateContact={handleCreateContact} onBulkAction={handleBulkAction} onShowBulkToolbar={() => setShowBulkToolbar(true)} />}
          {currentScreen === 'detail' && selectedContact && <CO03ContactDetail contact={selectedContact} onEdit={handleEditContact} onLinkClient={() => setShowLinkClientModal(true)} />}
        </motion.div>
      </AnimatePresence>

      <CO02ContactDrawer isOpen={showContactDrawer} onClose={() => setShowContactDrawer(false)} onSave={handleSaveContact} initialContact={contactToEdit} />
      <CO05LinkClientModal isOpen={showLinkClientModal} onClose={() => setShowLinkClientModal(false)} onLink={(id) => console.log('Link:', id)} />
      <CO07ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={(f, o) => console.log('Export:', f, o)} contactName={selectedContact?.name || 'Contact'} />
      {showBulkToolbar && <CO06BulkToolbar selectedCount={3} onClose={() => setShowBulkToolbar(false)} />}
    </div>
  );
}
