
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash2, Phone, Mail, MessageCircle, Briefcase, TrendingUp, TrendingDown, FileText, Edit2 } from "react-feather";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Mock data for clients
const mockClients = [
  { id: "1", name: "Alice Wonderland", contactDetails: { email: "alice@example.com", phone: "555-1234" }, address: "123 Storybook Lane", totalPayments: 1200, outstandingBalance: 300, totalBookings: 5, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "female person", notes: "Prefers morning shoots. Allergic to cats." },
  { id: "2", name: "Bob The Builder", contactDetails: { email: "bob@example.com", phone: "555-5678" }, address: "456 Construction Rd", totalPayments: 5000, outstandingBalance: 0, totalBookings: 10, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "male person", notes: "Needs invoices sent to accounting@bobcorp.com." },
  { id: "3", name: "Charlie Chaplin", contactDetails: { email: "charlie@example.com" }, totalPayments: 800, outstandingBalance: 50, totalBookings: 2, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "classic actor" },
];

export default function ClientsPage() {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleEditNote = (clientName: string) => {
    console.log(`Edit note for ${clientName} clicked.`);
    // Placeholder for actual modal/edit functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Client Management</h1>
            <p className="text-muted-foreground">Add, view, edit, and manage client information.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </div>

      {mockClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockClients.map((client) => (
            <Card key={client.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint={client.dataAiHint} />
                  <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl font-semibold font-headline">{client.name}</CardTitle>
                  {client.address && <CardDescription className="text-xs">{client.address}</CardDescription>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 space-y-4">
                <div className="space-y-2">
                  {client.contactDetails.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`mailto:${client.contactDetails.email}`} className="hover:underline text-primary">{client.contactDetails.email}</a>
                    </div>
                  )}
                  {client.contactDetails.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${client.contactDetails.phone}`} className="hover:underline text-primary">{client.contactDetails.phone}</a>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                        <span>{client.totalBookings || 0} Bookings</span>
                    </div>
                    <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        <span>${client.totalPayments.toFixed(2)} Paid</span>
                    </div>
                    <div className={`flex items-center ${client.outstandingBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        <TrendingDown className="h-4 w-4 mr-2" />
                        <span>${client.outstandingBalance.toFixed(2)} Due</span>
                    </div>
                </div>

                {client.notes && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-start text-sm mt-2">
                      <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">Notes:</span>
                        <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border">
                  {client.contactDetails.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`https://wa.me/${client.contactDetails.phone.replace(/\D/g, '')}`} target="_blank">
                        <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
                      </Link>
                    </Button>
                  )}
                   {client.contactDetails.email && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`mailto:${client.contactDetails.email}`}>
                            <Mail className="h-4 w-4 mr-1.5" /> Email
                        </Link>
                    </Button>
                   )}
                   {client.contactDetails.phone && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`tel:${client.contactDetails.phone}`}>
                           <Phone className="h-4 w-4 mr-1.5" /> Call
                        </Link>
                    </Button>
                   )}
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t flex justify-end gap-2">
                <Button variant="ghost" size="icon" title="Edit Note" onClick={() => handleEditNote(client.name)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm"><Edit className="mr-1.5 h-4 w-4" />Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="mr-1.5 h-4 w-4" />Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed">
          <Users className="h-20 w-20 text-muted-foreground mb-6" />
          <h3 className="text-2xl font-semibold mb-3 font-headline">No Clients Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">You haven&apos;t added any clients. Click the button below to add your first client and start managing their bookings.</p>
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
          </Button>
        </div>
      )}
    </div>
  );
}
