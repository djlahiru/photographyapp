
'use client'; 

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { I18nProviderClient } from '@/components/i18n-provider-client';
import { useTheme } from 'next-themes';

type AccentTheme = 'default' | 'oceanic' | 'forest' | 'sunset';
type FontTheme = 'default-sans' | 'classic-serif' | 'modern-mono';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme: nextTheme } = useTheme(); 

  useEffect(() => {
    // Apply persisted accent theme
    const storedAccentTheme = localStorage.getItem('accentTheme') as AccentTheme | null;
    const currentHtmlClasses = document.documentElement.className.split(' ');
    
    currentHtmlClasses.forEach(cls => {
      if (cls.startsWith('theme-accent-')) {
        document.documentElement.classList.remove(cls);
      }
    });

    if (storedAccentTheme && storedAccentTheme !== 'default') {
      document.documentElement.classList.add(`theme-accent-${storedAccentTheme}`);
    }

    // Apply persisted font theme
    const storedFontTheme = localStorage.getItem('fontTheme') as FontTheme | null;
    currentHtmlClasses.forEach(cls => {
      if (cls.startsWith('font-theme-')) {
        document.documentElement.classList.remove(cls);
      }
    });
    if (storedFontTheme && storedFontTheme !== 'default-sans') {
      document.documentElement.classList.add(`font-theme-${storedFontTheme}`);
    }

  }, [nextTheme]); 

  useEffect(() => {
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
        document.title = "WorkFlowZen";
    }
  }, []);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen"> {/* Added flex flex-col and min-h-screen (though min-h-screen is also in globals.css) */}
        <I18nProviderClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex-grow flex flex-col"> {/* Wrapper for children + toast to make it grow */}
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
