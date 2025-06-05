
import type { ElementType } from 'react';
import { Layout, List, Package, Users, BookOpen, Calendar, Settings as SettingsIcon, CreditCard, FileText } from 'react-feather';
import type { CurrencyCode } from '@/types';

export interface NavItem {
  href: string;
  labelKey: string; 
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
  { href: '/payments', labelKey: 'nav.payments', icon: CreditCard },
  { href: '/invoices', labelKey: 'nav.invoices', icon: FileText },
];

export const SETTINGS_NAV_ITEM: NavItem = {
  href: '/settings',
  labelKey: 'nav.settings', 
  icon: SettingsIcon,
};

export const APP_NAME_KEY = "appName"; 
export const USER_PROFILE_LS_KEY = 'userProfile';
export const DASHBOARD_COVER_PHOTO_LS_KEY = 'dashboardCoverPhotoUrl';
export const DASHBOARD_COVER_PHOTO_BLUR_LS_KEY = 'dashboardCoverPhotoBlur';
export const AVATAR_SHAPE_LS_KEY = 'avatarShape';
export const ACCENT_THEME_LS_KEY = 'accentTheme';
export const FONT_THEME_LS_KEY = 'fontTheme';
export const GOOGLE_CALENDAR_CONNECTED_LS_KEY = 'googleCalendarConnected';
export const GOOGLE_CALENDAR_ID_LS_KEY = 'googleCalendarIdToSync';
export const GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY = 'googleCalendarAutoSync';
export const INVOICE_TEMPLATE_LS_KEY = 'invoiceTemplateHtml';
export const INVOICE_HISTORY_LS_KEY = 'invoiceHistory';
export const SELECTED_CURRENCY_LS_KEY = 'selectedCurrency'; // New key for selected currency

export interface CurrencyDefinition {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const AVAILABLE_CURRENCIES: CurrencyDefinition[] = [
  { code: 'LKR', symbol: 'Rs', label: 'Sri Lankan Rupee (LKR)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
];

