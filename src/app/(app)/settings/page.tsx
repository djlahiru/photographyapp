
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Settings as SettingsIcon, Link as LinkIconFeather, Slash, Package, Calendar as CalendarIconSettings, Eye, Droplet, Edit3, Square, Circle as CircleIcon, Image as ImageIconFeather, Save, Trash2, AlertTriangle, Tag, Plus, DollarSign as DollarSignIcon, Sun as SunIcon, Moon as MoonIcon, RefreshCw } from "react-feather";
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import type { UserProfile, AvatarShape, BookingCategory, Booking, CurrencyCode } from '@/types';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as DialogDesc, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { mockBookingCategoriesData, mockBookingsData, resetAllMockData } from '@/lib/mock-data';
import { getSelectedDateFormat, getSelectedClockFormatValue, getActualClockFormatString } from '@/lib/date-utils';
import {
  USER_PROFILE_LS_KEY,
  AVATAR_SHAPE_LS_KEY,
  FONT_THEME_LS_KEY,
  DASHBOARD_COVER_PHOTO_LS_KEY,
  DASHBOARD_COVER_PHOTO_BLUR_LS_KEY,
  GOOGLE_CALENDAR_CONNECTED_LS_KEY,
  GOOGLE_CALENDAR_ID_LS_KEY,
  GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY,
  INVOICE_TEMPLATE_LS_KEY,
  INVOICE_HISTORY_LS_KEY,
  SELECTED_CURRENCY_LS_KEY,
  AVAILABLE_CURRENCIES,
  type CurrencyDefinition,
  ALL_LOCAL_STORAGE_KEYS,
  DATE_FORMAT_LS_KEY,
  DATE_FORMATS,
  DEFAULT_DATE_FORMAT,
  type DateFormatValue,
  CLOCK_FORMAT_LS_KEY,
  CLOCK_FORMATS,
  DEFAULT_CLOCK_FORMAT_VALUE,
  type ClockFormatValue,
  ACCENT_THEME_LS_KEY,
  ACCENT_THEMES,
  DEFAULT_ACCENT_THEME_VALUE,
  type AccentThemeValue,
} from '@/lib/constants';


type FontTheme = 'default-sans' | 'classic-serif' | 'modern-mono';

const FONT_THEMES: { value: FontTheme; label: string }[] = [
  { value: 'default-sans', label: 'Default Sans' },
  { value: 'classic-serif', label: 'Classic Serif' },
  { value: 'modern-mono', label: 'Modern Mono' },
];

const PREDEFINED_GRADIENTS: { label: string; value: string; textColor: string }[] = [
  { label: "Rose Petal", value: "bg-gradient-to-br from-pink-400 via-pink-500 to-red-500", textColor: "text-white" },
  { label: "Ocean Breeze", value: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500", textColor: "text-white" },
  { label: "Forest Path", value: "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600", textColor: "text-white" },
  { label: "Sunset Glow", value: "bg-gradient-to-br from-amber-400 via-orange-500 to-red-600", textColor: "text-white" },
  { label: "Royal Purple", value: "bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600", textColor: "text-white" },
  { label: "Graphite Stone", value: "bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700", textColor: "text-white" },
  { label: "Golden Sand", value: "bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400", textColor: "text-black" },
  { label: "Minty Fresh", value: "bg-gradient-to-br from-green-200 via-teal-300 to-cyan-300", textColor: "text-black" },
];


const defaultUser: UserProfile = {
  id: 'default-user-settings',
  name: "Admin User",
  email: "admin@rubo.com",
  avatarUrl: "https://placehold.co/100x100.png",
  bio: "Loves photography and efficient workflows!",
  selectedCurrency: 'USD',
};

export default function SettingsPage() {
  const { theme: nextTheme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>(defaultUser);

  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarIdToSync, setCalendarIdToSync] = useState('');
  const [enableAutoSync, setEnableAutoSync] = useState(false);

  const [packageName, setPackageName] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const [avatarShape, setAvatarShape] = useState<AvatarShape>('circle');
  const [currentFontTheme, setCurrentFontTheme] = useState<FontTheme>('default-sans');
  const [currentAccentTheme, setCurrentAccentTheme] = useState<AccentThemeValue>(DEFAULT_ACCENT_THEME_VALUE);

  const [dashboardCoverPhotoFile, setDashboardCoverPhotoFile] = useState<File | null>(null);
  const [dashboardCoverPhotoPreview, setDashboardCoverPhotoPreview] = useState<string | null>(null);
  const [dashboardBlurIntensity, setDashboardBlurIntensity] = useState<number>(8);

  const [bookingCategories, setBookingCategories] = useState<BookingCategory[]>(mockBookingCategoriesData);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BookingCategory | null>(null);
  const [categoryDialogName, setCategoryDialogName] = useState('');
  const [categoryDialogGradient, setCategoryDialogGradient] = useState(PREDEFINED_GRADIENTS[0].value);
  const [categoryDialogTextColor, setCategoryDialogTextColor] = useState(PREDEFINED_GRADIENTS[0].textColor);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [mounted, setMounted] = useState(false);
  const [currentSelectedDateFormat, setCurrentSelectedDateFormat] = useState<DateFormatValue>(DEFAULT_DATE_FORMAT);
  const [currentSelectedClockFormat, setCurrentSelectedClockFormat] = useState<ClockFormatValue>(DEFAULT_CLOCK_FORMAT_VALUE);


  const applyThemeClass = (themeType: 'font' | 'accent', themeValue: FontTheme | AccentThemeValue) => {
    const classPrefix = themeType === 'font' ? 'font-theme-' : 'theme-accent-';
    const themesToIterate = themeType === 'font' ? FONT_THEMES.map(f => f.value) : ACCENT_THEMES.map(a => a.value);

    document.documentElement.classList.forEach(cls => {
        if (cls.startsWith(classPrefix)) {
            document.documentElement.classList.remove(cls);
        }
    });
    
    // For fonts, default-sans means no specific class. For accents, default-blue is the class.
    if (themeType === 'font' && themeValue !== 'default-sans') {
      document.documentElement.classList.add(`${classPrefix}${themeValue}`);
    } else if (themeType === 'accent') {
      document.documentElement.classList.add(`${classPrefix}${themeValue}`);
    }
  };


  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000 * 60); // Updates every minute
    setCurrentSelectedDateFormat(getSelectedDateFormat());
    setCurrentSelectedClockFormat(getSelectedClockFormatValue());

    const storedProfileString = localStorage.getItem(USER_PROFILE_LS_KEY);
    let profileFromStorage: UserProfile | null = null;
    if (storedProfileString) {
      try {
        profileFromStorage = JSON.parse(storedProfileString);
      } catch (e) {
        console.error("Failed to parse user profile from localStorage for settings page", e);
      }
    }
    const effectiveUser = profileFromStorage ? { ...defaultUser, ...profileFromStorage } : defaultUser;
    setUser(effectiveUser);

    let currencyForRadioGroupInit: CurrencyCode = 'USD';
    if (effectiveUser.selectedCurrency && AVAILABLE_CURRENCIES.some(c => c.code === effectiveUser.selectedCurrency)) {
      currencyForRadioGroupInit = effectiveUser.selectedCurrency;
    } else {
      const storedCurrencyKey = localStorage.getItem(SELECTED_CURRENCY_LS_KEY) as CurrencyCode | null;
      if (storedCurrencyKey && AVAILABLE_CURRENCIES.some(c => c.code === storedCurrencyKey)) {
        currencyForRadioGroupInit = storedCurrencyKey;
      }
    }
    setSelectedCurrency(currencyForRadioGroupInit);
    if (effectiveUser.selectedCurrency !== currencyForRadioGroupInit) {
      setUser(prev => ({...prev, selectedCurrency: currencyForRadioGroupInit}));
    }

    const storedShape = localStorage.getItem(AVATAR_SHAPE_LS_KEY) as AvatarShape | null;
    if (storedShape) setAvatarShape(storedShape);

    const storedFontTheme = localStorage.getItem(FONT_THEME_LS_KEY) as FontTheme | null;
    if (storedFontTheme) {
        setCurrentFontTheme(storedFontTheme);
        applyThemeClass('font', storedFontTheme);
    }

    const storedAccentTheme = localStorage.getItem(ACCENT_THEME_LS_KEY) as AccentThemeValue | null;
    if (storedAccentTheme) {
        setCurrentAccentTheme(storedAccentTheme);
        applyThemeClass('accent', storedAccentTheme);
    } else {
        applyThemeClass('accent', DEFAULT_ACCENT_THEME_VALUE); // Apply default if nothing stored
    }


    const storedCalendarConnection = localStorage.getItem(GOOGLE_CALENDAR_CONNECTED_LS_KEY);
    if (storedCalendarConnection) setIsCalendarConnected(JSON.parse(storedCalendarConnection));
    const storedCalendarId = localStorage.getItem(GOOGLE_CALENDAR_ID_LS_KEY);
    if (storedCalendarId) setCalendarIdToSync(storedCalendarId);
    const storedAutoSync = localStorage.getItem(GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY);
    if (storedAutoSync) setEnableAutoSync(JSON.parse(storedAutoSync));

    const storedCoverPhotoUrl = localStorage.getItem(DASHBOARD_COVER_PHOTO_LS_KEY);
    if (storedCoverPhotoUrl) setDashboardCoverPhotoPreview(storedCoverPhotoUrl);
    const storedBlurIntensity = localStorage.getItem(DASHBOARD_COVER_PHOTO_BLUR_LS_KEY);
    if (storedBlurIntensity) setDashboardBlurIntensity(parseInt(storedBlurIntensity, 10));

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
        setProfileImageFile(null);
    }
  };

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setSelectedCurrency(newCurrency);
    const updatedUser = { ...user, selectedCurrency: newCurrency };
    setUser(updatedUser);
    localStorage.setItem(SELECTED_CURRENCY_LS_KEY, newCurrency);
    localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(updatedUser));
    toast.success(`Currency changed to ${AVAILABLE_CURRENCIES.find(c=>c.code === newCurrency)?.label || newCurrency}.`);
    window.dispatchEvent(new CustomEvent('profileUpdated'));
    window.dispatchEvent(new CustomEvent('currencyChanged'));
  };

  const handleDateFormatSelect = (formatValue: DateFormatValue) => {
    setCurrentSelectedDateFormat(formatValue);
    localStorage.setItem(DATE_FORMAT_LS_KEY, formatValue);
    window.dispatchEvent(new CustomEvent('dateFormatChanged'));
    const selectedFormatLabel = DATE_FORMATS.find(f => f.value === formatValue)?.label || formatValue;
    toast.info(`Date format set to: ${selectedFormatLabel}.`);
  };

  const handleClockFormatSelect = (formatValue: ClockFormatValue) => {
    setCurrentSelectedClockFormat(formatValue);
    localStorage.setItem(CLOCK_FORMAT_LS_KEY, formatValue);
    window.dispatchEvent(new CustomEvent('clockFormatChanged'));
    const selectedFormatLabel = CLOCK_FORMATS.find(f => f.value === formatValue)?.label || formatValue;
    toast.info(`Clock format set to: ${selectedFormatLabel}.`);
  };

  const toggleCalendarConnection = () => {
    const newConnectionState = !isCalendarConnected;
    setIsCalendarConnected(newConnectionState);
    localStorage.setItem(GOOGLE_CALENDAR_CONNECTED_LS_KEY, JSON.stringify(newConnectionState));
    toast.success(newConnectionState ? "Google Calendar connected (simulated)." : "Google Calendar disconnected (simulated).");
  }

  const handleSaveCalendarPreferences = () => {
    if (!calendarIdToSync.trim() && enableAutoSync) {
        toast.warn("Please provide a Calendar ID if enabling automatic sync.", { autoClose: 4000 });
    }
    localStorage.setItem(GOOGLE_CALENDAR_ID_LS_KEY, calendarIdToSync.trim());
    localStorage.setItem(GOOGLE_CALENDAR_AUTO_SYNC_LS_KEY, JSON.stringify(enableAutoSync));
    toast.success("Calendar sync preferences saved.");
  };

  const handleAvatarShapeChange = (shape: AvatarShape) => {
    setAvatarShape(shape);
    localStorage.setItem(AVATAR_SHAPE_LS_KEY, shape);
    window.dispatchEvent(new CustomEvent('avatarShapeChange', { detail: shape }));
  };

  const handleFontThemeChange = (themeValue: FontTheme) => {
    setCurrentFontTheme(themeValue);
    localStorage.setItem(FONT_THEME_LS_KEY, themeValue);
    applyThemeClass('font', themeValue);
    window.dispatchEvent(new CustomEvent('fontThemeChanged'));
  };
  
  const handleAccentThemeChange = (themeValue: AccentThemeValue) => {
    setCurrentAccentTheme(themeValue);
    localStorage.setItem(ACCENT_THEME_LS_KEY, themeValue);
    applyThemeClass('accent', themeValue);
    window.dispatchEvent(new CustomEvent('accentThemeChanged'));
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

  const handleOpenCategoryDialog = (category?: BookingCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryDialogName(category.name);
      const selectedGradient = PREDEFINED_GRADIENTS.find(g => g.value === category.gradientClasses && g.textColor === category.textColorClass) || PREDEFINED_GRADIENTS[0];
      setCategoryDialogGradient(selectedGradient.value);
      setCategoryDialogTextColor(selectedGradient.textColor);
    } else {
      setEditingCategory(null);
      setCategoryDialogName('');
      setCategoryDialogGradient(PREDEFINED_GRADIENTS[0].value);
      setCategoryDialogTextColor(PREDEFINED_GRADIENTS[0].textColor);
    }
    setIsCategoryDialogOpen(true);
  };

  const handleGradientChange = (value: string) => {
    const selected = PREDEFINED_GRADIENTS.find(g => g.value === value);
    if (selected) {
      setCategoryDialogGradient(selected.value);
      setCategoryDialogTextColor(selected.textColor);
    }
  };

  const handleSaveCategory = () => {
    if (!categoryDialogName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    if (editingCategory) {
      const updatedCategories = bookingCategories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, name: categoryDialogName, gradientClasses: categoryDialogGradient, textColorClass: categoryDialogTextColor } : cat
      );
      setBookingCategories(updatedCategories);
      const idx = mockBookingCategoriesData.findIndex(c => c.id === editingCategory.id);
      if (idx !== -1) mockBookingCategoriesData[idx] = { ...mockBookingCategoriesData[idx], name: categoryDialogName, gradientClasses: categoryDialogGradient, textColorClass: categoryDialogTextColor };
      toast.success(`Category "${categoryDialogName}" updated.`);
    } else {
      const newCategory: BookingCategory = {
        id: `cat-${Date.now()}`,
        name: categoryDialogName.trim(),
        gradientClasses: categoryDialogGradient,
        textColorClass: categoryDialogTextColor,
      };
      setBookingCategories(prev => [newCategory, ...prev]);
      mockBookingCategoriesData.unshift(newCategory);
      toast.success(`Category "${newCategory.name}" added.`);
    }
    setIsCategoryDialogOpen(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const isCategoryInUse = mockBookingsData.some(booking => booking.categoryId === categoryId);
    if (isCategoryInUse) {
      toast.error("Cannot delete category: It is currently used by one or more bookings.");
      return;
    }
    setBookingCategories(prev => prev.filter(cat => cat.id !== categoryId));
    const idx = mockBookingCategoriesData.findIndex(c => c.id === categoryId);
    if (idx !== -1) mockBookingCategoriesData.splice(idx, 1);
    toast.info("Category deleted.");
  };

  const handleResetApplicationData = () => {
    resetAllMockData();

    ALL_LOCAL_STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });

    document.documentElement.classList.forEach(cls => {
      if (cls.startsWith('font-theme-') || cls.startsWith('theme-accent-')) {
        document.documentElement.classList.remove(cls);
      }
    });
    // Re-apply default accent theme after clearing
    document.documentElement.classList.add(`theme-accent-${DEFAULT_ACCENT_THEME_VALUE}`);


    toast.success("Application data has been reset. Logging out...");

    setTimeout(() => {
        window.location.href = '/login';
    }, 1500);
  };


  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and application settings for Rubo.</p>
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
          <Button onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" />Save Profile Changes</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><DollarSignIcon className="mr-2 h-5 w-5" /> Currency Settings</CardTitle>
          <CardDescription>Choose the default currency for the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Currency</Label>
            <RadioGroup value={selectedCurrency} onValueChange={(value) => handleCurrencyChange(value as CurrencyCode)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {AVAILABLE_CURRENCIES.map((currency: CurrencyDefinition) => (
                <Label
                  key={currency.code}
                  htmlFor={`currency-${currency.code}`}
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent"
                >
                  <RadioGroupItem value={currency.code} id={`currency-${currency.code}`} />
                  <span>{currency.label} ({currency.symbol})</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Droplet className="mr-2 h-5 w-5" /> Theme &amp; Appearance</CardTitle>
          <CardDescription>Personalize the look and feel of Rubo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
                <Label>Light/Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                Current mode: <span className="capitalize font-medium">{nextTheme}</span>.
                </p>
            </div>
            {mounted && (
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                >
                    {resolvedTheme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                    ) : (
                    <MoonIcon className="h-5 w-5" />
                    )}
                </Button>
            )}
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

          <div>
            <Label className="flex items-center"><Droplet className="mr-1.5 h-4 w-4" /> Accent Gradient</Label>
            <RadioGroup value={currentAccentTheme} onValueChange={(value) => handleAccentThemeChange(value as AccentThemeValue)} className="grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2">
              {ACCENT_THEMES.map(themeOption => (
                <Label
                  key={themeOption.value}
                  htmlFor={`accent-${themeOption.value}`}
                  className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/10 cursor-pointer has-[:checked]:bg-accent/20 has-[:checked]:border-accent"
                >
                  <RadioGroupItem
                    value={themeOption.value}
                    id={`accent-${themeOption.value}`}
                    className={cn(
                      'border-border data-[state=checked]:border-ring',
                      `data-[state=checked]:bg-[${themeOption.lightColors.accent}]` // This might need specific class for HSL
                    )}
                  />
                  <div className="flex items-center gap-2">
                     <span className="h-4 w-4 rounded-sm border" style={{ background: themeOption.gradientPreview }}></span>
                     <span>{themeOption.label}</span>
                  </div>
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
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center"><Tag className="mr-2 h-5 w-5"/> Booking Category Management</CardTitle>
            <CardDescription>Create, edit, and delete categories for your bookings.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleOpenCategoryDialog()}>
            <Plus className="mr-1 h-4 w-4" /> Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {bookingCategories.length > 0 ? (
            <ScrollArea className="h-[300px] pr-2 -mr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookingCategories.map(category => (
                  <div key={category.id} className={cn("p-3 rounded-lg shadow-sm border flex flex-col justify-between", category.gradientClasses, category.textColorClass)}>
                    <span className="font-medium text-sm mb-2 break-words">{category.name}</span>
                    <div className="flex gap-1.5 self-end mt-1">
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7 hover:bg-white/20", category.textColorClass)} onClick={() => handleOpenCategoryDialog(category)} title="Edit Category">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-7 w-7 hover:bg-white/20", category.textColorClass, mockBookingsData.some(b => b.categoryId === category.id) && "opacity-50 cursor-not-allowed")}
                        onClick={() => handleDeleteCategory(category.id)}
                        title={mockBookingsData.some(b => b.categoryId === category.id) ? "Cannot delete: Category in use" : "Delete Category"}
                        disabled={mockBookingsData.some(b => b.categoryId === category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4 text-sm">No categories defined. Click "Add Category" to create one.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingCategory ? "Edit Booking Category" : "Add New Booking Category"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input id="category-name" value={categoryDialogName} onChange={(e) => setCategoryDialogName(e.target.value)} placeholder="e.g., Wedding, Portrait" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-gradient">Color Gradient</Label>
              <Select value={categoryDialogGradient} onValueChange={handleGradientChange}>
                <SelectTrigger id="category-gradient"><SelectValue placeholder="Select a gradient" /></SelectTrigger>
                <SelectContent>
                  {PREDEFINED_GRADIENTS.map(gradient => (
                    <SelectItem key={gradient.value} value={gradient.value}>
                      <div className="flex items-center">
                        <span className={cn("w-4 h-4 rounded-full mr-2 border", gradient.value)}></span>
                        {gradient.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button></DialogClose>
            <Button onClick={handleSaveCategory}><Save className="mr-2 h-4 w-4" />{editingCategory ? "Save Changes" : "Add Category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Eye className="mr-2 h-5 w-5" /> Display Previews</CardTitle>
          <CardDescription>See how certain information will be displayed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Date &amp; Time Format Preview</Label>
            <div className="space-y-1 mt-1 text-sm">
              <p>
                <span className="font-medium text-muted-foreground w-20 inline-block">Date :</span>
                <span className="text-foreground">{format(currentDateTime, currentSelectedDateFormat)}</span>
              </p>
              <p>
                <span className="font-medium text-muted-foreground w-20 inline-block">Time :</span>
                <span className="text-foreground">{format(currentDateTime, getActualClockFormatString(currentSelectedClockFormat))}</span>
              </p>
              <p>
                <span className="font-medium text-muted-foreground w-20 inline-block">Relative:</span>
                <span className="text-foreground">{format(new Date(Date.now() - 1000 * 60 * 5), `PPP ${getActualClockFormatString()}`)} (5 mins ago)</span>
              </p>
            </div>
            <div className="flex gap-2 mt-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Change Date Format
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {DATE_FORMATS.map(formatOption => (
                      <DropdownMenuItem
                        key={formatOption.value}
                        onClick={() => handleDateFormatSelect(formatOption.value)}
                      >
                       {formatOption.label} (e.g., {format(currentDateTime, formatOption.value)})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Change Clock Format
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {CLOCK_FORMATS.map(formatOption => (
                        <DropdownMenuItem
                        key={formatOption.value}
                        onClick={() => handleClockFormatSelect(formatOption.value)}
                        >
                        {formatOption.label} (e.g., {format(currentDateTime, formatOption.exampleFormat)})
                        </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><LinkIconFeather className="mr-2 h-5 w-5"/> Google Calendar Integration</CardTitle>
          <CardDescription>Connect your Google Calendar to sync bookings automatically (actual connection to be implemented).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCalendarConnected ? (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md">
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">Calendar Connection Active (Simulated)</p>
                <p className="text-sm text-green-600 dark:text-green-400">Rubo is set to interact with Google Calendar.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={toggleCalendarConnection}>
                <Slash className="mr-2 h-4 w-4" /> Deactivate Connection
              </Button>
            </div>
          ) : (
             <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-md">
              <div>
                <p className="font-medium">Calendar Connection Inactive</p>
                <p className="text-sm text-muted-foreground">Activate to allow Rubo to interact with Google Calendar.</p>
              </div>
              <Button onClick={toggleCalendarConnection}>
                <LinkIconFeather className="mr-2 h-4 w-4" /> Activate Connection (Simulated)
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="calendarId">Google Calendar ID to Sync</Label>
            <Input
              id="calendarId"
              placeholder="e.g., your_email@gmail.com or a specific calendar ID"
              value={calendarIdToSync}
              onChange={(e) => setCalendarIdToSync(e.target.value)}
              disabled={!isCalendarConnected}
            />
            <p className="text-xs text-muted-foreground">
              Enter the ID of the Google Calendar you want Rubo to use (usually your primary email, or a custom ID).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
                id="enableAutoSync"
                checked={enableAutoSync}
                onCheckedChange={setEnableAutoSync}
                disabled={!isCalendarConnected}
            />
            <Label htmlFor="enableAutoSync" className="cursor-pointer">Enable Automatic Sync</Label>
          </div>
           <p className="text-xs text-muted-foreground">
            When enabled and connected, Rubo will attempt to sync events automatically.
          </p>

          <Button onClick={handleSaveCalendarPreferences} disabled={!isCalendarConnected}>
            <Save className="mr-2 h-4 w-4" /> Save Calendar Preferences
          </Button>
           <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md text-yellow-700 dark:text-yellow-300 text-xs">
                <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                    The actual Google Calendar connection and sync functionality will be implemented when publishing the app.
                    These settings allow you to pre-configure how it should behave.
                    </span>
                </div>
            </div>
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

      <Separator />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5"/> Danger Zone</CardTitle>
          <CardDescription>Be careful with actions in this section as they can be irreversible.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground">Reset Application Data</h4>
            <p className="text-sm text-muted-foreground mb-2">
              This will clear all your bookings, clients, payments, invoices, tasks, notes, and settings.
              The application will be reset to its initial state. This action cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset Application Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your application data,
                    including settings, bookings, clients, payments, invoices, tasks, and notes, and log you out.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetApplicationData} className={cn(buttonVariants({ variant: "destructive" }))}>
                    Confirm Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
