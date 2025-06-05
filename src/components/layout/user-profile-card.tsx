
'use client';

import type { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { APP_NAME_KEY, SETTINGS_NAV_ITEM } from '@/lib/constants';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type AvatarShape = 'circle' | 'square';
const USER_PROFILE_LS_KEY = 'userProfile'; // Same key as in settings

interface UserProfileCardProps {
  user?: UserProfile; // Initial user prop, can be overridden by localStorage
}

const defaultUser: UserProfile = {
  id: 'default-1',
  name: 'Admin User', // Fallback name
  email: 'admin@workflowzen.com', // Fallback email
  avatarUrl: 'https://placehold.co/100x100.png', // Fallback avatar
};

export function UserProfileCard({ user: initialUser }: UserProfileCardProps) {
  const { t } = useTranslation();
  const appNameTranslated = t(APP_NAME_KEY);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUser || defaultUser);
  const [avatarShape, setAvatarShape] = useState<AvatarShape>('circle');

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem(USER_PROFILE_LS_KEY);
      if (storedProfile) {
        setCurrentUser(JSON.parse(storedProfile));
      } else if (initialUser) {
        setCurrentUser(initialUser);
      } else {
        setCurrentUser(defaultUser);
      }
    };
    loadProfile();

    const handleProfileUpdate = () => loadProfile();
    const handleAvatarShapeChange = (event: Event) => {
        const customEvent = event as CustomEvent<AvatarShape>;
        if (customEvent.detail) {
            setAvatarShape(customEvent.detail);
        }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('avatarShapeChange', handleAvatarShapeChange);
    
    // Initial shape from localStorage
    const storedShape = localStorage.getItem('avatarShape') as AvatarShape | null;
    if (storedShape) {
      setAvatarShape(storedShape);
    }


    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('avatarShapeChange', handleAvatarShapeChange);
    };
  }, [initialUser]);


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
        <Avatar className={cn(
          "h-12 w-12",
          avatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
        )}>
          <AvatarImage 
            src={currentUser?.avatarUrl} 
            alt={currentUser?.name || appNameTranslated} 
            data-ai-hint="user avatar" 
            className={cn(avatarShape === 'circle' ? 'rounded-full' : 'rounded-md')}
          />
          <AvatarFallback className={cn(
            "bg-sidebar-primary/30 text-sidebar-primary-foreground",
            avatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
          )}>
            {currentUser ? getInitials(currentUser.name) : appNameTranslated.substring(0,2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-sidebar-foreground font-headline">
            {currentUser?.name || appNameTranslated}
          </span>
          {currentUser?.email && (
             <span className="text-xs text-sidebar-foreground/70">{currentUser.email}</span>
          )}
        </div>
      </div>
       <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" asChild>
        <Link href={SETTINGS_NAV_ITEM.href} className="flex items-center space-x-2">
          <SETTINGS_NAV_ITEM.icon className="h-4 w-4" />
          <span>{t(SETTINGS_NAV_ITEM.labelKey)}</span>
        </Link>
      </Button>
    </div>
  );
}
