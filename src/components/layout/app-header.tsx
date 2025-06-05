
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { getGreetingParts, getSelectedDateFormat, getActualClockFormatString, getSelectedClockFormatValue } from '@/lib/date-utils';
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
import { USER_PROFILE_LS_KEY, AVATAR_SHAPE_LS_KEY, SETTINGS_NAV_ITEM, APP_NAME_KEY, DEFAULT_DATE_FORMAT, type DateFormatValue, DEFAULT_CLOCK_FORMAT_VALUE, type ClockFormatValue } from '@/lib/constants';

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
  const [displayDateFormat, setDisplayDateFormat] = useState<DateFormatValue>(DEFAULT_DATE_FORMAT);
  const [displayClockFormatString, setDisplayClockFormatString] = useState<string>(getActualClockFormatString(DEFAULT_CLOCK_FORMAT_VALUE));

  const [headerUser, setHeaderUser] = useState<UserProfile>(defaultUser);
  const [headerAvatarShape, setHeaderAvatarShape] = useState<AvatarShape>('circle');


  useEffect(() => {
    const loadProfileAndShape = () => {
      const storedProfile = localStorage.getItem(USER_PROFILE_LS_KEY);
      let profileToUse = defaultUser;
      if (storedProfile) {
        try {
          const parsedProfile: UserProfile = JSON.parse(storedProfile);
          profileToUse = { ...defaultUser, ...parsedProfile };
        } catch (e) {
          console.error("Failed to parse user profile for header", e);
          profileToUse = defaultUser;
        }
      }
      setHeaderUser(profileToUse);
      setDynamicUserName(profileToUse.name || "User");


      const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
      setHeaderAvatarShape(storedShape || 'circle');
    };

    loadProfileAndShape();
    setDisplayDateFormat(getSelectedDateFormat());
    setDisplayClockFormatString(getActualClockFormatString());


    const handleProfileUpdate = () => loadProfileAndShape();
    const handleAvatarShapeChange = (event: Event) => {
        const customEvent = event as CustomEvent<AvatarShape>;
        const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
        if (customEvent.detail) {
            setHeaderAvatarShape(customEvent.detail);
        } else if (storedShape) {
            setHeaderAvatarShape(storedShape);
        } else {
            setHeaderAvatarShape('circle');
        }
    };
    const handleDateFormatChange = () => {
      setDisplayDateFormat(getSelectedDateFormat());
    };
    const handleClockFormatChange = () => {
      setDisplayClockFormatString(getActualClockFormatString());
    };


    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('avatarShapeChange', handleAvatarShapeChange);
    window.addEventListener('dateFormatChanged', handleDateFormatChange);
    window.addEventListener('clockFormatChanged', handleClockFormatChange);


    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second for live clock

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('avatarShapeChange', handleAvatarShapeChange);
      window.removeEventListener('dateFormatChanged', handleDateFormatChange);
      window.removeEventListener('clockFormatChanged', handleClockFormatChange);
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

  const formattedDatePart = format(currentDateTime, displayDateFormat);
  const dayOfWeekPart = format(currentDateTime, "E");
  const timePart = format(currentDateTime, displayClockFormatString); // Use dynamic clock format
  const fullDateTimeString = `${dayOfWeekPart}, ${formattedDatePart}, ${timePart}`;


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 relative">
      {/* Left Group */}
      <div className="flex items-center gap-1 md:gap-2">
        {mounted && !isMobileView && (
          <SidebarTrigger />
        )}
        {mounted && !isMobileView && !sidebarContext.open && headerUser && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={SETTINGS_NAV_ITEM.href}
                  className="flex items-center p-1 rounded-md hover:bg-accent focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Profile: ${headerUser.name}`}>
                    <Avatar className={cn(
                      "h-8 w-8",
                      headerAvatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
                    )}>
                      <AvatarImage src={headerUser.avatarUrl} alt={headerUser.name || 'User avatar'} data-ai-hint="user avatar" />
                      <AvatarFallback className={cn(
                        "text-xs",
                        headerAvatarShape === 'circle' ? 'rounded-full' : 'rounded-md'
                      )}>
                        {getInitials(headerUser.name)}
                      </AvatarFallback>
                    </Avatar>
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
         <div className="flex items-center">
            {GreetingIconComponent && <GreetingIconComponent className="h-6 w-6 text-primary mr-2" />}
            <h1 className="text-base sm:text-lg font-semibold text-foreground font-headline truncate max-w-[100px] xs:max-w-[120px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-sm">
            {greeting}
            </h1>
        </div>
      </div>

      {/* Logo - Centered */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Link href="/dashboard" aria-label={`${t(APP_NAME_KEY)} Dashboard`}>
            <Image
              src="/images/new-company-logo.png"
              alt={`${t(APP_NAME_KEY)} Logo`}
              width={160}
              height={27}
              priority
              className="hidden sm:block"
            />
             <Image
              src="/images/new-company-logo.png"
              alt={`${t(APP_NAME_KEY)} Logo`}
              width={80}
              height={14}
              priority
              className="block sm:hidden"
            />
        </Link>
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <p className="text-sm text-muted-foreground hidden lg:block whitespace-nowrap mr-2">
          {fullDateTimeString}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 sm:h-8 sm:w-8" aria-label={t('language')}>
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            className="rounded-full h-7 w-7 sm:h-8 sm:w-8"
          >
            {resolvedTheme === 'dark' ? (
              <SunIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 sm:h-8 sm:w-8" aria-label={t('toggleNotifications')}>
          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </header>
  );
}
