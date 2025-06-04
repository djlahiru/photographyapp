
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Link as LinkIconFeather, Slash, Package, Calendar as CalendarIcon, Eye, Droplet, Edit3, Square, Circle as CircleIcon } from "react-feather";
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type AvatarShape = 'circle' | 'square';
type AccentTheme = 'default' | 'oceanic' | 'forest' | 'sunset';
type FontTheme = 'default-sans' | 'classic-serif' | 'modern-mono';

const ACCENT_THEMES: { value: AccentTheme; label: string }[] = [
  { value: 'default', label: 'Default Violet' },
  { value: 'oceanic', label: 'Oceanic Blue' },
  { value: 'forest', label: 'Forest Green' },
  { value: 'sunset', label: 'Sunset Orange' },
];

const FONT_THEMES: { value: FontTheme; label: string }[] = [
  { value: 'default-sans', label: 'Default Sans' },
  { value: 'classic-serif', label: 'Classic Serif' },
  { value: 'modern-mono', label: 'Modern Mono' },
];

export default function SettingsPage() {
  const { theme: nextTheme } = useTheme();
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@workflowzen.com",
    avatarUrl: "https://placehold.co/100x100.png",
    bio: "Loves photography and efficient workflows!",
  });
  const [isCalendarConnected, setIsCalendarConnected] = useState(true);

  const [packageName, setPackageName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [avatarShape, setAvatarShape] = useState<AvatarShape>('circle');
  const [currentAccentTheme, setCurrentAccentTheme] = useState<AccentTheme>('default');
  const [currentFontTheme, setCurrentFontTheme] = useState<FontTheme>('default-sans');

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000 * 60);
    
    const storedShape = localStorage.getItem('avatarShape') as AvatarShape | null;
    if (storedShape) setAvatarShape(storedShape);

    const storedAccentTheme = localStorage.getItem('accentTheme') as AccentTheme | null;
    if (storedAccentTheme) {
      setCurrentAccentTheme(storedAccentTheme);
      // Accent theme application is handled in RootLayout
    }

    const storedFontTheme = localStorage.getItem('fontTheme') as FontTheme | null;
    if (storedFontTheme) {
      setCurrentFontTheme(storedFontTheme);
      // Font theme application is handled in RootLayout initially, then here for dynamic changes
      handleFontThemeChange(storedFontTheme, false); // Apply without saving again
    }
    
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
    }
  };
  
  const handleSaveChanges = () => {
    toast.success("Profile changes saved (simulated).");
    if (profileImageFile) {
        console.log("New profile image to 'upload':", profileImageFile.name);
        setProfileImageFile(null); 
    }
  };

  const toggleCalendarConnection = () => {
    setIsCalendarConnected(!isCalendarConnected);
    toast.success(isCalendarConnected ? "Google Calendar disconnected (simulated)." : "Google Calendar connected (simulated).");
  }

  const handleAvatarShapeChange = (shape: AvatarShape) => {
    setAvatarShape(shape);
    localStorage.setItem('avatarShape', shape);
  };

  const handleAccentThemeChange = (themeValue: AccentTheme) => {
    setCurrentAccentTheme(themeValue);
    localStorage.setItem('accentTheme', themeValue);
    
    ACCENT_THEMES.forEach(t => {
        if (t.value !== 'default') {
            document.documentElement.classList.remove(`theme-accent-${t.value}`);
        }
    });
    if (themeValue !== 'default') {
        document.documentElement.classList.add(`theme-accent-${themeValue}`);
    }
  };

  const handleFontThemeChange = (themeValue: FontTheme, save: boolean = true) => {
    setCurrentFontTheme(themeValue);
    if (save) {
      localStorage.setItem('fontTheme', themeValue);
    }
    
    FONT_THEMES.forEach(t => {
      if (t.value !== 'default-sans') {
        document.documentElement.classList.remove(`font-theme-${t.value}`);
      }
    });
    if (themeValue !== 'default-sans') {
      document.documentElement.classList.add(`font-theme-${themeValue}`);
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
          <CardDescription>Update your personal information, bio, and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <ImageUploadDropzone
              initialImageUrl={user.avatarUrl}
              onFileChange={handleProfileImageChange}
              className="h-40 w-40"
              imageClassName={avatarShape === 'circle' ? 'rounded-full' : 'rounded-md'}
              label="Change picture"
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar Shape</Label>
            <RadioGroup value={avatarShape} onValueChange={(value) => handleAvatarShapeChange(value as AvatarShape)} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="circle" id="shape-circle" />
                <Label htmlFor="shape-circle" className="flex items-center"><CircleIcon className="mr-1 h-4 w-4"/> Circle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="square" id="shape-square" />
                <Label htmlFor="shape-square" className="flex items-center"><Square className="mr-1 h-4 w-4"/> Square</Label>
              </div>
            </RadioGroup>
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
           <div>
              <Label htmlFor="bio">Bio / Tagline</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself or your business..."
                value={user.bio}
                onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
          <Button onClick={handleSaveChanges}>Save Profile Changes</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Droplet className="mr-2 h-5 w-5" /> Theme & Appearance</CardTitle>
          <CardDescription>Personalize the look and feel of WorkFlowZen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Light/Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Current mode: <span className="capitalize font-medium">{nextTheme}</span>. 
              Use the sun/moon icon in the header to toggle.
            </p>
          </div>
          <div>
            <Label className="flex items-center"><Droplet className="mr-1.5 h-4 w-4" />Accent Color</Label>
            <RadioGroup value={currentAccentTheme} onValueChange={(value) => handleAccentThemeChange(value as AccentTheme)} className="grid grid-cols-2 gap-4 mt-2 sm:grid-cols-2">
              {ACCENT_THEMES.map(item => (
                <Label
                  key={item.value}
                  htmlFor={`accent-${item.value}`}
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent"
                >
                  <RadioGroupItem value={item.value} id={`accent-${item.value}`} />
                  <span>{item.label}</span>
                  <span className={`ml-auto h-4 w-4 rounded-full border theme-preview-${item.value}`}></span>
                </Label>
              ))}
            </RadioGroup>
            <style jsx>{`
              .theme-preview-default { background-color: hsl(270 70% 65%); }
              .dark .theme-preview-default { background-color: hsl(270 70% 70%); }
              .theme-preview-oceanic { background-color: hsl(205 75% 50%); }
              .dark .theme-preview-oceanic { background-color: hsl(205 70% 60%); }
              .theme-preview-forest { background-color: hsl(140 60% 40%); }
              .dark .theme-preview-forest { background-color: hsl(140 50% 50%); }
              .theme-preview-sunset { background-color: hsl(25 90% 55%); }
              .dark .theme-preview-sunset { background-color: hsl(25 80% 65%); }
            `}</style>
          </div>
           <div>
            <Label className="flex items-center"><Edit3 className="mr-1.5 h-4 w-4" /> Font Style</Label>
            <RadioGroup value={currentFontTheme} onValueChange={(value) => handleFontThemeChange(value as FontTheme)} className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
              {FONT_THEMES.map(item => (
                <Label
                  key={item.value}
                  htmlFor={`font-${item.value}`}
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent"
                >
                  <RadioGroupItem value={item.value} id={`font-${item.value}`} />
                  <span style={{ fontFamily: item.value === 'classic-serif' ? 'Georgia, serif' : item.value === 'modern-mono' ? "'Courier New', monospace" : undefined }}>
                    {item.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5" /> Display Previews</CardTitle>
          <CardDescription>See how certain information will be displayed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Date &amp; Time Format Preview</Label>
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
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><LinkIconFeather className="mr-2 h-5 w-5"/> Google Calendar Integration</CardTitle>
          <CardDescription>Connect your Google Calendar to sync bookings automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCalendarConnected ? (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">Calendar Connected</p>
                <p className="text-sm text-green-600 dark:text-green-400">Your bookings are syncing with Google Calendar.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={toggleCalendarConnection}>
                <Slash className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            </div>
          ) : (
             <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-md">
              <div>
                <p className="font-medium">Calendar Not Connected</p>
                <p className="text-sm text-muted-foreground">Connect to sync your bookings.</p>
              </div>
              <Button onClick={toggleCalendarConnection}>
                <LinkIconFeather className="mr-2 h-4 w-4" /> Connect Google Calendar
              </Button>
            </div>
          )}
           <p className="text-xs text-muted-foreground">
            Authorizing WorkFlowZen will allow it to (simulated) create, update, and delete events in your connected Google Calendar.
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
            This will not install the package directly. It will generate instructions on how to ask the AI assistant to add the desired package to your project's dependencies.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}

    