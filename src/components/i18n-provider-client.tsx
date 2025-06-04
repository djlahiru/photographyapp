
'use client';

import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n'; // Your i18n configuration

interface I18nProviderClientProps {
  children: ReactNode;
}

// This component ensures that i18next is initialized on the client-side
// and provides the i18n context to its children.
export function I18nProviderClient({ children }: I18nProviderClientProps) {
  // The i18n instance is already initialized in @/lib/i18n.ts
  // We just need to provide it.
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
