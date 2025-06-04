
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Link as LinkIconFeather, Unlink, Package } from "react-feather"; 
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';


export default function SettingsPage() {
  // Mock data, replace with actual user and connection status
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@workflowzen.com",
    avatarUrl: "https://placehold.co/100x100.png",
  });
  const isCalendarConnected = true; 

  const [packageName, setPackageName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

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
      // Here you would typically initiate an upload to your backend/Firebase Storage
      // For now, we can update the avatarUrl optimistically for preview
      // In a real app, you'd get the new URL from the upload response
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prevUser => ({ ...prevUser, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      toast.success("Profile picture selected. Click 'Save Profile Changes' to apply.");
    } else {
      // If image is removed, revert to a default or clear (if applicable)
      // For this demo, we'll keep the existing one if they clear a newly selected one before saving
      // Or, if you want to allow removing an existing one and saving, handle that logic here.
      // setUser(prevUser => ({ ...prevUser, avatarUrl: "https://placehold.co/100x100.png" })); // Example revert
    }
  };
  
  const handleSaveChanges = () => {
    // In a real app, you would:
    // 1. Upload profileImageFile if it exists and is new
    // 2. Update user.name and user.email in your database
    // 3. Update user.avatarUrl with the new URL from storage
    toast.success("Profile changes saved (simulated).");
    if (profileImageFile) {
        console.log("New profile image to upload:", profileImageFile.name);
        // Reset file state after "saving"
        setProfileImageFile(null);
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
              className="h-40 w-40" // Adjust size as needed
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
          <CardTitle className="flex items-center"><SettingsIcon className="mr-2 h-5 w-5"/> Google Calendar Integration</CardTitle>
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
                <Unlink className="mr-2 h-4 w-4" /> Disconnect
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
