
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <h1 className="text-2xl font-headline text-primary">Loading Rubo...</h1>
    </div>
  );
}
