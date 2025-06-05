
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Link as LinkIconFeather, Slash, Package, Calendar as CalendarIcon, Eye, Droplet, Edit3, Square, Circle as CircleIcon, Image as ImageIconFeather, Save, Trash2 } from "react-feather";
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import type { UserProfile, AvatarShape } from '@/types'; // Import UserProfile and AvatarShape
import { 
  USER_PROFILE_LS_KEY, 
  AVATAR_SHAPE_LS_KEY, 
  ACCENT_THEME_LS_KEY, 
  FONT_THEME_LS_KEY,
  DASHBOARD_COVER_PHOTO_LS_KEY,
  DASHBOARD_COVER_PHOTO_BLUR_LS_KEY
} from '@/lib/constants';


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


const defaultUser: UserProfile = {
  id: 'default-user-settings',
  name: "Admin User",
  email: "admin@rubo.com",
  avatarUrl: "https://placehold.co/100x100.png",
  bio: "Loves photography and efficient workflows!",
};

export default function SettingsPage() {
  const { theme: nextTheme } = useTheme();
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  const [packageName, setPackageName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [avatarShape, setAvatarShape] = useState<AvatarShape>('circle');
  const [currentAccentTheme, setCurrentAccentTheme] = useState<AccentTheme>('default');
  const [currentFontTheme, setCurrentFontTheme] = useState<FontTheme>('default-sans');

  const [dashboardCoverPhotoFile, setDashboardCoverPhotoFile] = useState<File | null>(null);
  const [dashboardCoverPhotoPreview, setDashboardCoverPhotoPreview] = useState<string | null>(null);
  const [dashboardBlurIntensity, setDashboardBlurIntensity] = useState<number>(8);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000 * 60);
    
    const storedProfile = localStorage.getItem(USER_PROFILE_LS_KEY);
    if (storedProfile) {
      try {
        setUser(JSON.parse(storedProfile));
      } catch (e) {
        setUser(defaultUser); // Fallback if parsing fails
      }
    } else {
      setUser(defaultUser); // Fallback if no profile stored
    }

    const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
    if (storedShape) setAvatarShape(storedShape);

    const storedAccentTheme = localStorage.getItem(ACCENT_THEME_LS_KEY) as AccentTheme | null;
    if (storedAccentTheme) {
      setCurrentAccentTheme(storedAccentTheme);
    }

    const storedFontTheme = localStorage.getItem(FONT_THEME_LS_KEY) as FontTheme | null;
    if (storedFontTheme) {
      setCurrentFontTheme(storedFontTheme);
    }
    
    const storedCalendarConnection = localStorage.getItem('googleCalendarConnected');
    if (storedCalendarConnection) {
        setIsCalendarConnected(JSON.parse(storedCalendarConnection));
    }

    const storedCoverPhotoUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
    if (storedCoverPhotoUrl) {
        setDashboardCoverPhotoPreview(storedCoverPhotoUrl);
    }

    const storedBlurIntensity = localStorage.getItem(DASHBOARD_COVER_PHOTO_BLUR_LS_KEY);
    if (storedBlurIntensity) {
        setDashboardBlurIntensity(parseInt(storedBlurIntensity, 10));
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
    localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(user));
    toast.success("Profile changes saved.");
    window.dispatchEvent(new CustomEvent('profileUpdated'));
    if (profileImageFile) {
        console.log("New profile image was selected:", profileImageFile.name);
        setProfileImageFile(null); 
    }
  };

  const toggleCalendarConnection = () => {
    const newConnectionState = !isCalendarConnected;
    setIsCalendarConnected(newConnectionState);
    localStorage.setItem('googleCalendarConnected', JSON.stringify(newConnectionState));
    toast.success(newConnectionState ? "Google Calendar connected (simulated)." : "Google Calendar disconnected (simulated).");
  }

  const handleAvatarShapeChange = (shape: AvatarShape) => {
    setAvatarShape(shape);
    localStorage.setItem(AVATAR_SHAPE_LS_KEY, shape);
    window.dispatchEvent(new CustomEvent('avatarShapeChange', { detail: shape }));
  };

  const applyThemeClass = (themeType: 'accent' | 'font', themeValue: AccentTheme | FontTheme) => {
    const classPrefix = themeType === 'accent' ? 'theme-accent-' : 'font-theme-';
    const defaultThemeValue = themeType === 'accent' ? 'default' : 'default-sans';
    
    document.documentElement.classList.forEach(cls => {
        if (cls.startsWith(classPrefix)) {
            document.documentElement.classList.remove(cls);
        }
    });
    if (themeValue !== defaultThemeValue) {
        document.documentElement.classList.add(`${classPrefix}${themeValue}`);
    } else if (themeType === 'accent' && themeValue === 'default') {
         document.documentElement.classList.add('theme-accent-default'); // Ensure default is explicitly set
    }
  };

  const handleAccentThemeChange = (themeValue: AccentTheme) => {
    setCurrentAccentTheme(themeValue);
    localStorage.setItem(ACCENT_THEME_LS_KEY, themeValue);
    applyThemeClass('accent', themeValue);
    window.dispatchEvent(new CustomEvent('accentThemeChanged'));
  };

  const handleFontThemeChange = (themeValue: FontTheme) => {
    setCurrentFontTheme(themeValue);
    localStorage.setItem(FONT_THEME_LS_KEY, themeValue);
    applyThemeClass('font', themeValue);
    window.dispatchEvent(new CustomEvent('fontThemeChanged'));
  };

  const handleDashboardCoverPhotoSelected = (file: File | null) => {
    setDashboardCoverPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDashboardCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      const storedUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
      if (!storedUrl) {
        setDashboardCoverPhotoPreview(null);
      }
    }
  };

  const handleSaveDashboardCoverPhoto = () => {
    if (dashboardCoverPhotoPreview) {
      localStorage.setItem(DASHBOARD_COVER_PHOTO_LS_KEY, dashboardCoverPhotoPreview);
      toast.success("Dashboard cover photo saved!");
      window.dispatchEvent(new CustomEvent('dashboardCoverPhotoStyleChange'));
    } else if (dashboardCoverPhotoFile === null && !localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY)) {
       toast.info("No cover photo to save.");
    } else {
      toast.info("Select an image first or use 'Remove' to clear existing.");
    }
  };

  const handleRemoveDashboardCoverPhoto = () => {
    localStorage.removeItem(DASHBOARD_COVER_PHOTO_LS_KEY);
    setDashboardCoverPhotoFile(null);
    setDashboardCoverPhotoPreview(null);
    toast.success("Dashboard cover photo removed.");
    window.dispatchEvent(new CustomEvent('dashboardCoverPhotoStyleChange'));
  };

  const handleBlurIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    setDashboardBlurIntensity(newIntensity);
    localStorage.setItem(DASHBOARD_COVER_PHOTO_BLUR_LS_KEY, newIntensity.toString());
    window.dispatchEvent(new CustomEvent('dashboardCoverPhotoStyleChange'));
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
                value={user.email || ''} 
                onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))} 
              />
            </div>
          </div>
           <div>
              <Label htmlFor="bio">Bio / Tagline</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself or your business..."
                value={user.bio || ''}
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
          <CardDescription>Personalize the look and feel of Rubo.</CardDescription>
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
              .theme-preview-default { background-image: linear-gradient(to right, hsl(270 70% 65%), hsl(270 60% 55%)); }
              .dark .theme-preview-default { background-image: linear-gradient(to right, hsl(270 70% 70%), hsl(270 60% 60%)); }
              .theme-preview-oceanic { background-image: linear-gradient(to right, hsl(205 75% 50%), hsl(205 65% 40%)); }
              .dark .theme-preview-oceanic { background-image: linear-gradient(to right, hsl(205 70% 60%), hsl(205 60% 50%)); }
              .theme-preview-forest { background-image: linear-gradient(to right, hsl(140 60% 40%), hsl(140 50% 30%)); }
              .dark .theme-preview-forest { background-image: linear-gradient(to right, hsl(140 50% 50%), hsl(140 40% 40%)); }
              .theme-preview-sunset { background-image: linear-gradient(to right, hsl(25 90% 55%), hsl(25 80% 45%)); }
              .dark .theme-preview-sunset { background-image: linear-gradient(to right, hsl(25 80% 65%), hsl(25 70% 55%)); }
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
          <CardTitle className="flex items-center"><ImageIconFeather className="mr-2 h-5 w-5" /> Dashboard Customization</CardTitle>
          <CardDescription>Personalize your dashboard's appearance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dashboardCoverPhoto">Dashboard Cover Photo</Label>
            <ImageUploadDropzone
              initialImageUrl={dashboardCoverPhotoPreview || undefined}
              onFileChange={handleDashboardCoverPhotoSelected}
              className="h-48 w-full" 
              imageClassName="rounded-md"
              label="Drop a wide image or click to upload (e.g., 1200x300)"
            />
            <p className="text-xs text-muted-foreground">Recommended: A wide, landscape-oriented image.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveDashboardCoverPhoto} disabled={!dashboardCoverPhotoFile && !dashboardCoverPhotoPreview}>
              <Save className="mr-2 h-4 w-4" /> Save Cover Photo
            </Button>
            {dashboardCoverPhotoPreview && (
              <Button variant="outline" onClick={handleRemoveDashboardCoverPhoto}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove Cover Photo
              </Button>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
                <Label htmlFor="dashboardBlurIntensity">Glass Effect Intensity (Blur)</Label>
                <span className="text-sm text-muted-foreground">{dashboardBlurIntensity}px</span>
            </div>
            <Slider
              id="dashboardBlurIntensity"
              min={0}
              max={24} 
              step={1}
              value={[dashboardBlurIntensity]}
              onValueChange={handleBlurIntensityChange}
            />
            <p className="text-xs text-muted-foreground">Adjust the blur level for the cover photo's glassmorphism effect. 0px means no blur.</p>
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
            Authorizing Rubo will allow it to (simulated) create, update, and delete events in your connected Google Calendar.
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
    
