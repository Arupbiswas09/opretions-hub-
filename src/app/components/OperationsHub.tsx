import React, { useState } from 'react';
import { OperationsHubSidebar } from './operations/OperationsHubSidebar';
import { BonsaiTopBar } from './bonsai/BonsaiTopBar';
import { T01ListPage } from './operations/templates/T01ListPage';
import { T02KanbanPage } from './operations/templates/T02KanbanPage';
import { T03GridPage } from './operations/templates/T03GridPage';
import { T04DetailPage } from './operations/templates/T04DetailPage';
import { T05ClientPortal, T06EmployeePortal, T07FreelancerPortal } from './operations/templates/PortalShells';

type ViewType = 'list' | 'kanban' | 'grid' | 'detail' | 'client-portal' | 'employee-portal' | 'freelancer-portal';

export default function OperationsHub() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Module configuration
  const moduleConfig: Record<string, { title: string; subtitle: string; defaultView: ViewType }> = {
    dashboard: { 
      title: 'Dashboard', 
      subtitle: 'Overview of your operations',
      defaultView: 'grid'
    },
    sales: { 
      title: 'Sales', 
      subtitle: 'Manage deals and opportunities',
      defaultView: 'kanban'
    },
    contacts: { 
      title: 'Contacts', 
      subtitle: 'Manage your business contacts',
      defaultView: 'list'
    },
    clients: { 
      title: 'Clients', 
      subtitle: 'Manage client relationships',
      defaultView: 'list'
    },
    projects: { 
      title: 'Projects', 
      subtitle: 'Track and manage projects',
      defaultView: 'kanban'
    },
    talent: { 
      title: 'Talent', 
      subtitle: 'Manage freelancers and contractors',
      defaultView: 'grid'
    },
    people: { 
      title: 'People', 
      subtitle: 'Manage team members',
      defaultView: 'list'
    },
    finance: { 
      title: 'Finance', 
      subtitle: 'Financial management and reporting',
      defaultView: 'list'
    },
    support: { 
      title: 'Support', 
      subtitle: 'Customer support and tickets',
      defaultView: 'kanban'
    },
    admin: { 
      title: 'Admin', 
      subtitle: 'System administration',
      defaultView: 'list'
    },
  };

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    // Reset to default view for the module
    if (moduleConfig[moduleId]) {
      setCurrentView(moduleConfig[moduleId].defaultView);
    }
  };

  const currentModuleConfig = moduleConfig[activeModule] || moduleConfig.dashboard;

  // Render current view
  const renderView = () => {
    // Portal views
    if (currentView === 'client-portal') return <T05ClientPortal />;
    if (currentView === 'employee-portal') return <T06EmployeePortal />;
    if (currentView === 'freelancer-portal') return <T07FreelancerPortal />;

    // Template views
    const props = {
      title: currentModuleConfig.title,
      subtitle: currentModuleConfig.subtitle,
    };

    switch (currentView) {
      case 'kanban':
        return <T02KanbanPage {...props} />;
      case 'grid':
        return <T03GridPage {...props} />;
      case 'detail':
        return <T04DetailPage {...props} moduleTabs={[
          { label: 'Tasks', value: 'tasks' },
          { label: 'Notes', value: 'notes' },
        ]} />;
      case 'list':
      default:
        return <T01ListPage {...props} />;
    }
  };

  // If viewing a portal, render it full-screen
  if (['client-portal', 'employee-portal', 'freelancer-portal'].includes(currentView)) {
    return renderView();
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <OperationsHubSidebar
        activeItem={activeModule}
        onItemChange={handleModuleChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <BonsaiTopBar />
        
        {/* View Switcher */}
        <div className="bg-white border-b border-stone-200 px-8 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 mr-2">Template View:</span>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-01 List
            </button>
            <button
              onClick={() => setCurrentView('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'kanban'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-02 Kanban
            </button>
            <button
              onClick={() => setCurrentView('grid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-03 Grid
            </button>
            <button
              onClick={() => setCurrentView('detail')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'detail'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-04 Detail
            </button>
            <div className="w-px h-4 bg-stone-300 mx-2"></div>
            <button
              onClick={() => setCurrentView('client-portal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'client-portal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-05 Client Portal
            </button>
            <button
              onClick={() => setCurrentView('employee-portal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'employee-portal'
                  ? 'bg-primary text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-06 Employee Portal
            </button>
            <button
              onClick={() => setCurrentView('freelancer-portal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'freelancer-portal'
                  ? 'bg-purple-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              T-07 Freelancer Portal
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto bg-stone-50">
          {renderView()}
        </div>
      </div>
    </div>
  );
}
