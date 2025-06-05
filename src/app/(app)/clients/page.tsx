
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash2, Phone, Mail, MessageCircle, Briefcase, TrendingUp, TrendingDown, FileText, Edit2, DollarSign, Calendar as CalendarIconFeather, Package, Save, Grid, List as ListIcon, Search } from "react-feather";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { mockBookings } from '@/app/(app)/bookings/page';
import type { Payment, PaymentStatus } from '@/types';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

// Mock data for clients
const initialMockClients = [
  { id: "1", name: "Alice Wonderland", contactDetails: { email: "alice@example.com", phone: "555-1234" }, address: "123 Storybook Lane", totalPayments: 150, outstandingBalance: 0, totalBookings: 1, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "female person", notes: "Prefers morning shoots. Allergic to cats." },
  { id: "2", name: "Bob The Builder", contactDetails: { email: "bob@example.com", phone: "555-5678" }, address: "456 Construction Rd", totalPayments: 2500, outstandingBalance: 0, totalBookings: 1, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "male person", notes: "Needs invoices sent to accounting@bobcorp.com." },
  { id: "3", name: "Charlie Chaplin", contactDetails: { email: "charlie@example.com" }, totalPayments: 0, outstandingBalance: 100, totalBookings: 1, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "classic actor", notes: "" },
  { id: "4", name: "Diana Prince", contactDetails: { email: "diana@example.com" }, totalPayments: 0, outstandingBalance: 0, totalBookings: 1, avatarUrl: "https://placehold.co/80x80.png", dataAiHint: "heroine woman", notes: "" },
];

const paymentStatusVariantMap: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Paid: "success",
  Pending: "warning",
  Failed: "destructive",
  Refunded: "outline",
};

type LayoutMode = 'grid' | 'list';

export default function ClientsPage() {
  const [mockClients, setMockClients] = useState(initialMockClients);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleEditNote = (clientName: string) => {
    console.log(`Edit note for ${clientName} clicked.`);
  };

  const getClientPayments = (clientName: string): Payment[] => {
    const clientBookings = mockBookings.filter(b => b.clientName === clientName);
    const allPayments: Payment[] = [];
    clientBookings.forEach(booking => {
      if (booking.payments) {
        allPayments.push(...booking.payments.map(p => ({...p, bookingPackageName: booking.packageName})));
      }
    });
    return allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  };

  const resetNewClientForm = () => {
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewClientNotes('');
  };

  const handleSaveNewClient = () => {
    if (!newClientName.trim()) {
      toast.error("Client Name is required.");
      return;
    }

    const newClient = {
      id: (mockClients.length + 1).toString(),
      name: newClientName,
      contactDetails: {
        email: newClientEmail.trim() || undefined,
        phone: newClientPhone.trim() || undefined,
      },
      address: newClientAddress.trim() || undefined,
      notes: newClientNotes.trim() || undefined,
      totalPayments: 0,
      outstandingBalance: 0,
      totalBookings: 0,
      avatarUrl: `https://placehold.co/80x80.png?text=${getInitials(newClientName)}`,
      dataAiHint: "person", 
    };

    setMockClients(prevClients => [...prevClients, newClient]);
    toast.success(`Client "${newClient.name}" added successfully!`);
    console.log("New Client Saved:", newClient);

    resetNewClientForm();
    setIsAddClientDialogOpen(false);
  };

  const filteredClients = useMemo(() => {
    let clientsToDisplay = [...mockClients];
    if (searchTerm.trim() !== '') {
      clientsToDisplay = clientsToDisplay.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return clientsToDisplay;
  }, [mockClients, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Client Management</h1>
            <p className="text-muted-foreground">Add, view, edit, and manage client information.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <div className="relative w-full sm:w-auto flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search clients by name..."
                className="pl-8 w-full sm:w-[200px] lg:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={layoutMode === 'grid' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setLayoutMode('grid')}
                aria-label="Grid View"
                title="Grid View"
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button 
                variant={layoutMode === 'list' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setLayoutMode('list')}
                aria-label="List View"
                title="List View"
              >
                <ListIcon className="h-5 w-5" />
              </Button>
            </div>
            <Button onClick={() => setIsAddClientDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
            </Button>
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <div className={cn(
          layoutMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "flex flex-col gap-2" 
        )}>
          {filteredClients.map((client) => (
            layoutMode === 'list' ? (
              <div key={client.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors bg-card shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.avatarUrl} alt={client.name} data-ai-hint={client.dataAiHint} />
                    <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{client.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" title="Edit Client">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete Client"
                    onClick={() => {
                      setMockClients(prev => prev.filter(c => c.id !== client.id));
                      toast.info(`Client "${client.name}" deleted.`);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
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

                  <div className="pt-3 border-t border-border">
                    <h4 className="text-sm font-medium text-foreground mb-2">Recent Payments</h4>
                    {getClientPayments(client.name).slice(0,3).length > 0 ? (
                      <div className="space-y-2">
                        {getClientPayments(client.name).slice(0,3).map(payment => (
                          <div key={payment.id} className="text-xs p-2 rounded-md border border-border/70 bg-muted/30">
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-medium text-foreground">
                                {payment.description || (payment as any).bookingPackageName || 'Payment'}
                              </span>
                              <Badge variant={paymentStatusVariantMap[payment.status]} className="text-xs px-1.5 py-0.5">
                                {payment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <DollarSign className="h-3 w-3 mr-1" /> ${payment.amount.toFixed(2)}
                              <span className="mx-1.5">|</span>
                              <CalendarIconFeather className="h-3 w-3 mr-1" /> {format(new Date(payment.paymentDate), "MMM d, yyyy")}
                            </div>
                            {(payment as any).bookingPackageName && (
                              <div className="flex items-center text-muted-foreground mt-0.5">
                                  <Package className="h-3 w-3 mr-1" /> For: {(payment as any).bookingPackageName}
                              </div>
                            )}
                          </div>
                        ))}
                        {getClientPayments(client.name).length > 3 && (
                          <Link href="#" className="text-xs text-primary hover:underline block text-right mt-1">
                            View all payments...
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No recent payment activity.</p>
                    )}
                  </div>

                  {client.notes && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-start text-sm mt-2">
                        <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div>
                          <span className="font-medium text-foreground">Notes:</span>
                          <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-border flex-wrap">
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
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                          setMockClients(prev => prev.filter(c => c.id !== client.id));
                          toast.info(`Client "${client.name}" deleted.`);
                      }}
                  >
                      <Trash2 className="mr-1.5 h-4 w-4" />Delete
                  </Button>
                </CardFooter>
              </Card>
            )
          ))}
        </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed">
          <Users className="h-20 w-20 text-muted-foreground mb-6" />
          {mockClients.length === 0 && searchTerm.trim() === '' ? (
            <>
              <h3 className="text-2xl font-semibold mb-3 font-headline">No Clients Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">You haven&apos;t added any clients. Click the button below to add your first client and start managing their bookings.</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-semibold mb-3 font-headline">No Clients Found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">No clients match your current search criteria. Try adjusting your search.</p>
            </>
          )}
          <Button size="lg" onClick={() => setIsAddClientDialogOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
          </Button>
        </div>
      )}

      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Client</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new client profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-client-name">Full Name</Label>
              <Input
                id="new-client-name"
                placeholder="e.g., John Doe"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                <Label htmlFor="new-client-email">Email Address</Label>
                <Input
                    id="new-client-email"
                    type="email"
                    placeholder="e.g., john.doe@example.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="new-client-phone">Phone Number</Label>
                <Input
                    id="new-client-phone"
                    type="tel"
                    placeholder="e.g., 555-0101"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-client-address">Address (Optional)</Label>
              <Textarea
                id="new-client-address"
                placeholder="e.g., 123 Main St, Anytown, USA"
                value={newClientAddress}
                onChange={(e) => setNewClientAddress(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-client-notes">Notes (Optional)</Label>
              <Textarea
                id="new-client-notes"
                placeholder="e.g., Prefers evening calls, interested in family portraits."
                value={newClientNotes}
                onChange={(e) => setNewClientNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetNewClientForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveNewClient}>
              <Save className="mr-2 h-4 w-4" /> Save Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

    