
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Import useRouter
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
import { NAV_ITEMS, SETTINGS_NAV_ITEM, AUTH_STATUS_LS_KEY } from '@/lib/constants';
import type { UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LogOut } from 'react-feather';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react'; 
import { toast } from 'react-toastify';


export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Initialize router
  const { t } = useTranslation();
  const [themeUpdateKey, setThemeUpdateKey] = useState(0);

  useEffect(() => {
    const handleThemeUpdate = () => {
      setThemeUpdateKey(k => k + 1);
    };
    window.addEventListener('accentThemeChanged', handleThemeUpdate);
    window.addEventListener('fontThemeChanged', handleThemeUpdate); 
    return () => {
      window.removeEventListener('accentThemeChanged', handleThemeUpdate);
      window.removeEventListener('fontThemeChanged', handleThemeUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STATUS_LS_KEY);
    toast.info("You have been logged out.");
    router.push('/login');
  };


  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
      <SidebarHeader>
        <UserProfileCard /> {/* User prop is now handled internally by UserProfileCard */}
      </SidebarHeader>
      <SidebarContent key={themeUpdateKey}> 
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive} 
                    tooltip={t(item.labelKey)}
                    className={cn(
                      "justify-start py-3", 
                      isActive
                        ? "sidebar-menu-button--active" 
                        : "sidebar-menu-button--inactive text-sidebar-foreground" 
                    )}
                  >
                    <a>
                      <item.icon className="h-6 w-6" /> 
                      <span className="text-base font-semibold">{t(item.labelKey)}</span> 
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarMenu className="mt-auto pt-2 border-t border-sidebar-border/30"> 
          <SidebarMenuItem key={SETTINGS_NAV_ITEM.href}>
            <Link href={SETTINGS_NAV_ITEM.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === SETTINGS_NAV_ITEM.href || pathname.startsWith(SETTINGS_NAV_ITEM.href)}
                tooltip={t(SETTINGS_NAV_ITEM.labelKey)}
                className={cn(
                  "justify-start py-3", 
                  (pathname === SETTINGS_NAV_ITEM.href || pathname.startsWith(SETTINGS_NAV_ITEM.href))
                    ? "sidebar-menu-button--active"
                    : "sidebar-menu-button--inactive text-sidebar-foreground"
                )}
              >
                <a>
                  <SETTINGS_NAV_ITEM.icon className="h-6 w-6" /> 
                  <span className="text-base font-semibold">{t(SETTINGS_NAV_ITEM.labelKey)}</span> 
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleLogout} // Add onClick handler
            > 
                <LogOut className="h-6 w-6 mr-2" /> 
                <span className="text-base font-semibold">{t('logout')}</span> 
            </Button>
         </div>
      </SidebarFooter>
    </Sidebar>
  );
}
