'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'list', label: 'All Contacts' },
  { id: 'detail', label: 'Detail' },
];

export default function Contacts() {
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
  };

  const handleBulkAction = (action: string, selected: string[]) => {
    if (action === 'show-toolbar') setShowBulkToolbar(true);
    else if (action === 'export') setShowExportModal(true);
  };

  return (
    <div className="min-h-full">
      {/* Screen nav */}
      <div className="px-8 py-3 border-b border-stone-100/60">
        <div className="flex items-center gap-1">
          {SCREENS.map((s) => (
            <button
              key={s.id}
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
              className={`px-3 py-1.5 text-[12px] rounded-md transition-all duration-200 ${
                currentScreen === s.id
                  ? 'bg-stone-800 text-white font-medium shadow-sm'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
              }`}
            >
              {s.label}
            </button>
          ))}
          <div className="w-px h-3.5 bg-stone-200/60 mx-1.5" />
          <button onClick={() => setShowContactDrawer(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">+ Contact</button>
          <button onClick={() => setShowLinkClientModal(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Link Client</button>
          <button onClick={() => setShowBulkToolbar(!showBulkToolbar)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Bulk</button>
          <button onClick={() => setShowExportModal(true)} className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors">Export</button>
        </div>
      </div>

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
