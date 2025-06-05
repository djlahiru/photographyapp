
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { I18nProviderClient } from '@/components/i18n-provider-client';
import { ACCENT_THEME_LS_KEY, DEFAULT_ACCENT_THEME_VALUE, FONT_THEME_LS_KEY, type AccentThemeValue, type FontTheme, ACCENT_THEMES, FONT_THEMES } from '@/lib/constants';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const applyPersistedThemes = () => {
      // Apply persisted font theme
      const storedFontTheme = localStorage.getItem(FONT_THEME_LS_KEY) as FontTheme | null;
      const fontThemeToApply = storedFontTheme || 'default-sans';

      FONT_THEMES.forEach(theme => { // Use FONT_THEMES from constants
        document.documentElement.classList.remove(`font-theme-${theme.value}`);
      });
      if (fontThemeToApply !== 'default-sans') {
        document.documentElement.classList.add(`font-theme-${fontThemeToApply}`);
      }

      // Apply persisted accent theme, defaulting if none is set
      const storedAccentTheme = localStorage.getItem(ACCENT_THEME_LS_KEY) as AccentThemeValue | null;
      const accentThemeToApply = storedAccentTheme || DEFAULT_ACCENT_THEME_VALUE;

      ACCENT_THEMES.forEach(theme => { // Use ACCENT_THEMES from constants
        document.documentElement.classList.remove(`theme-accent-${theme.value}`);
      });
      document.documentElement.classList.add(`theme-accent-${accentThemeToApply}`);
    };

    applyPersistedThemes(); // Apply on initial mount

    // Listen for theme changes dispatched from the settings page
    const handleThemeChangeEvent = () => applyPersistedThemes();
    window.addEventListener('fontThemeChanged', handleThemeChangeEvent);
    window.addEventListener('accentThemeChanged', handleThemeChangeEvent);


    // App Name logic
    if (typeof window !== 'undefined' && I18nProviderClient && (I18nProviderClient as any).i18n) {
      const i18nInstance = (I18nProviderClient as any).i18n;
       if (i18nInstance.isInitialized) {
        document.title = i18nInstance.t('appName');
       } else {
         i18nInstance.on('initialized', () => {
            document.title = i18nInstance.t('appName');
         });
       }
    } else {
        document.title = "Rubo"; // Fallback
    }

    return () => {
      window.removeEventListener('fontThemeChanged', handleThemeChangeEvent);
      window.removeEventListener('accentThemeChanged', handleThemeChangeEvent);
    };
  }, []);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <I18nProviderClient>
          <ThemeProvider
            attribute="class" // This handles the 'dark' class for light/dark mode
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex-grow flex flex-col">
              {children}
              <ToastContainer theme="colored" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            </div>
            <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
              Copyright 2025 | Developed By Cyber ​​yakku
            </footer>
          </ThemeProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
