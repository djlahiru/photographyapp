
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'react-toastify';
import { LogIn } from 'react-feather';
import { AUTH_STATUS_LS_KEY, USER_PROFILE_LS_KEY, APP_NAME_KEY } from '@/lib/constants';
import type { UserProfile } from '@/types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const defaultLoginUser: UserProfile = {
  id: 'login-placeholder-user',
  name: 'Welcome Back!',
  avatarUrl: 'https://placehold.co/100x100.png', // Generic placeholder
};

const getInitials = (name: string = "User") => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || "U";
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultLoginUser);
  const { t } = useTranslation();
  const appName = t(APP_NAME_KEY);

  useEffect(() => {
    setMounted(true);
    // Check if user is already authenticated
    if (localStorage.getItem(AUTH_STATUS_LS_KEY) === 'true') {
      router.replace('/dashboard');
      return;
    }

    // Load last user profile
    const storedProfile = localStorage.getItem(USER_PROFILE_LS_KEY);
    if (storedProfile) {
      try {
        const parsedProfile: UserProfile = JSON.parse(storedProfile);
        setCurrentUser(parsedProfile);
      } catch (e) {
        console.error("Failed to parse user profile for login page", e);
        setCurrentUser(defaultLoginUser);
      }
    } else {
      setCurrentUser(defaultLoginUser);
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call / successful login
    setTimeout(() => {
      localStorage.setItem(AUTH_STATUS_LS_KEY, 'true');
      toast.success(`Welcome back to ${appName}, ${currentUser.name === defaultLoginUser.name ? 'User' : currentUser.name}!`);
      router.replace('/dashboard');
    }, 1000);
  };
  
  if (!mounted) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background content-area-gradient">
        <p className="text-lg text-primary">Loading Login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 content-area-gradient">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <Image
                src="/images/new-company-logo.png"
                alt={`${appName} Logo`}
                width={200}
                height={34}
                priority
            />
        </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center items-center">
           <Avatar className={cn(
            "h-24 w-24 mb-4",
            // Assuming default shape or add shape loading logic if needed from settings
           )}>
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="user avatar" />
            <AvatarFallback className="text-3xl">
                {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold font-headline">
            {currentUser.name !== defaultLoginUser.name ? currentUser.name : "Welcome Back!"}
          </CardTitle>
          <CardDescription className="text-md">
            Click below to log in to your {appName} account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? 'Logging In...' : 'Log In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
