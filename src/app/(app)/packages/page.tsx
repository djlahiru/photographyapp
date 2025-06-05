
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package as PackageIcon, Edit, Trash2, MoreVertical, DollarSign, CheckSquare, Save } from "react-feather";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';

// Mock data for packages
const initialMockPackages = [
  { id: "1", name: "Basic Portrait Session", description: "A quick session for individual portraits, perfect for headshots or a small update.", price: 150, services: ["30 min session", "5 edited photos", "Online gallery access"] },
  { id: "2", name: "Standard Wedding Package", description: "Comprehensive wedding day coverage from getting ready to the first dance.", price: 2500, services: ["8 hours coverage", "2 photographers", "Online gallery", "300+ edited photos", "Engagement session discount"] },
  { id: "3", name: "Family Lifestyle Shoot", description: "Capture natural family moments in a relaxed outdoor or in-home setting.", price: 350, services: ["1 hour session", "Outdoor or in-home", "50 edited photos", "Print release"] },
  { id: "4", name: "Event Photography", description: "Coverage for corporate events, parties, or other special occasions.", price: 600, services: ["Up to 3 hours coverage", "Online gallery", "All usable photos delivered"] },
];


export default function PackagesPage() {
  const [mockPackages, setMockPackages] = useState(initialMockPackages);
  const [isAddPackageDialogOpen, setIsAddPackageDialogOpen] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [newPackageDescription, setNewPackageDescription] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [newPackageServices, setNewPackageServices] = useState('');

  const handleSaveNewPackage = () => {
    if (!newPackageName.trim() || !newPackagePrice.trim()) {
      toast.error("Package Name and Price are required.");
      return;
    }

    const price = parseFloat(newPackagePrice);
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    const servicesArray = newPackageServices.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    const newPackage = {
      id: (mockPackages.length + 1).toString(),
      name: newPackageName,
      description: newPackageDescription,
      price: price,
      services: servicesArray,
    };

    setMockPackages(prevPackages => [...prevPackages, newPackage]);
    toast.success(`Package "${newPackage.name}" added successfully!`);

    setNewPackageName('');
    setNewPackageDescription('');
    setNewPackagePrice('');
    setNewPackageServices('');
    setIsAddPackageDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Photography Packages</h1>
          <p className="text-muted-foreground">Create, view, edit, and manage your service packages.</p>
        </div>
        <Button onClick={() => setIsAddPackageDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
        </Button>
      </div>

      {mockPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockPackages.map((pkg) => (
            <Card key={pkg.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold font-headline leading-tight">{pkg.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{pkg.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />Edit Package
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => {
                           setMockPackages(prev => prev.filter(p => p.id !== pkg.id));
                           toast.info(`Package "${pkg.name}" deleted.`);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Delete Package
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm pt-0">
                <div className="flex items-center font-semibold text-lg text-primary">
                  <DollarSign className="h-5 w-5 mr-1.5" />
                  {pkg.price.toFixed(2)}
                </div>
                <div>
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Included Services:</h4>
                  <ul className="space-y-1">
                    {pkg.services.slice(0, 4).map(service => (
                      <li key={service} className="flex items-start">
                        <CheckSquare className="h-3.5 w-3.5 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{service}</span>
                      </li>
                    ))}
                    {pkg.services.length > 4 && (
                       <li className="text-xs text-primary hover:underline cursor-pointer pt-1">+ {pkg.services.length - 4} more services</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed">
          <PackageIcon className="h-20 w-20 text-muted-foreground mb-6" />
          <h3 className="text-2xl font-semibold mb-3 font-headline">No Packages Defined Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">You haven&apos;t created any photography packages. Click the button to add your first one.</p>
          <Button size="lg" onClick={() => setIsAddPackageDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Package
          </Button>
        </div>
      )}

      <Dialog open={isAddPackageDialogOpen} onOpenChange={setIsAddPackageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Photography Package</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new package.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-package-name">Package Name</Label>
              <Input
                id="new-package-name"
                placeholder="e.g., Premium Wedding Collection"
                value={newPackageName}
                onChange={(e) => setNewPackageName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-package-description">Description</Label>
              <Textarea
                id="new-package-description"
                placeholder="Briefly describe what this package includes."
                value={newPackageDescription}
                onChange={(e) => setNewPackageDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-package-price">Price ($)</Label>
              <Input
                id="new-package-price"
                type="number"
                placeholder="e.g., 1500"
                value={newPackagePrice}
                onChange={(e) => setNewPackagePrice(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-package-services">Included Services (one per line)</Label>
              <Textarea
                id="new-package-services"
                placeholder="e.g., Full day coverage\n100 edited photos\nOnline gallery"
                value={newPackageServices}
                onChange={(e) => setNewPackageServices(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNewPackage}>
              <Save className="mr-2 h-4 w-4" /> Save Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
