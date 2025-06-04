import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package as PackageIcon, Edit, Trash2, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for packages
const mockPackages = [
  { id: "1", name: "Basic Portrait Session", description: "A quick session for individual portraits.", price: 150, services: ["30 min session", "5 edited photos"] },
  { id: "2", name: "Standard Wedding Package", description: "Comprehensive wedding day coverage.", price: 2500, services: ["8 hours coverage", "2 photographers", "Online gallery", "300+ edited photos"] },
  { id: "3", name: "Family Lifestyle Shoot", description: "Capture natural family moments.", price: 350, services: ["1 hour session", "Outdoor location", "50 edited photos"] },
];


export default function PackagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Photography Packages</h1>
          <p className="text-muted-foreground">Create, view, edit, and delete your service packages.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package List</CardTitle>
          <CardDescription>Manage your photography packages offered to clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockPackages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">Services</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>${pkg.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {pkg.services.slice(0,3).map(service => <Badge key={service} variant="secondary">{service}</Badge>)}
                        {pkg.services.length > 3 && <Badge variant="outline">+{pkg.services.length-3} more</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Packages Yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first photography package.</p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Package
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
