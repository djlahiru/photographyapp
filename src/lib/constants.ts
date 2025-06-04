
import type { ElementType } from 'react';
import { Layout, List, Package, Users, BookOpen, Calendar, Settings as SettingsIcon } from 'react-feather';

export interface NavItem {
  href: string;
  labelKey: string; // Changed from label to labelKey for i18n
  icon: ElementType;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: Layout },
  { href: '/tasks', labelKey: 'nav.tasks', icon: List },
  { href: '/bookings', labelKey: 'nav.bookings', icon: BookOpen },
  { href: '/calendar', labelKey: 'nav.calendar', icon: Calendar },
  { href: '/clients', labelKey: 'nav.clients', icon: Users },
  { href: '/packages', labelKey: 'nav.packages', icon: Package },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  href: '/settings',
  labelKey: 'nav.settings', // Changed from label to labelKey
  icon: SettingsIcon,
};

export const APP_NAME_KEY = "appName"; // Key for app name translation
