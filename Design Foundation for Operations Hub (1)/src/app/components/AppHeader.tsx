import React from 'react';
import { Search, Bell, ChevronDown, User } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useUser, UserRole, getRoleLabel } from '@/app/contexts/UserContext';
import { Badge } from '@/app/components/ui/badge';

export const AppHeader = () => {
  const { currentUser, switchUser } = useUser();

  const allRoles: UserRole[] = [
    'founder',
    'sales',
    'recruiter',
    'hr',
    'delivery',
    'client',
    'freelancer',
    'consultant',
    'candidate',
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left section - Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-surface"
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-3">
        {/* Switch User Dropdown (Demo/Testing) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Switch User</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Switch User (Demo)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allRoles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => switchUser(role)}
                className="flex items-center justify-between"
              >
                <span>{getRoleLabel(role)}</span>
                {currentUser.role === role && (
                  <Badge variant="secondary" className="text-xs">Current</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2 pr-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start text-sm">
                <span className="font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{getRoleLabel(currentUser.role)}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span>{currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{currentUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
