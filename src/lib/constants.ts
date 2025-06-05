
import type { ElementType } from 'react';
import { Layout, List, Package, Users, BookOpen, Calendar, Settings as SettingsIcon, CreditCard, FileText } from 'react-feather';
import type { CurrencyCode, FontTheme } from '@/types';

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
export const ACCENT_THEME_LS_KEY = 'accentThemePreference';

export const FONT_THEMES: { value: FontTheme; label: string }[] = [
  { value: 'default-sans', label: 'Default Sans' },
  { value: 'classic-serif', label: 'Classic Serif' },
  { value: 'modern-mono', label: 'Modern Mono' },
];

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

export interface AccentThemeColors {
  accent: string; // HSL string e.g. "205 75% 50%"
  accentForeground: string; // HSL string
  ring: string; // HSL string
  chart2: string; // HSL string
}

export interface AccentTheme {
  value: string;
  label: string;
  lightColors: AccentThemeColors;
  darkColors: AccentThemeColors;
  gradientPreview: string;
  // HSL values for gradient stops
  lightGradientStartHsl: string;
  lightGradientEndHsl: string;
  darkGradientStartHsl: string;
  darkGradientEndHsl: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    value: 'default-blue',
    label: 'Oceanic Blue Gradient',
    lightColors: { accent: '205 75% 50%', accentForeground: '210 60% 98%', ring: '205 75% 45%', chart2: '205 75% 50%' },
    darkColors: { accent: '205 70% 60%', accentForeground: '210 30% 15%', ring: '205 70% 55%', chart2: '205 70% 60%' },
    gradientPreview: 'linear-gradient(to right, hsl(205, 75%, 50%), hsl(195, 85%, 45%))',
    lightGradientStartHsl: '205 75% 50%',
    lightGradientEndHsl: '195 85% 45%',
    darkGradientStartHsl: '205 70% 60%',
    darkGradientEndHsl: '195 80% 55%',
  },
  {
    value: 'violet-gradient',
    label: 'Vibrant Violet Gradient',
    lightColors: { accent: '260 75% 60%', accentForeground: '260 60% 98%', ring: '260 75% 55%', chart2: '260 75% 60%' },
    darkColors: { accent: '260 70% 70%', accentForeground: '260 30% 15%', ring: '260 70% 65%', chart2: '260 70% 70%' },
    gradientPreview: 'linear-gradient(to right, hsl(260, 75%, 60%), hsl(270, 80%, 55%))',
    lightGradientStartHsl: '260 75% 60%',
    lightGradientEndHsl: '270 80% 55%',
    darkGradientStartHsl: '260 70% 70%',
    darkGradientEndHsl: '270 75% 65%',
  },
  {
    value: 'green-gradient',
    label: 'Forest Green Gradient',
    lightColors: { accent: '140 60% 40%', accentForeground: '140 60% 95%', ring: '140 60% 35%', chart2: '140 60% 40%' },
    darkColors: { accent: '140 55% 50%', accentForeground: '140 30% 10%', ring: '140 55% 45%', chart2: '140 55% 50%' },
    gradientPreview: 'linear-gradient(to right, hsl(140, 60%, 40%), hsl(150, 65%, 35%))',
    lightGradientStartHsl: '140 60% 40%',
    lightGradientEndHsl: '150 65% 35%',
    darkGradientStartHsl: '140 55% 50%',
    darkGradientEndHsl: '150 60% 45%',
  },
  {
    value: 'orange-gradient',
    label: 'Sunset Orange Gradient',
    lightColors: { accent: '30 90% 55%', accentForeground: '20 60% 98%', ring: '30 90% 50%', chart2: '30 90% 55%' },
    darkColors: { accent: '30 80% 65%', accentForeground: '20 30% 10%', ring: '30 80% 60%', chart2: '30 80% 65%' },
    gradientPreview: 'linear-gradient(to right, hsl(30, 90%, 55%), hsl(40, 95%, 50%))',
    lightGradientStartHsl: '30 90% 55%',
    lightGradientEndHsl: '40 95% 50%',
    darkGradientStartHsl: '30 80% 65%',
    darkGradientEndHsl: '40 85% 60%',
  },
];
export type AccentThemeValue = typeof ACCENT_THEMES[number]['value'];
export const DEFAULT_ACCENT_THEME_VALUE: AccentThemeValue = 'default-blue';


export const ALL_LOCAL_STORAGE_KEYS: string[] = [
  USER_PROFILE_LS_KEY,
  DASHBOARD_COVER_PHOTO_LS_KEY,
  DASHBOARD_COVER_PHOTO_BLUR_LS_KEY,
  AVATAR_SHAPE_LS_KEY,
  FONT_THEME_LS_KEY,
  ACCENT_THEME_LS_KEY,
  GOOGLE_CALENDAR_CONNECTED_LS_KEY,
  GOOGLE_CALENDAR_ID_LS_KEY,
  GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY,
  INVOICE_TEMPLATE_LS_KEY,
  INVOICE_HISTORY_LS_KEY,
  SELECTED_CURRENCY_LS_KEY,
  AUTH_STATUS_LS_KEY,
  DATE_FORMAT_LS_KEY,
  CLOCK_FORMAT_LS_KEY,
];

