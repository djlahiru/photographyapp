'use client';

import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getGreeting } from '@/lib/date-utils';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock user name, replace with actual user data
const MOCK_USER_NAME = "Admin";

export function AppHeader() {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState<string | undefined>(undefined);

  useEffect(() => {
    setUserName(MOCK_USER_NAME); // In a real app, this would come from auth state
  }, []);
  
  useEffect(() => {
    setGreeting(getGreeting(userName));
  }, [userName]);


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground font-headline">{greeting}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background" />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        {/* Additional header items can go here, e.g., user menu for mobile if not in sidebar */}
      </div>
    </header>
  );
}
