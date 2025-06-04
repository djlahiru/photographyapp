import type { ElementType } from 'react';
import { Layout, List, Package, Users, BookOpen, Calendar, Settings as SettingsIcon, Briefcase } from 'react-feather';

export interface NavItem {
  href: string;
  label: string;
  icon: ElementType; // Changed from LucideIcon
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Layout },
  { href: '/tasks', label: 'Tasks', icon: List }, // Was ListChecks, List is a close equivalent
  { href: '/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: Calendar }, // Was CalendarDays
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/packages', label: 'Packages', icon: Package },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  href: '/settings',
  label: 'Settings',
  icon: SettingsIcon, // Renamed to avoid conflict with Settings component if any
};

export const APP_NAME = "WorkFlowZen";
