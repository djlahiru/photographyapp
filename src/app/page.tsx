
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_STATUS_LS_KEY } from '@/lib/constants';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isAuthenticated = localStorage.getItem(AUTH_STATUS_LS_KEY) === 'true';
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [router, mounted]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background content-area-gradient">
      <h1 className="text-2xl font-headline text-primary">Loading Rubo...</h1>
      <p className="text-muted-foreground mt-2">Initializing your experience.</p>
    </div>
  );
}
