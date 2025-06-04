
'use client';

import type { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// Settings icon is imported from constants, which now uses react-feather's Settings
import Link from 'next/link';
import { APP_NAME, SETTINGS_NAV_ITEM } from '@/lib/constants';
import { Button } from '../ui/button';

interface UserProfileCardProps {
  user?: UserProfile; // Make user optional for skeleton/loading states
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col items-start p-4 border-b border-sidebar-border">
      <div className="flex items-center w-full space-x-3 mb-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.avatarUrl} alt={user?.name || APP_NAME} data-ai-hint="user avatar" />
          <AvatarFallback>{user ? getInitials(user.name) : APP_NAME.substring(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-sidebar-foreground font-headline">
            {user?.name || APP_NAME}
          </span>
          {user?.email && (
             <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
          )}
        </div>
      </div>
       <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
        <Link href={SETTINGS_NAV_ITEM.href} className="flex items-center space-x-2">
          <SETTINGS_NAV_ITEM.icon className="h-4 w-4" />
          <span>{SETTINGS_NAV_ITEM.label}</span>
        </Link>
      </Button>
    </div>
  );
}
