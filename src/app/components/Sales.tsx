'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SA01Dashboard } from './sales/SA01Dashboard';
import { SA02DealsList } from './sales/SA02DealsList';
import { SA03Pipeline } from './sales/SA03Pipeline';
import { SA04DealDetail } from './sales/SA04DealDetail';
import { SA05DealDrawer } from './sales/SA05DealDrawer';
import { SA07ProposalDrawer } from './sales/SA07ProposalDrawer';
import { SA08ProposalDetail } from './sales/SA08ProposalDetail';
import { SA09WonLostModal } from './sales/SA09WonLostModal';

type Screen = 'dashboard' | 'deals-list' | 'pipeline' | 'deal-detail' | 'proposal-detail';

interface Deal {
  id: string; name: string; client: string;
  type: 'Project' | 'Talent'; value: string; stage: string; owner: string;
}

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'deals-list', label: 'Deals' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'deal-detail', label: 'Deal Detail' },
  { id: 'proposal-detail', label: 'Proposal' },
];

export default function Sales() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealDrawer, setShowDealDrawer] = useState(false);
  const [showProposalDrawer, setShowProposalDrawer] = useState(false);
  const [showWonLostModal, setShowWonLostModal] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);

  const handleDealClick = (deal: Deal) => { setSelectedDeal(deal); setCurrentScreen('deal-detail'); };
  const handleCreateDeal = () => { setDealToEdit(null); setShowDealDrawer(true); };
  const handleEditDeal = () => { setDealToEdit(selectedDeal); setShowDealDrawer(true); };

  const handleSaveDeal = (deal: any) => {
    setSelectedDeal({
      id: Date.now().toString(), name: deal.name, client: deal.client,
      type: deal.type, value: deal.value, stage: deal.stage, owner: deal.owner,
    });
    setCurrentScreen('deal-detail');
  };

  const handleSaveProposal = () => setCurrentScreen('proposal-detail');

  const handleWonLostSave = (data: any) => {
    if (selectedDeal) {
      setSelectedDeal({ ...selectedDeal, stage: data.outcome === 'won' ? 'Won' : 'Lost' });
    }
  };

  return (
    <div className="min-h-full">
      {/* Screen nav — minimal pill bar */}
      <div className="px-8 py-3 border-b border-stone-100/60">
        <div className="flex items-center gap-1">
          {SCREENS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                if (s.id === 'deal-detail' && !selectedDeal) {
                  setSelectedDeal({
                    id: '1', name: 'Website Redesign Project', client: 'Acme Corp',
                    type: 'Project', value: '$45,000', stage: 'Proposal Sent', owner: 'John Doe',
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
          <button
            onClick={() => setShowDealDrawer(true)}
            className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors"
          >
            + Deal
          </button>
          <button
            onClick={() => setShowProposalDrawer(true)}
            className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors"
          >
            + Proposal
          </button>
          <button
            onClick={() => setShowWonLostModal(true)}
            className="px-3 py-1.5 text-[12px] text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors"
          >
            Won/Lost
          </button>
        </div>
      </div>

      {/* Content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {currentScreen === 'dashboard' && (
            <SA01Dashboard
              onNavigateToDeals={() => setCurrentScreen('deals-list')}
              onNavigateToPipeline={() => setCurrentScreen('pipeline')}
              onCreateDeal={handleCreateDeal}
            />
          )}
          {currentScreen === 'deals-list' && (
            <SA02DealsList onDealClick={handleDealClick} onCreateDeal={handleCreateDeal} />
          )}
          {currentScreen === 'pipeline' && (
            <SA03Pipeline onDealClick={handleDealClick} onCreateDeal={handleCreateDeal} />
          )}
          {currentScreen === 'deal-detail' && selectedDeal && (
            <SA04DealDetail
              deal={selectedDeal}
              onCreateProposal={() => setShowProposalDrawer(true)}
              onMarkWonLost={() => setShowWonLostModal(true)}
              onEdit={handleEditDeal}
              onViewProposals={() => setCurrentScreen('proposal-detail')}
            />
          )}
          {currentScreen === 'proposal-detail' && <SA08ProposalDetail />}
        </motion.div>
      </AnimatePresence>

      {/* Overlays */}
      <SA05DealDrawer isOpen={showDealDrawer} onClose={() => setShowDealDrawer(false)} onSave={handleSaveDeal} initialDeal={dealToEdit} />
      <SA07ProposalDrawer isOpen={showProposalDrawer} onClose={() => setShowProposalDrawer(false)} onSave={handleSaveProposal} />
      <SA09WonLostModal isOpen={showWonLostModal} onClose={() => setShowWonLostModal(false)} onSave={handleWonLostSave} dealName={selectedDeal?.name || 'Deal'} />
    </div>
  );
}
