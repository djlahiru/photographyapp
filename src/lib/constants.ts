
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
export const FONT_THEME_LS_KEY = 'fontTheme';
export const GOOGLE_CALENDAR_CONNECTED_LS_KEY = 'googleCalendarConnected';
export const GOOGLE_CALENDAR_ID_LS_KEY = 'googleCalendarIdToSync';
export const GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY = 'googleCalendarAutoSync';
export const INVOICE_TEMPLATE_LS_KEY = 'invoiceTemplateHtml';
export const INVOICE_HISTORY_LS_KEY = 'invoiceHistory';
export const SELECTED_CURRENCY_LS_KEY = 'selectedCurrency';
export const AUTH_STATUS_LS_KEY = 'ruboAuthStatus';
export const DATE_FORMAT_LS_KEY = 'dateFormatPreference';
export const CLOCK_FORMAT_LS_KEY = 'clockFormatPreference';

export const DATE_FORMATS = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'MMMM d, yyyy', label: 'Month D, YYYY (Default)' },
] as const;
export type DateFormatValue = typeof DATE_FORMATS[number]['value'];
export const DEFAULT_DATE_FORMAT: DateFormatValue = 'MMMM d, yyyy';

export const CLOCK_FORMATS = [
    { value: '12h', label: '12-hour (AM/PM)', exampleFormat: 'h:mm a' },
    { value: '24h', label: '24-hour', exampleFormat: 'HH:mm' },
] as const;
export type ClockFormatValue = typeof CLOCK_FORMATS[number]['value'];
export const DEFAULT_CLOCK_FORMAT_VALUE: ClockFormatValue = '12h';


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

export const ALL_LOCAL_STORAGE_KEYS: string[] = [
  USER_PROFILE_LS_KEY,
  DASHBOARD_COVER_PHOTO_LS_KEY,
  DASHBOARD_COVER_PHOTO_BLUR_LS_KEY,
  AVATAR_SHAPE_LS_KEY,
  FONT_THEME_LS_KEY,
  GOOGLE_CALENDAR_CONNECTED_LS_KEY,
  GOOGLE_CALENDAR_ID_LS_KEY,
  GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY,
  INVOICE_TEMPLATE_LS_KEY,
  INVOICE_HISTORY_LS_KEY,
  SELECTED_CURRENCY_LS_KEY,
  AUTH_STATUS_LS_KEY,
  DATE_FORMAT_LS_KEY,
  CLOCK_FORMAT_LS_KEY,
  // Add any new localStorage keys here for them to be included in the reset
];
