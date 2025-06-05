
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { LogIn, Lock, User } from 'react-feather';
import { AUTH_STATUS_LS_KEY, APP_NAME_KEY } from '@/lib/constants';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const appName = t(APP_NAME_KEY);

  useEffect(() => {
    setMounted(true);
    // Check if user is already authenticated
    if (localStorage.getItem(AUTH_STATUS_LS_KEY) === 'true') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // For this basic setup, we'll just check if email and password are not empty
      // In a real app, you'd validate credentials against a backend.
      if (email.trim() && password.trim()) {
        localStorage.setItem(AUTH_STATUS_LS_KEY, 'true');
        toast.success(`Welcome back to ${appName}!`);
        router.replace('/dashboard');
      } else {
        toast.error('Please enter both email and password.');
        setIsLoading(false);
      }
    }, 1000);
  };
  
  if (!mounted) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background content-area-gradient">
        {/* Optional: Add a loading spinner here */}
        <p className="text-lg text-primary">Loading Login...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 content-area-gradient">
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <Image
                src="/images/rubo-logo.png"
                alt={`${appName} Logo`}
                width={200}
                height={34}
                priority
            />
        </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Login</CardTitle>
          <CardDescription className="text-md">
            Sign in to access your {appName} dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block">
            <p className="text-xs text-muted-foreground">
                For demonstration purposes, any non-empty email/password will work.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
