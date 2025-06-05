
'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation-bar';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_STATUS_LS_KEY } from '@/lib/constants';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobileView = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Check authentication status
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem(AUTH_STATUS_LS_KEY) === 'true';
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background content-area-gradient">
        <p className="text-lg text-primary">Loading Application...</p>
      </div>
    );
  }
  
  // Further check to prevent rendering children if redirecting
  if (typeof window !== 'undefined' && localStorage.getItem(AUTH_STATUS_LS_KEY) !== 'true') {
    // Still show loading or a minimal layout while redirect is in progress
     return (
      <div className="flex min-h-screen items-center justify-center bg-background content-area-gradient">
        <p className="text-lg text-primary">Redirecting to login...</p>
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen={!isMobileView}>
      {!isMobileView && <AppSidebar />}
      <main className="flex-1 flex flex-col min-h-screen relative">
        <AppHeader />
        <div className={cn(
          "flex-1 p-6 content-area-gradient overflow-auto",
          isMobileView && "pb-24" 
        )}>
         {children}
        </div>
        <div className="fixed bottom-6 right-6 z-50">
          <FloatingActionButton />
        </div>
      </main>
      {isMobileView && <BottomNavigationBar />}
    </SidebarProvider>
  );
}
