import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { BonsaiButton } from '../bonsai/BonsaiButton';
import { BonsaiInput } from '../bonsai/BonsaiFormFields';

interface CO05LinkClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (clientId: string) => void;
}

export function CO05LinkClientModal({ isOpen, onClose, onLink }: CO05LinkClientModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const clients = [
    { id: '1', name: 'Acme Corp', industry: 'Technology', contacts: 5 },
    { id: '2', name: 'Tech Startup', industry: 'Software', contacts: 3 },
    { id: '3', name: 'Local Retail', industry: 'Retail', contacts: 2 },
    { id: '4', name: 'FinTech Startup', industry: 'Finance', contacts: 4 },
    { id: '5', name: 'Partner Agency', industry: 'Marketing', contacts: 8 },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 hub-modal-overlay"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="hub-modal-solid rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Link contact to client</h2>
              <p className="text-sm text-muted-foreground">Select a client to associate with this contact</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients by name or industry..."
                className="hub-field pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      selectedClient === client.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.industry}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{client.contacts} contacts</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No clients found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-primary hover:underline"
            >
              + Create new client
            </button>
            <div className="flex items-center gap-3">
              <BonsaiButton variant="ghost" onClick={onClose} type="button">
                Cancel
              </BonsaiButton>
              <BonsaiButton 
                variant="primary" 
                onClick={handleLink}
                disabled={!selectedClient}
                type="button"
              >
                Link Client
              </BonsaiButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
