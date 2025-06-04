import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ListChecks, Package, Users, BookOpen, CalendarDays, Settings, Briefcase } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/packages', label: 'Packages', icon: Package },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  href: '/settings',
  label: 'Settings',
  icon: Settings,
};

export const APP_NAME = "WorkFlowZen";
