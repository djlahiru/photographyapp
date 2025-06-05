
'use client'; 

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { I18nProviderClient } from '@/components/i18n-provider-client';
// Removed useTheme import as it's not directly used here for class manipulation

type FontTheme = 'default-sans' | 'classic-serif' | 'modern-mono';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const applyCustomThemes = () => {
      // Ensure default accent theme is applied if no other is specified (though others are removed now)
      document.documentElement.classList.forEach(cls => {
        if (cls.startsWith('theme-accent-') && cls !== 'theme-accent-default') {
          document.documentElement.classList.remove(cls);
        }
      });
      if (!document.documentElement.classList.contains('theme-accent-default')) {
        document.documentElement.classList.add('theme-accent-default');
      }

      // Apply persisted font theme
      const storedFontTheme = localStorage.getItem('fontTheme') as FontTheme | null;
      document.documentElement.classList.forEach(cls => {
        if (cls.startsWith('font-theme-')) {
          document.documentElement.classList.remove(cls);
        }
      });
      if (storedFontTheme && storedFontTheme !== 'default-sans') {
        document.documentElement.classList.add(`font-theme-${storedFontTheme}`);
      }
      // Default font is applied via body tag in globals.css, so no explicit add for default-sans needed here
    };

    applyCustomThemes(); // Apply on initial mount

    // Listen for theme changes dispatched from the settings page
    window.addEventListener('fontThemeChanged', applyCustomThemes);

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
      window.removeEventListener('fontThemeChanged', applyCustomThemes);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


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
