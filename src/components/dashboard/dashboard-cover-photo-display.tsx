
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageIcon as ImageIconFeather } from 'react-feather'; // Placeholder icon

const DASHBOARD_COVER_PHOTO_LS_KEY = 'dashboardCoverPhotoUrl';
const DASHBOARD_COVER_PHOTO_BLUR_LS_KEY = 'dashboardCoverPhotoBlur'; // New key for blur intensity

export function DashboardCoverPhotoDisplay() {
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const [blurIntensity, setBlurIntensity] = useState<number>(8); // Default blur
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
    if (storedUrl) {
      setCoverPhotoUrl(storedUrl);
    }
    const storedBlur = localStorage.getItem(DASHBOARD_COVER_PHOTO_BLUR_LS_KEY);
    if (storedBlur) {
      setBlurIntensity(parseInt(storedBlur, 10));
    }

    const handleStyleChange = () => {
        const newUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
        setCoverPhotoUrl(newUrl);
        const newBlur = localStorage.getItem(DASHBOARD_COVER_PHOTO_BLUR_LS_KEY);
        setBlurIntensity(newBlur ? parseInt(newBlur, 10) : 8);
    }

    // Listen for direct storage changes (e.g. from other tabs, not ideal for immediate same-tab updates)
    // window.addEventListener('storage', handleStyleChange);
    // Listen for custom event dispatched from settings page for immediate update
    window.addEventListener('dashboardCoverPhotoStyleChange', handleStyleChange);

    return () => {
      // window.removeEventListener('storage', handleStyleChange);
      window.removeEventListener('dashboardCoverPhotoStyleChange', handleStyleChange);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-48 md:h-64 bg-muted rounded-lg mb-8 shadow-inner animate-pulse"></div>
    );
  }

  if (!coverPhotoUrl) {
    return null; 
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
        priority 
      />
      <div 
        className="absolute inset-0 bg-background/5 transition-opacity duration-300 md:group-hover:bg-background/[0.02]"
        style={{ backdropFilter: `blur(${blurIntensity}px)` }}
      ></div>
    </div>
  );
}

    

    