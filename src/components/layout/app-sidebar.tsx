
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserProfileCard } from './user-profile-card';
import { NAV_ITEMS, APP_NAME, SETTINGS_NAV_ITEM } from '@/lib/constants';
import type { UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LogOut } from 'react-feather';

// Mock user data for now
const mockUser: UserProfile = {
  id: '1',
  name: 'Admin User',
  email: 'admin@workflowzen.com',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
      <SidebarHeader>
        <UserProfileCard user={mockUser} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         {/* Placeholder for logout or other footer items */}
         <div className="p-2">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="h-5 w-5 mr-2" />
                <span>Logout</span>
            </Button>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
