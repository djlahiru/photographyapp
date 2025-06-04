
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserCircle, CalendarCog, LinkIcon, UnlinkIcon, PackagePlus } from "lucide-react";
import { toast } from 'react-toastify';


export default function SettingsPage() {
  // Mock data, replace with actual user and connection status
  const user = {
    name: "Admin User",
    email: "admin@workflowzen.com",
    avatarUrl: "https://placehold.co/100x100.png",
  };
  const isCalendarConnected = true; // Math.random() > 0.5;

  const [packageName, setPackageName] = useState('');

  const handleRequestPackage = () => {
    if (!packageName.trim()) {
      toast.error("Package Name Required: Please enter a package name first.");
      return;
    }
    toast.info(`To install "${packageName}", please tell the AI assistant: "Add package: ${packageName}"`, { autoClose: 9000 });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserCircle className="mr-2 h-5 w-5"/> Profile Settings</CardTitle>
          <CardDescription>Update your personal information and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Picture</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
          </div>
          <Button>Save Profile Changes</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarCog className="mr-2 h-5 w-5"/> Google Calendar Integration</CardTitle>
          <CardDescription>Connect your Google Calendar to sync bookings automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCalendarConnected ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
              <div>
                <p className="font-medium text-green-700">Calendar Connected</p>
                <p className="text-sm text-green-600">Your bookings are syncing with Google Calendar.</p>
              </div>
              <Button variant="destructive" size="sm">
                <UnlinkIcon className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            </div>
          ) : (
             <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-md">
              <div>
                <p className="font-medium">Calendar Not Connected</p>
                <p className="text-sm text-muted-foreground">Connect to sync your bookings.</p>
              </div>
              <Button>
                <LinkIcon className="mr-2 h-4 w-4" /> Connect Google Calendar
              </Button>
            </div>
          )}
           <p className="text-xs text-muted-foreground">
            Authorizing WorkFlowZen will allow it to create, update, and delete events in your connected Google Calendar.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><PackagePlus className="mr-2 h-5 w-5"/> Manage Project Packages</CardTitle>
          <CardDescription>Use this section to request new package installations via the AI assistant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="packageName">Package Name</Label>
            <Input 
              id="packageName" 
              placeholder="e.g., framer-motion or lodash@4.17.21" 
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
            />
          </div>
          <Button onClick={handleRequestPackage}>
            Get Installation Instructions
          </Button>
           <p className="text-xs text-muted-foreground">
            This will not install the package directly. It will provide you with instructions on how to ask the AI assistant to add the package to your project.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
