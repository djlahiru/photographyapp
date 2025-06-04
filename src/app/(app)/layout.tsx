
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen relative"> {/* Added relative for potential children positioning */}
        <AppHeader />
        <div className="flex-1 p-6 content-area-gradient overflow-auto">
         {children}
        </div>
        <FloatingActionButton />
      </main>
    </SidebarProvider>
  );
}
