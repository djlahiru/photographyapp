import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash2, MoreVertical, Phone, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for clients
const mockClients = [
  { id: "1", name: "Alice Wonderland", contactDetails: { email: "alice@example.com", phone: "555-1234" }, address: "123 Storybook Lane", totalPayments: 1200, outstandingBalance: 300, avatarUrl: "https://placehold.co/40x40.png", dataAiHint: "female person" },
  { id: "2", name: "Bob The Builder", contactDetails: { email: "bob@example.com", phone: "555-5678" }, address: "456 Construction Rd", totalPayments: 5000, outstandingBalance: 0, avatarUrl: "https://placehold.co/40x40.png", dataAiHint: "male person" },
  { id: "3", name: "Charlie Chaplin", contactDetails: { email: "charlie@example.com" }, totalPayments: 800, outstandingBalance: 50, avatarUrl: "https://placehold.co/40x40.png", dataAiHint: "classic actor" },
];

export default function ClientsPage() {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Client Management</h1>
            <p className="text-muted-foreground">Add, view, edit, and delete client information.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Client List</CardTitle>
            <CardDescription>Overview of all your clients and their payment status.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockClients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Total Paid</TableHead>
                  <TableHead className="hidden lg:table-cell">Outstanding</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint={client.dataAiHint} />
                          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{client.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {client.contactDetails.email && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3"/> {client.contactDetails.email}</div>}
                      {client.contactDetails.phone && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3"/> {client.contactDetails.phone}</div>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">${client.totalPayments.toFixed(2)}</TableCell>
                    <TableCell className={`hidden lg:table-cell ${client.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                      ${client.outstandingBalance.toFixed(2)}
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
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Clients Yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first client.</p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
