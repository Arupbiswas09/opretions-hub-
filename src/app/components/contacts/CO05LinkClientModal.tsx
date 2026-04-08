'use client';
import React, { useEffect, useState } from 'react';
import { X, Search, Building2, Loader2 } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';

interface CO05LinkClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (clientId: string) => void;
}

interface ClientOption {
  id: string;
  name: string;
  industry: string;
}

export function CO05LinkClientModal({ isOpen, onClose, onLink }: CO05LinkClientModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/clients?page=1&limit=100', { credentials: 'include' })
      .then(r => r.json())
      .then(json => {
        if (Array.isArray(json.data)) {
          setClients(json.data.map((r: any) => ({
            id: String(r.id),
            name: String(r.name || ''),
            industry: '—',
          })));
        }
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLink = () => {
    if (selectedClient) {
      onLink(selectedClient);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-modal-overlay" onClick={onClose}>
        <div
          className="rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--popover)', border: '1px solid var(--border)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>Link to Client</h2>
              <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Associate this contact with a client organization</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]" style={{ color: 'var(--muted-foreground)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search clients…"
                className="w-full rounded-lg py-[6px] pl-8 pr-3 text-[11px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                style={{ background: 'var(--search-bg)', border: '1px solid var(--search-border)', color: 'var(--foreground)' }}
                autoFocus
              />
            </div>
          </div>

          {/* Client List */}
          <div className="px-5 py-3 max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredClients.length > 0 ? (
                  filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left"
                      style={{
                        background: selectedClient === client.id ? 'rgba(37,99,235,0.08)' : 'transparent',
                        border: `1.5px solid ${selectedClient === client.id ? 'rgba(37,99,235,0.30)' : 'var(--border)'}`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #2563EB, #6366F1)' }}>
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate" style={{ color: 'var(--foreground)' }}>{client.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{client.industry}</p>
                      </div>
                      {selectedClient === client.id && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#2563EB' }} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>No clients found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-end gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <BonsaiButton variant="ghost" onClick={onClose} type="button">Cancel</BonsaiButton>
            <BonsaiButton variant="primary" onClick={handleLink} disabled={!selectedClient} type="button">Link Client</BonsaiButton>
          </div>
        </div>
      </div>
    </>
  );
}
