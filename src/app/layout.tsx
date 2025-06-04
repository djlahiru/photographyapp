
'use client'; // Root layout needs to be client for useEffect to apply theme from localStorage

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { I18nProviderClient } from '@/components/i18n-provider-client';
import { useTheme } from 'next-themes';

// Metadata has to be static or generated in generateMetadata for server components.
// For a fully dynamic title based on client-side i18n, it's more complex.
// export const metadata: Metadata = {
//   title: 'WorkFlowZen',
//   description: 'Manage your work with zen-like focus.',
// };

type AccentTheme = 'default' | 'oceanic' | 'forest' | 'sunset';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme: nextTheme } = useTheme(); // For knowing light/dark mode

  useEffect(() => {
    // Apply persisted accent theme from localStorage
    const storedAccentTheme = localStorage.getItem('accentTheme') as AccentTheme | null;
    const currentHtmlClasses = document.documentElement.className.split(' ');
    
    // Remove any existing accent theme classes
    currentHtmlClasses.forEach(cls => {
      if (cls.startsWith('theme-accent-')) {
        document.documentElement.classList.remove(cls);
      }
    });

    if (storedAccentTheme && storedAccentTheme !== 'default') {
      document.documentElement.classList.add(`theme-accent-${storedAccentTheme}`);
    }
  }, [nextTheme]); // Rerun if nextTheme changes to ensure accent theme is reapplied correctly with light/dark

  // Set document title using i18n after mount
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
        // Fallback title if i18n is not ready
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
      <body className="font-body antialiased">
        <I18nProviderClient>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToastContainer theme="colored" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          </ThemeProvider>
        </I18nProviderClient>
      </body>
    </html>
  );
}
