
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Edit, Trash2, Phone, Mail, MessageCircle, Briefcase, TrendingUp, TrendingDown, FileText, Edit2, DollarSign, Calendar as CalendarIconFeather, Package, Save, Grid, List as ListIcon, Search, Eye } from "react-feather";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Payment, PaymentStatus, Client, Booking, BookingStatus } from '@/types';
import { format, parseISO, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockClientsData, mockBookingsData } from '@/lib/mock-data'; // Import from centralized mock data


const paymentStatusVariantMap: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Paid: "success",
  Pending: "warning",
  Failed: "destructive",
  Refunded: "outline",
};

const bookingStatusVariantMap: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Pending: "warning",
  Confirmed: "default",
  Completed: "success",
  Cancelled: "destructive",
};

type LayoutMode = 'grid' | 'list';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClientsData); 
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientWhatsApp, setNewClientWhatsApp] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [newClientPhotoFile, setNewClientPhotoFile] = useState<File | null>(null);
  const [newClientPhotoPreview, setNewClientPhotoPreview] = useState<string | null>(null);

  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientWhatsApp, setEditClientWhatsApp] = useState('');
  const [editClientAddress, setEditClientAddress] = useState('');
  const [editClientNotes, setEditClientNotes] = useState('');
  const [editClientPhotoFile, setEditClientPhotoFile] = useState<File | null>(null);
  const [editClientPhotoPreview, setEditClientPhotoPreview] = useState<string | null>(null);
  
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedClientForBookings, setSelectedClientForBookings] = useState<Client | null>(null);
  const [isClientBookingsDialogOpen, setIsClientBookingsDialogOpen] = useState(false);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const resetNewClientForm = useCallback(() => {
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientWhatsApp('');
    setNewClientAddress('');
    setNewClientNotes('');
    setNewClientPhotoFile(null);
    setNewClientPhotoPreview(null);
  }, []);

  const handleOpenAddClientDialog = useCallback(() => {
    resetNewClientForm();
    setIsAddClientDialogOpen(true);
  }, [resetNewClientForm]);

  useEffect(() => {
    const openDialog = () => handleOpenAddClientDialog();
    window.addEventListener('fabOpenNewClientDialog', openDialog);
    return () => {
      window.removeEventListener('fabOpenNewClientDialog', openDialog);
    };
  }, [handleOpenAddClientDialog]); 

  const handleEditNote = (clientName: string) => {
    const clientToEdit = clients.find(c => c.name === clientName);
    if (clientToEdit) {
      handleOpenEditDialog(clientToEdit);
    }
  };

  const getClientPayments = (clientName: string): Payment[] => {
    const clientBookings = mockBookingsData.filter(b => b.clientName === clientName); 
    const allPayments: Payment[] = [];
    clientBookings.forEach(booking => {
      if (booking.payments) {
        allPayments.push(...booking.payments.map(p => ({...p, bookingPackageName: booking.packageName})));
      }
    });
    return allPayments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  };
  
  const getClientBookingsList = (clientName: string): Booking[] => {
    return mockBookingsData.filter(booking => booking.clientName === clientName) 
                              .sort((a,b) => {
                                const dateA = a.bookingDates[0]?.dateTime ? new Date(a.bookingDates[0].dateTime) : new Date(0);
                                const dateB = b.bookingDates[0]?.dateTime ? new Date(b.bookingDates[0].dateTime) : new Date(0);
                                return dateB.getTime() - dateA.getTime();
                              });
  };

  const handleOpenClientBookingsDialog = (client: Client) => {
    setSelectedClientForBookings(client);
    setIsClientBookingsDialogOpen(true);
  };


  const handleClientPhotoChange = (file: File | null, type: 'new' | 'edit') => {
    if (type === 'new') {
      setNewClientPhotoFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setNewClientPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setNewClientPhotoPreview(null);
      }
    } else {
      setEditClientPhotoFile(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setEditClientPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setEditClientPhotoPreview(editingClient?.avatarUrl || null);
      }
    }
  };

  const handleSaveNewClient = () => {
    if (!newClientName.trim()) {
      toast.error("Client Name is required.");
      return;
    }

    const newClient: Client = {
      id: (mockClientsData.length + Date.now()).toString(), 
      name: newClientName,
      contactDetails: {
        email: newClientEmail.trim() || undefined,
        phone: newClientPhone.trim() || undefined,
        whatsapp: newClientWhatsApp.trim() || undefined,
      },
      address: newClientAddress.trim() || undefined,
      notes: newClientNotes.trim() || undefined,
      avatarUrl: newClientPhotoPreview || `https://placehold.co/80x80.png?text=${getInitials(newClientName)}`,
      dataAiHint: newClientPhotoPreview ? "person client custom" : "person client",
      totalPayments: 0, 
      outstandingBalance: 0, 
      totalBookings: 0, 
    };

    mockClientsData.unshift(newClient); 
    setClients([...mockClientsData]); 

    toast.success(`Client "${newClient.name}" added successfully!`);
    resetNewClientForm();
    setIsAddClientDialogOpen(false);
  };

  const handleOpenEditDialog = (client: Client) => {
    setEditingClient(client);
    setEditClientName(client.name);
    setEditClientEmail(client.contactDetails.email || '');
    setEditClientPhone(client.contactDetails.phone || '');
    setEditClientWhatsApp(client.contactDetails.whatsapp || '');
    setEditClientAddress(client.address || '');
    setEditClientNotes(client.notes || '');
    setEditClientPhotoPreview(client.avatarUrl || null);
    setEditClientPhotoFile(null);
    setIsEditClientDialogOpen(true);
  };

  const handleSaveEditedClient = () => {
    if (!editingClient || !editClientName.trim()) {
      toast.error("Client Name is required.");
      return;
    }

    const updatedClient: Client = {
      ...editingClient,
      name: editClientName,
      contactDetails: {
        email: editClientEmail.trim() || undefined,
        phone: editClientPhone.trim() || undefined,
        whatsapp: editClientWhatsApp.trim() || undefined,
      },
      address: editClientAddress.trim() || undefined,
      notes: editClientNotes.trim() || undefined,
      avatarUrl: editClientPhotoPreview || editingClient.avatarUrl,
      dataAiHint: editClientPhotoPreview && editClientPhotoPreview !== editingClient.avatarUrl ? "person client custom" : editingClient.dataAiHint,
    };

    const clientIndex = mockClientsData.findIndex(c => c.id === editingClient.id); 
    if (clientIndex !== -1) {
      mockClientsData[clientIndex] = updatedClient; 
    }
    setClients([...mockClientsData]); 

    toast.success(`Client "${updatedClient.name}" updated successfully!`);
    setIsEditClientDialogOpen(false);
    setEditingClient(null);
  };
  
  const handleDeleteClient = (clientId: string, clientName: string) => {
    const clientIndex = mockClientsData.findIndex(c => c.id === clientId); 
    if (clientIndex !== -1) {
      mockClientsData.splice(clientIndex, 1); 
    }
    setClients([...mockClientsData]); 
    toast.info(`Client "${clientName}" deleted.`);
  };

  const clientsWithDynamicData = useMemo(() => {
    return clients.map(client => { 
        const clientBookings = mockBookingsData.filter(b => b.clientName === client.name); 
        const totalPaidForClient = clientBookings.reduce((sum, booking) => {
            return sum + (booking.payments?.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0) || 0);
        }, 0);
        const totalPricedForClient = clientBookings.reduce((sum, booking) => sum + booking.price, 0);
        const outstandingBalance = totalPricedForClient - totalPaidForClient;

        return {
            ...client,
            totalBookings: clientBookings.length,
            totalPayments: totalPaidForClient,
            outstandingBalance: outstandingBalance < 0 ? 0 : outstandingBalance,
        };
    });
  }, [clients]); 

  const filteredClients = useMemo(() => {
    let clientsToDisplay = [...clientsWithDynamicData];
    if (searchTerm.trim() !== '') {
      clientsToDisplay = clientsToDisplay.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.contactDetails.email && client.contactDetails.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return clientsToDisplay;
  }, [clientsWithDynamicData, searchTerm]);
  

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
                placeholder="Search clients..."
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
            <Button onClick={handleOpenAddClientDialog}>
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
                  <Button variant="ghost" size="icon" title="View Bookings" onClick={() => handleOpenClientBookingsDialog(client)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit Client" onClick={() => handleOpenEditDialog(client)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete Client"
                    onClick={() => handleDeleteClient(client.id, client.name)}
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
                     {client.contactDetails.whatsapp && (
                      <div className="flex items-center text-sm">
                        <MessageCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={`https://wa.me/${client.contactDetails.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{client.contactDetails.whatsapp} (WhatsApp)</a>
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
                    {client.contactDetails.whatsapp && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`https://wa.me/${client.contactDetails.whatsapp.replace(/\D/g, '')}`} target="_blank">
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
                  <Button variant="ghost" size="icon" title="View Client Bookings" onClick={() => handleOpenClientBookingsDialog(client)}>
                      <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit Note" onClick={() => handleEditNote(client.name)}>
                      <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEditDialog(client)}><Edit className="mr-1.5 h-4 w-4" />Edit</Button>
                  <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClient(client.id, client.name)}
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
          {clientsWithDynamicData.length === 0 && searchTerm.trim() === '' ? ( 
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
          <Button size="lg" onClick={handleOpenAddClientDialog}>
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
          </Button>
        </div>
      )}

      {/* Add New Client Dialog */}
      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Add New Client</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new client profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="new-client-photo">Client Photo</Label>
              <ImageUploadDropzone
                onFileChange={(file) => handleClientPhotoChange(file, 'new')}
                initialImageUrl={newClientPhotoPreview || undefined}
                className="h-32"
                imageClassName="rounded-md"
                label="Drop photo or click to upload"
              />
            </div>
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
              <Label htmlFor="new-client-whatsapp">WhatsApp Number (Optional)</Label>
              <Input
                id="new-client-whatsapp"
                type="tel"
                placeholder="e.g., +1 555-0102"
                value={newClientWhatsApp}
                onChange={(e) => setNewClientWhatsApp(e.target.value)}
              />
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

      {/* Edit Client Dialog */}
      {editingClient && (
        <Dialog open={isEditClientDialogOpen} onOpenChange={setIsEditClientDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">Edit Client: {editingClient.name}</DialogTitle>
              <DialogDescription>
                Update the client's profile information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-client-photo">Client Photo</Label>
                <ImageUploadDropzone
                  onFileChange={(file) => handleClientPhotoChange(file, 'edit')}
                  initialImageUrl={editClientPhotoPreview || undefined}
                  className="h-32"
                  imageClassName="rounded-md"
                  label="Drop photo or click to upload"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-client-name">Full Name</Label>
                <Input
                  id="edit-client-name"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                  <Label htmlFor="edit-client-email">Email Address</Label>
                  <Input
                      id="edit-client-email"
                      type="email"
                      value={editClientEmail}
                      onChange={(e) => setEditClientEmail(e.target.value)}
                  />
                  </div>
                  <div className="grid gap-2">
                  <Label htmlFor="edit-client-phone">Phone Number</Label>
                  <Input
                      id="edit-client-phone"
                      type="tel"
                      value={editClientPhone}
                      onChange={(e) => setEditClientPhone(e.target.value)}
                  />
                  </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-client-whatsapp">WhatsApp Number (Optional)</Label>
                <Input
                  id="edit-client-whatsapp"
                  type="tel"
                  value={editClientWhatsApp}
                  onChange={(e) => setEditClientWhatsApp(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-client-address">Address (Optional)</Label>
                <Textarea
                  id="edit-client-address"
                  value={editClientAddress}
                  onChange={(e) => setEditClientAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-client-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-client-notes"
                  value={editClientNotes}
                  onChange={(e) => setEditClientNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => {setIsEditClientDialogOpen(false); setEditingClient(null);}}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveEditedClient}>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Bookings Dialog */}
      {selectedClientForBookings && (
        <Dialog open={isClientBookingsDialogOpen} onOpenChange={setIsClientBookingsDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-headline">Bookings for {selectedClientForBookings.name}</DialogTitle>
              <DialogDescription>
                Showing all bookings associated with {selectedClientForBookings.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[400px] pr-3">
                {getClientBookingsList(selectedClientForBookings.name).length > 0 ? (
                  <div className="space-y-3">
                    {getClientBookingsList(selectedClientForBookings.name).map(booking => {
                       const firstBookingDate = booking.bookingDates && booking.bookingDates.length > 0 && booking.bookingDates[0].dateTime ? parseISO(booking.bookingDates[0].dateTime) : null;
                      return (
                        <Card key={booking.id} className="bg-card/70 border">
                          <CardHeader className="p-3">
                            <CardTitle className="text-base font-semibold">{booking.packageName}</CardTitle>
                            {firstBookingDate && isValid(firstBookingDate) ? (
                                <CardDescription className="text-xs">
                                    {format(firstBookingDate, "eee, MMM d, yyyy 'at' h:mm a")}
                                    {booking.bookingDates.length > 1 && ` (+${booking.bookingDates.length -1} more)`}
                                </CardDescription>
                            ) : (
                                <CardDescription className="text-xs">No date set</CardDescription>
                            )}
                          </CardHeader>
                          <CardFooter className="p-3 border-t">
                            <Badge variant={bookingStatusVariantMap[booking.status]} className="text-xs">
                              {booking.status}
                            </Badge>
                            <span className="ml-auto text-sm font-medium text-foreground">${booking.price.toFixed(2)}</span>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10">No bookings found for {selectedClientForBookings.name}.</p>
                )}
              </ScrollArea>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
