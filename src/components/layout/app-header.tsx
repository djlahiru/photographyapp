
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { getGreetingParts } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Bell, Globe, Sunrise, Sunset, Moon, Sun as SunIcon } from 'react-feather';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { UserProfile, AvatarShape } from '@/types';
import { USER_PROFILE_LS_KEY, AVATAR_SHAPE_LS_KEY, SETTINGS_NAV_ITEM } from '@/lib/constants';

const GREETING_ICON_MAP: Record<string, React.ElementType> = {
  Sunrise: Sunrise,
  Sun: SunIcon,
  Sunset: Sunset,
  Moon: Moon,
};

const defaultUser: UserProfile = {
  id: 'default-user-header',
  name: 'User',
  email: 'user@example.com',
  avatarUrl: 'https://placehold.co/80x80.png',
};

const getInitials = (name: string = "User") => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';
};

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const sidebarContext = useSidebar();
  const [greeting, setGreeting] = useState('');
  const [greetingIconName, setGreetingIconName] = useState<string | null>(null);
  const [dynamicUserName, setDynamicUserName] = useState<string | undefined>("User");
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isMobileView = useIsMobile();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [headerUser, setHeaderUser] = useState<UserProfile>(defaultUser);
  const [headerAvatarShape, setHeaderAvatarShape] = useState<AvatarShape>('circle');


  useEffect(() => {
    const loadProfileAndShape = () => {
      const storedProfile = localStorage.getItem(USER_PROFILE_LS_KEY);
      if (storedProfile) {
        try {
          const profile: UserProfile = JSON.parse(storedProfile);
          setHeaderUser(profile);
          setDynamicUserName(profile.name || "User");
        } catch (e) {
          console.error("Failed to parse user profile for header", e);
          setHeaderUser(defaultUser);
          setDynamicUserName(defaultUser.name);
        }
      } else {
        setHeaderUser(defaultUser);
        setDynamicUserName(defaultUser.name);
      }

      const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
      setHeaderAvatarShape(storedShape || 'circle');
    };

    loadProfileAndShape(); // Initial load

    const handleProfileUpdate = () => loadProfileAndShape(); // Reloads both profile and shape
    const handleAvatarShapeChange = () => { // Specifically for shape
        const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
        setHeaderAvatarShape(storedShape || 'circle');
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('avatarShapeChange', handleAvatarShapeChange);

    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('avatarShapeChange', handleAvatarShapeChange);
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    const { greetingKey, name, iconName } = getGreetingParts(dynamicUserName);
    const translatedGreeting = t(greetingKey);
    setGreeting(name ? `${translatedGreeting}, ${name}!` : `${translatedGreeting}!`);
    setGreetingIconName(iconName);
  }, [dynamicUserName, t, i18n.language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const GreetingIconComponent = greetingIconName ? GREETING_ICON_MAP[greetingIconName] : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {mounted && !isMobileView && (
        <SidebarTrigger />
      )}

      {/* Compact Profile for Collapsed Desktop Sidebar */}
      {mounted && !isMobileView && !sidebarContext.open && headerUser && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={SETTINGS_NAV_ITEM.href} passHref legacyBehavior>
                <a className="flex items-center p-1 rounded-md hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Profile: ${headerUser.name}`}>
                  <Avatar className={cn(
                    "h-8 w-8", 
                    headerAvatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
                  )}>
                    <AvatarImage src={headerUser.avatarUrl} alt={headerUser.name} data-ai-hint="user avatar" />
                    <AvatarFallback className={cn(
                      "text-xs",
                      headerAvatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
                    )}>
                      {getInitials(headerUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </a>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <p className="font-semibold">{headerUser.name}</p>
              {headerUser.email && <p className="text-xs text-muted-foreground">{headerUser.email}</p>}
              <p className="text-xs text-muted-foreground mt-1">Go to Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className={cn(
        "flex-1 flex items-center",
         mounted && !isMobileView && !sidebarContext.open && headerUser ? "gap-1 sm:gap-2" : "gap-2" // Adjust gap if avatar is present
      )}>
        {GreetingIconComponent && <GreetingIconComponent className="h-6 w-6 text-primary" />}
        <h1 className="text-lg font-semibold text-foreground font-headline truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md">
          {greeting}
        </h1>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto"> {/* Ensure this group is pushed to the right */}
        <p className="text-xs sm:text-sm text-muted-foreground hidden md:block whitespace-nowrap">
          {format(currentDateTime, "E, MMM d, yyyy, HH:mm:ss")}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('language')}>
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
              {t('english')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('si')} disabled={i18n.language === 'si'}>
              {t('sinhala')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeLanguage('ta')} disabled={i18n.language === 'ta'}>
              {t('tamil')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label={t('toggleTheme')}
            className="rounded-full"
          >
            {resolvedTheme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('toggleNotifications')}>
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
