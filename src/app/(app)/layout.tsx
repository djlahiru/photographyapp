
'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { BottomNavigationBar } from '@/components/layout/bottom-navigation-bar';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobileView = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // To prevent hydration mismatch, render nothing or a loader until client-side check is complete
    // Or, render a default layout that works for both, then adjust.
    // For simplicity here, we'll delay rendering based on isMobileView until mounted.
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {/* Optional: Add a loading spinner here */}
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
          isMobileView && "pb-24" // Increased padding for bottom nav + FAB
        )}>
         {children}
        </div>
        {/* Adjust FAB position slightly if mobile nav is present */}
        <div className={cn(isMobileView && "bottom-20 right-6 fixed z-40", !isMobileView && "fixed bottom-6 right-6 z-40")}>
            <FloatingActionButton />
        </div>
      </main>
      {isMobileView && <BottomNavigationBar />}
    </SidebarProvider>
  );
}
