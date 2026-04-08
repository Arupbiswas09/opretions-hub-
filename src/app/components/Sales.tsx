'use client';
import React, { useState } from 'react';
import { useHubDataInvalidation } from '../lib/hub/use-data-invalidation';
import { motion, AnimatePresence } from 'motion/react';
import { SA01Dashboard } from './sales/SA01Dashboard';
import { SA02DealsList } from './sales/SA02DealsList';
import { SA03Pipeline } from './sales/SA03Pipeline';
import { SA04DealDetail } from './sales/SA04DealDetail';
import { SA05DealDrawer } from './sales/SA05DealDrawer';
import { SA07ProposalDrawer } from './sales/SA07ProposalDrawer';
import { SA08ProposalDetail } from './sales/SA08ProposalDetail';
import { SA09WonLostModal } from './sales/SA09WonLostModal';
import { ModuleSubNav, moduleSubNavButtonClass, ModuleSubNavDivider } from './ui/ModuleSubNav';
import { dispatchDataInvalidation } from '../lib/hub-events';
import { useToast } from './bonsai/ToastSystem';

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

export default function Sales({ initialScreen = 'dashboard', hideNav = false }: { initialScreen?: Screen; hideNav?: boolean }) {
  const salesRefresh = useHubDataInvalidation('deals', 'pipeline', 'sales', 'all');
  const { addToast } = useToast();
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showDealDrawer, setShowDealDrawer] = useState(false);
  const [showProposalDrawer, setShowProposalDrawer] = useState(false);
  const [showWonLostModal, setShowWonLostModal] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<Deal | null>(null);

  const handleDealClick = (deal: Deal) => { setSelectedDeal(deal); setCurrentScreen('deal-detail'); };
  const handleCreateDeal = () => { setDealToEdit(null); setShowDealDrawer(true); };
  const handleEditDeal = () => { setDealToEdit(selectedDeal); setShowDealDrawer(true); };

  const handleSaveDeal = async (deal: any) => {
    try {
      const isEdit = !!dealToEdit;
      const url = isEdit ? `/api/deals/${dealToEdit.id}` : '/api/deals';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: deal.name || deal.title || 'Untitled Deal',
          client_id: deal.clientId || deal.client_id || null,
          value: deal.value ? String(deal.value).replace(/[^0-9.]/g, '') : null,
          stage: deal.stage || 'lead',
          owner_id: deal.ownerId || deal.owner_id || null,
          close_date: deal.closeDate || deal.close_date || null,
          description: deal.description || null,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const saved = json.data;
        setSelectedDeal({
          id: saved.id || Date.now().toString(),
          name: saved.title || deal.name,
          client: deal.client || 'Unknown',
          type: deal.type || 'Project',
          value: deal.value || `$${Number(saved.value || 0).toLocaleString()}`,
          stage: saved.stage || deal.stage,
          owner: deal.owner || 'You',
        });
        setCurrentScreen('deal-detail');
        addToast(isEdit ? 'Deal updated' : 'Deal created', 'success');
        dispatchDataInvalidation('deals');
        dispatchDataInvalidation('pipeline');
        dispatchDataInvalidation('sales');
        setShowDealDrawer(false);
      } else {
        const json = await res.json();
        addToast(json.error || 'Failed to save deal', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleSaveProposal = async (data?: any) => {
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data?.title || `Proposal for ${selectedDeal?.name || 'Deal'}`,
          deal_id: selectedDeal?.id || null,
          value: data?.value || selectedDeal?.value?.replace(/[^0-9.]/g, '') || null,
          status: 'draft',
        }),
      });
      if (res.ok) {
        addToast('Proposal created', 'success');
        dispatchDataInvalidation('proposals');
        setShowProposalDrawer(false);
        setCurrentScreen('proposal-detail');
      } else {
        addToast('Failed to create proposal', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  const handleWonLostSave = async (data: any) => {
    if (!selectedDeal) return;
    const newStage = data.outcome === 'won' ? 'won' : 'lost';
    try {
      const res = await fetch(`/api/deals/${selectedDeal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        setSelectedDeal({ ...selectedDeal, stage: data.outcome === 'won' ? 'Won' : 'Lost' });
        addToast(`Deal marked as ${newStage}`, 'success');
        dispatchDataInvalidation('deals');
        dispatchDataInvalidation('pipeline');
        dispatchDataInvalidation('sales');
      } else {
        addToast('Failed to update deal', 'error');
      }
    } catch {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="min-h-full">
      {!hideNav && (
        <ModuleSubNav>
          {SCREENS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id === 'deal-detail' && !selectedDeal) {
                  return; // Don't navigate without selection
                }
                setCurrentScreen(s.id);
              }}
              className={moduleSubNavButtonClass(currentScreen === s.id)}
            >
              {s.label}
            </button>
          ))}
          <ModuleSubNavDivider />
          <button
            type="button"
            onClick={() => setShowDealDrawer(true)}
            className={moduleSubNavButtonClass(false)}
          >
            + Deal
          </button>
          <button
            type="button"
            onClick={() => setShowProposalDrawer(true)}
            className={moduleSubNavButtonClass(false)}
          >
            + Proposal
          </button>
          <button
            type="button"
            onClick={() => setShowWonLostModal(true)}
            className={moduleSubNavButtonClass(false)}
          >
            Won/Lost
          </button>
        </ModuleSubNav>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4, pointerEvents: 'none' }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {currentScreen === 'dashboard' && (
            <SA01Dashboard
              dataRefreshVersion={salesRefresh}
              onNavigateToDeals={() => setCurrentScreen('deals-list')}
              onNavigateToPipeline={() => setCurrentScreen('pipeline')}
              onCreateDeal={handleCreateDeal}
            />
          )}
          {currentScreen === 'deals-list' && (
            <SA02DealsList
              dataRefreshVersion={salesRefresh}
              onDealClick={handleDealClick}
              onCreateDeal={handleCreateDeal}
            />
          )}
          {currentScreen === 'pipeline' && (
            <SA03Pipeline
              dataRefreshVersion={salesRefresh}
              onDealClick={handleDealClick}
              onCreateDeal={handleCreateDeal}
            />
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

      <SA05DealDrawer isOpen={showDealDrawer} onClose={() => setShowDealDrawer(false)} onSave={handleSaveDeal} initialDeal={dealToEdit} />
      <SA07ProposalDrawer isOpen={showProposalDrawer} onClose={() => setShowProposalDrawer(false)} onSave={handleSaveProposal} />
      <SA09WonLostModal isOpen={showWonLostModal} onClose={() => setShowWonLostModal(false)} onSave={handleWonLostSave} dealName={selectedDeal?.name || 'Deal'} />
    </div>
  );
}
