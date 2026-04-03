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
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Link Contact to Client</h2>
              <p className="text-sm text-stone-500">Select a client to associate with this contact</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-stone-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients by name or industry..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                        : 'border-stone-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-stone-800">{client.name}</p>
                      <p className="text-sm text-stone-600">{client.industry}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">{client.contacts} contacts</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-stone-600">No clients found</p>
                  <p className="text-sm text-stone-500 mt-1">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-sm text-primary hover:underline"
            >
              + Create new client
            </button>
            <div className="flex items-center gap-3">
              <BonsaiButton variant="ghost" onClick={onClose}>
                Cancel
              </BonsaiButton>
              <BonsaiButton 
                variant="primary" 
                onClick={handleLink}
                disabled={!selectedClient}
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
