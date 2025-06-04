
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Link as LinkIconFeather, Slash, Package, Calendar as CalendarIcon, Eye } from "react-feather";
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { theme } = useTheme();
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@workflowzen.com",
    avatarUrl: "https://placehold.co/100x100.png",
  });
  const isCalendarConnected = true;

  const [packageName, setPackageName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleRequestPackage = () => {
    if (!packageName.trim()) {
      toast.error("Package Name Required: Please enter a package name first.");
      return;
    }
    toast.info(`To install "${packageName}", please tell the AI assistant: "Add package: ${packageName}"`, { autoClose: 9000 });
  };

  const handleProfileImageChange = (file: File | null) => {
    setProfileImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prevUser => ({ ...prevUser, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      // No toast here, only on save
    } else {
      // Revert to initial or placeholder if image is cleared before saving.
      // For this demo, if user had "user.avatarUrl" and clears the *newly selected* file,
      // the preview should revert to "user.avatarUrl" if it was previously set, or a placeholder.
      // The current ImageUploadDropzone handles this by reverting to `initialImageUrl`.
    }
  };
  
  const handleSaveChanges = () => {
    // In a real app, you would:
    // 1. Upload profileImageFile if it exists and is new
    // 2. Update user.name and user.email in your database
    // 3. Update user.avatarUrl with the new URL from storage
    let changesMade = false;
    if (profileImageFile) {
        console.log("New profile image to upload:", profileImageFile.name);
        // Simulate upload success and get a new URL
        // For demo: setUser(prevUser => ({ ...prevUser, avatarUrl: "new_uploaded_url.png" }));
        setProfileImageFile(null); // Reset file state after "saving"
        changesMade = true;
    }
    // Add logic here if user.name or user.email changed and needs saving
    // For now, we just check if a new image was "processed"
    if(changesMade) {
        toast.success("Profile changes saved (simulated).");
    } else {
        toast.info("No new changes to save in profile.");
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5"/> Profile Settings</CardTitle>
          <CardDescription>Update your personal information and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <ImageUploadDropzone
              initialImageUrl={user.avatarUrl}
              onFileChange={handleProfileImageChange}
              className="h-40 w-40"
              imageClassName="rounded-full"
              label="Change picture"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={user.name} 
                onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))} 
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={user.email} 
                onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))} 
              />
            </div>
          </div>
          <Button onClick={handleSaveChanges}>Save Profile Changes</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5" /> Appearance & Display</CardTitle>
          <CardDescription>Customize how WorkFlowZen looks and displays information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              Current theme: <span className="capitalize font-medium">{theme}</span>. 
              Use the sun/moon icon in the header to toggle between light and dark modes.
            </p>
          </div>
          <div>
            <Label>Date & Time Format Preview</Label>
            <div className="space-y-1 mt-1 text-sm">
              <p>
                <span className="font-medium text-muted-foreground w-28 inline-block">Style 1:</span> 
                <span className="text-foreground">{format(currentDateTime, "MMMM d, yyyy 'at' h:mm a")}</span>
              </p>
              <p>
                <span className="font-medium text-muted-foreground w-28 inline-block">Style 2:</span> 
                <span className="text-foreground">{format(currentDateTime, "dd/MM/yyyy, HH:mm")}</span>
              </p>
              <p>
                <span className="font-medium text-muted-foreground w-28 inline-block">Relative:</span> 
                <span className="text-foreground">{format(new Date(Date.now() - 1000 * 60 * 5), "PPPp")} (5 minutes ago example)</span>
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                Actual date/time format selection will be available in a future update.
            </p>
          </div>
          {/* Future: Add controls for selecting date/time format */}
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><SettingsIcon className="mr-2 h-5 w-5"/> Google Calendar Integration</CardTitle>
          <CardDescription>Connect your Google Calendar to sync bookings automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCalendarConnected ? (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">Calendar Connected</p>
                <p className="text-sm text-green-600 dark:text-green-400">Your bookings are syncing with Google Calendar.</p>
              </div>
              <Button variant="destructive" size="sm">
                <Slash className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            </div>
          ) : (
             <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-md">
              <div>
                <p className="font-medium">Calendar Not Connected</p>
                <p className="text-sm text-muted-foreground">Connect to sync your bookings.</p>
              </div>
              <Button>
                <LinkIconFeather className="mr-2 h-4 w-4" /> Connect Google Calendar
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
          <CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5"/> Manage Project Packages</CardTitle>
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
