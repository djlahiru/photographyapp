
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
import { NAV_ITEMS, SETTINGS_NAV_ITEM } from '@/lib/constants';
import type { UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LogOut } from 'react-feather';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react'; // Import React, useEffect, useState

// Mock user data for now
const mockUser: UserProfile = {
  id: '1',
  name: 'Admin User',
  email: 'admin@workflowzen.com',
  avatarUrl: 'https://placehold.co/100x100.png',
};

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [themeUpdateKey, setThemeUpdateKey] = useState(0); // For forcing re-render on theme change

  useEffect(() => {
    const handleThemeUpdate = () => {
      setThemeUpdateKey(k => k + 1);
    };
    window.addEventListener('accentThemeChanged', handleThemeUpdate);
    window.addEventListener('fontThemeChanged', handleThemeUpdate); // Also listen for font changes if they affect sidebar
    return () => {
      window.removeEventListener('accentThemeChanged', handleThemeUpdate);
      window.removeEventListener('fontThemeChanged', handleThemeUpdate);
    };
  }, []);


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
      <SidebarHeader>
        <UserProfileCard user={mockUser} />
      </SidebarHeader>
      <SidebarContent key={themeUpdateKey}> {/* Add key here to force re-render of content */}
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive} // This prop might not be directly used by SidebarMenuButton for styling anymore
                    tooltip={t(item.labelKey)}
                    className={cn(
                      "justify-start",
                      isActive
                        ? "sidebar-menu-button--active" // Custom class for gradient
                        : "sidebar-menu-button--inactive text-sidebar-foreground" // Ensures correct hover and text for inactive
                    )}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.labelKey)}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Settings item, pushed to the bottom of SidebarContent */}
        <SidebarMenu className="mt-auto pt-2 border-t border-sidebar-border/30"> 
          <SidebarMenuItem key={SETTINGS_NAV_ITEM.href}>
            <Link href={SETTINGS_NAV_ITEM.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === SETTINGS_NAV_ITEM.href || pathname.startsWith(SETTINGS_NAV_ITEM.href)}
                tooltip={t(SETTINGS_NAV_ITEM.labelKey)}
                className={cn(
                  "justify-start",
                  (pathname === SETTINGS_NAV_ITEM.href || pathname.startsWith(SETTINGS_NAV_ITEM.href))
                    ? "sidebar-menu-button--active"
                    : "sidebar-menu-button--inactive text-sidebar-foreground"
                )}
              >
                <a>
                  <SETTINGS_NAV_ITEM.icon className="h-5 w-5" />
                  <span>{t(SETTINGS_NAV_ITEM.labelKey)}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <div className="p-2">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="h-5 w-5 mr-2" />
                <span>{t('logout')}</span>
            </Button>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
