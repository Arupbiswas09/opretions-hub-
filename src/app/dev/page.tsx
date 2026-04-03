"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import Link from 'next/link';
import UIKitDemo from '../components/UIKitDemo';
import LayoutTemplates from '../components/LayoutTemplates';
import OperationsHub from '../components/OperationsHub';
import Sales from '../components/Sales';
import Contacts from '../components/Contacts';
import Clients from '../components/Clients';
import Projects from '../components/Projects';
import People from '../components/People';
import Finance from '../components/Finance';
import Support from '../components/Support';
import Admin from '../components/Admin';
import Talent from '../components/Talent';
import Portals from '../components/Portals';
import Forms from '../components/Forms';

type Page = 'uikit' | 'layouts' | 'operations' | 'sales' | 'contacts' | 'clients' | 'projects' | 'people' | 'finance' | 'support' | 'admin' | 'talent' | 'portals' | 'forms' | 'unified';

const PAGES: { id: Page; label: string }[] = [
  { id: 'uikit', label: 'UI Kit' },
  { id: 'layouts', label: 'Layouts' },
  { id: 'operations', label: 'Shell' },
  { id: 'sales', label: 'Sales' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'clients', label: 'Clients' },
  { id: 'projects', label: 'Projects' },
  { id: 'people', label: 'People' },
  { id: 'finance', label: 'Finance' },
  { id: 'support', label: 'Support' },
  { id: 'admin', label: 'Admin' },
  { id: 'talent', label: 'Talent' },
  { id: 'portals', label: 'Portals' },
  { id: 'forms', label: 'Forms' },
  { id: 'unified', label: '★ Unified (hub routes)' },
];

export default function DevPlaygroundPage() {
  const [currentPage, setCurrentPage] = useState<Page>('uikit');
  const [devMenuOpen, setDevMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {currentPage === 'uikit' && <UIKitDemo />}
      {currentPage === 'layouts' && <LayoutTemplates />}
      {currentPage === 'operations' && <OperationsHub />}
      {currentPage === 'sales' && <Sales />}
      {currentPage === 'contacts' && <Contacts />}
      {currentPage === 'clients' && <Clients />}
      {currentPage === 'projects' && <Projects />}
      {currentPage === 'people' && <People />}
      {currentPage === 'finance' && <Finance />}
      {currentPage === 'support' && <Support />}
      {currentPage === 'admin' && <Admin />}
      {currentPage === 'talent' && <Talent />}
      {currentPage === 'portals' && <Portals />}
      {currentPage === 'forms' && <Forms />}
      {currentPage === 'unified' && (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-stone-600">
              The unified Operations Hub uses file-based routes. Open{' '}
              <Link href="/hub/dashboard" className="font-medium text-indigo-600 underline">
                /hub/dashboard
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
      <div className="fixed bottom-4 right-4 z-[100]">
        <AnimatePresence>
          {devMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-12 right-0 w-48 glass-strong rounded-xl shadow-xl p-2 space-y-0.5"
            >
              {PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => { setCurrentPage(page.id); setDevMenuOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    currentPage === page.id
                      ? 'bg-indigo-500 text-white font-medium'
                      : 'text-stone-600 hover:bg-white/50'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDevMenuOpen(!devMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 glass-strong rounded-xl shadow-lg text-xs text-stone-500 hover:text-stone-700 transition-colors"
        >
          <span>Dev</span>
          <ChevronUp className={`w-3 h-3 transition-transform ${devMenuOpen ? 'rotate-180' : ''}`} />
        </motion.button>
      </div>
      )}
    </div>
  );
}
