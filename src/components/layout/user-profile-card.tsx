
'use client';

import type { UserProfile, AvatarShape } from '@/types'; // Updated import
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { APP_NAME_KEY } from '@/lib/constants';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { USER_PROFILE_LS_KEY, AVATAR_SHAPE_LS_KEY, SETTINGS_NAV_ITEM } from '@/lib/constants'; // Import constants

interface UserProfileCardProps {
  user?: UserProfile;
}

const defaultUser: UserProfile = {
  id: 'default-1',
  name: 'Admin User',
  email: 'admin@workflowzen.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  bio: 'Default bio for user card.',
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
        try {
          const parsedProfile: UserProfile = JSON.parse(storedProfile);
          setCurrentUser(parsedProfile);
        } catch (e) {
          console.error("Failed to parse user profile from localStorage", e);
          setCurrentUser(initialUser || defaultUser); // Fallback to initial or default
        }
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
        const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
        if (customEvent.detail) { // Prefer event detail if available
            setAvatarShape(customEvent.detail);
        } else if (storedShape) { // Fallback to localStorage
            setAvatarShape(storedShape);
        } else {
            setAvatarShape('circle'); // Absolute fallback
        }
    };

    const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
    if (storedShape) {
      setAvatarShape(storedShape);
    }

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('avatarShapeChange', handleAvatarShapeChange);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('avatarShapeChange', handleAvatarShapeChange);
    };
  }, [initialUser]);


  const getInitials = (name: string = "User") => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || "U";
  };

  return (
    <Link href={SETTINGS_NAV_ITEM.href} className="block hover:bg-sidebar-accent/10 transition-colors">
      <div className="flex flex-col items-center p-4 border-b border-sidebar-border text-center">
        <Avatar className={cn(
          "h-20 w-20 mb-3", // Increased avatar size and added bottom margin
          avatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
        )}>
          <AvatarImage
            src={currentUser?.avatarUrl}
            alt={currentUser?.name || appNameTranslated}
            data-ai-hint="user avatar"
            className={cn(avatarShape === 'circle' ? 'rounded-full' : 'rounded-md')}
          />
          <AvatarFallback className={cn(
            "text-2xl bg-sidebar-primary/30 text-sidebar-primary-foreground", // Larger fallback text
            avatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
          )}>
            {currentUser ? getInitials(currentUser.name) : appNameTranslated.substring(0,2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center overflow-hidden">
          <span className="text-lg font-semibold text-sidebar-foreground font-headline truncate max-w-[200px]">
            {currentUser?.name || appNameTranslated}
          </span>
          {currentUser?.email && (
             <span className="text-xs text-sidebar-foreground/70 truncate max-w-[200px]">{currentUser.email}</span>
          )}
          {currentUser?.bio && (
            <p className="text-xs text-sidebar-foreground/60 mt-1.5 italic max-w-[220px] line-clamp-2">
              {currentUser.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
