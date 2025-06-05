
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon as ImageIconFeather } from 'react-feather'; // Placeholder icon

const DASHBOARD_COVER_PHOTO_LS_KEY = 'dashboardCoverPhotoUrl';

export function DashboardCoverPhotoDisplay() {
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
    if (storedUrl) {
      setCoverPhotoUrl(storedUrl);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === DASHBOARD_COVER_PHOTO_LS_KEY) {
        setCoverPhotoUrl(event.newValue);
      }
    };

    const handleCoverPhotoCustomEvent = () => {
        const newUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
        setCoverPhotoUrl(newUrl);
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('coverPhotoChange', handleCoverPhotoCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('coverPhotoChange', handleCoverPhotoCustomEvent);
    };
  }, []);

  if (!mounted) {
    // To prevent hydration mismatch, render a placeholder or nothing until client-side check
    return (
      <div className="w-full h-48 md:h-64 bg-muted rounded-lg mb-8 shadow-inner animate-pulse"></div>
    );
  }

  if (!coverPhotoUrl) {
    return null; // Don't render anything if no photo is set
  }

  return (
    <div className={cn(
        "relative w-full h-48 md:h-64 rounded-lg overflow-hidden mb-8 shadow-lg group"
      )}
      data-ai-hint="dashboard cover background"
    >
      <Image
        src={coverPhotoUrl}
        alt="Dashboard Cover Photo"
        layout="fill"
        objectFit="cover"
        priority // Consider adding priority if it's LCP
      />
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-sm transition-opacity duration-300 md:group-hover:bg-background/5 md:group-hover:backdrop-blur-md"></div>
      {/* Optional: Gradient for text legibility if text were overlaid at bottom */}
      {/* <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/50 to-transparent"></div> */}
    </div>
  );
}

    