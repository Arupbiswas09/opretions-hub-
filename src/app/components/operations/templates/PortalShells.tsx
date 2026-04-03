import React, { useState } from 'react';
import { Home, FileText, Receipt, MessageSquare, Settings, Bell, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../../ui/utils';

interface PortalShellProps {
  portalType: 'client' | 'employee' | 'freelancer';
  children?: React.ReactNode;
}

export function PortalShell({ portalType, children }: PortalShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const portalConfig = {
    client: {
      name: 'Client Portal',
      logo: 'CP',
      color: 'from-blue-500 to-blue-600',
      menuItems: [
        { icon: Home, label: 'Dashboard', active: true },
        { icon: FileText, label: 'Projects', badge: '3' },
        { icon: Receipt, label: 'Invoices' },
        { icon: MessageSquare, label: 'Messages', badge: '5' },
        { icon: Settings, label: 'Settings' },
      ],
    },
    employee: {
      name: 'Employee Portal',
      logo: 'EP',
      color: 'from-primary to-green-600',
      menuItems: [
        { icon: Home, label: 'Dashboard', active: true },
        { icon: FileText, label: 'Time Tracking' },
        { icon: Receipt, label: 'Expenses' },
        { icon: MessageSquare, label: 'Team Chat', badge: '12' },
        { icon: Settings, label: 'Profile' },
      ],
    },
    freelancer: {
      name: 'Freelancer Portal',
      logo: 'FP',
      color: 'from-purple-500 to-pink-600',
      menuItems: [
        { icon: Home, label: 'Dashboard', active: true },
        { icon: FileText, label: 'My Projects', badge: '2' },
        { icon: Receipt, label: 'Payments' },
        { icon: MessageSquare, label: 'Messages', badge: '3' },
        { icon: Settings, label: 'Settings' },
      ],
    },
  }[portalType];

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col">
        {/* Logo */}
        <div className="h-16 px-4 flex items-center border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", portalConfig.color)}>
              <span className="text-white font-semibold text-sm">{portalConfig.logo}</span>
            </div>
            <span className="font-semibold text-stone-800">{portalConfig.name}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {portalConfig.menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left text-sm">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-stone-200">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 cursor-pointer">
            <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center", portalConfig.color)}>
              <span className="text-white font-semibold text-sm">JD</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-800">John Doe</p>
              <p className="text-xs text-stone-500">john@example.com</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-sm text-stone-600 hover:bg-stone-100 rounded-lg">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="font-semibold text-stone-800">Welcome back, John!</h2>
              <p className="text-xs text-stone-500">Here's what's happening today</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {children || (
            <div className="max-w-6xl mx-auto">
              {/* Welcome Banner */}
              <div className={cn("bg-gradient-to-r text-white rounded-lg p-6 mb-6", portalConfig.color)}>
                <h1 className="text-2xl font-semibold mb-2">Welcome to your {portalConfig.name}</h1>
                <p className="text-white/90">Everything you need in one place</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-stone-200 p-4">
                  <p className="text-sm text-stone-600">Active Items</p>
                  <p className="text-2xl font-semibold text-stone-800 mt-1">5</p>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-4">
                  <p className="text-sm text-stone-600">Pending Tasks</p>
                  <p className="text-2xl font-semibold text-stone-800 mt-1">3</p>
                </div>
                <div className="bg-white rounded-lg border border-stone-200 p-4">
                  <p className="text-sm text-stone-600">This Month</p>
                  <p className="text-2xl font-semibold text-stone-800 mt-1">$12,450</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <h3 className="font-semibold text-stone-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { title: 'New project created', time: '2 hours ago', icon: FileText },
                    { title: 'Invoice sent', time: '1 day ago', icon: Receipt },
                    { title: 'Message received', time: '2 days ago', icon: MessageSquare },
                  ].map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 hover:bg-stone-50 rounded-lg cursor-pointer">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-stone-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-800">{activity.title}</p>
                          <p className="text-xs text-stone-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white" onClick={(e) => e.stopPropagation()}>
            {/* Mobile menu content (same as desktop sidebar) */}
            <div className="h-16 px-4 flex items-center border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", portalConfig.color)}>
                  <span className="text-white font-semibold text-sm">{portalConfig.logo}</span>
                </div>
                <span className="font-semibold text-stone-800">{portalConfig.name}</span>
              </div>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {portalConfig.menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-stone-600 hover:bg-stone-100"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Portal Components
export function T05ClientPortal() {
  return <PortalShell portalType="client" />;
}

export function T06EmployeePortal() {
  return <PortalShell portalType="employee" />;
}

export function T07FreelancerPortal() {
  return <PortalShell portalType="freelancer" />;
}
