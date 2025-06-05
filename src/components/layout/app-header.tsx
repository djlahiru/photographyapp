
'use client';

import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getGreetingParts } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Bell, Search, Moon, Sun as SunIcon, Globe, Sunrise, Sunset } from 'react-feather'; // Sun aliased to SunIcon
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const MOCK_USER_NAME = "Admin";

const GREETING_ICON_MAP: Record<string, React.ElementType> = {
  Sunrise: Sunrise,
  Sun: SunIcon,
  Sunset: Sunset,
  Moon: Moon, // Moon icon is also used for theme toggle, can be reused
};

export function AppHeader() {
  const { t, i18n } = useTranslation();
  const [greeting, setGreeting] = useState('');
  const [greetingIconName, setGreetingIconName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isMobileView = useIsMobile();

  useEffect(() => {
    setUserName(MOCK_USER_NAME);
  }, []);

  useEffect(() => {
    const { greetingKey, name, iconName } = getGreetingParts(userName);
    const translatedGreeting = t(greetingKey);
    setGreeting(name ? `${translatedGreeting}, ${name}!` : `${translatedGreeting}!`);
    setGreetingIconName(iconName);
  }, [userName, t, i18n.language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const GreetingIconComponent = greetingIconName ? GREETING_ICON_MAP[greetingIconName] : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {mounted && !isMobileView && <SidebarTrigger />}
      <div className="flex-1 flex items-center gap-2">
        {GreetingIconComponent && <GreetingIconComponent className="h-6 w-6 text-primary" />}
        <h1 className="text-lg font-semibold text-foreground font-headline">{greeting}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder={t('searchPlaceholder')} className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background" />
        </div>

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
