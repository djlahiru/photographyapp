
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, DollarSign, Users, TrendingUp, TrendingDown, List, Filter, Search, CreditCard, Briefcase, Calendar as CalendarIconFeather, Package, Save, UserPlus } from "react-feather";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isValid } from 'date-fns';
import type { Payment, Booking, Client, PaymentStatus } from '@/types';
import { mockBookingsData, mockClientsData } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';

const paymentStatusVariantMap: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Paid: "success",
  Pending: "warning",
  Failed: "destructive",
  Refunded: "outline",
};

const PAYMENT_METHODS = ["Credit Card", "Bank Transfer", "Cash", "Online Payment", "Other"];
const PAYMENT_STATUSES: PaymentStatus[] = ["Paid", "Pending", "Failed"];


interface EnrichedPayment extends Payment {
  clientName: string;
  packageName: string;
  bookingCategory?: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [refreshKey, setRefreshKey] = useState(0); 

  // State for Record Payment Dialog
  const [isRecordPaymentDialogOpen, setIsRecordPaymentDialogOpen] = useState(false);
  const [paymentClientName, setPaymentClientName] = useState(''); // For text input
  const [suggestedPaymentClients, setSuggestedPaymentClients] = useState<Client[]>([]);
  const [isPaymentClientSuggestionsOpen, setIsPaymentClientSuggestionsOpen] = useState(false);
  
  const [selectedBookingIdForPayment, setSelectedBookingIdForPayment] = useState<string | undefined>(undefined);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>(undefined);
  const [paymentDescription, setPaymentDescription] = useState('');
  
  const [availableBookingsForClient, setAvailableBookingsForClient] = useState<Booking[]>([]);

  // State for "Add New Client for Payment" dialog
  const [isAddNewClientDialogForPaymentOpen, setIsAddNewClientDialogForPaymentOpen] = useState(false);
  const [newClientForPaymentName, setNewClientForPaymentName] = useState('');
  const [newClientForPaymentEmail, setNewClientForPaymentEmail] = useState('');
  const [newClientForPaymentPhone, setNewClientForPaymentPhone] = useState('');
  const [newClientForPaymentWhatsApp, setNewClientForPaymentWhatsApp] = useState('');
  const [newClientForPaymentAddress, setNewClientForPaymentAddress] = useState('');
  const [newClientForPaymentNotes, setNewClientForPaymentNotes] = useState('');
  const [newClientForPaymentPhotoFile, setNewClientForPaymentPhotoFile] = useState<File | null>(null);
  const [newClientForPaymentPhotoPreview, setNewClientForPaymentPhotoPreview] = useState<string | null>(null);


  useEffect(() => {
    if (paymentClientName.trim()) {
      const client = mockClientsData.find(c => c.name.toLowerCase() === paymentClientName.trim().toLowerCase());
      if (client) {
        setAvailableBookingsForClient(mockBookingsData.filter(b => b.clientName === client.name && b.status !== 'Cancelled'));
      } else {
        setAvailableBookingsForClient([]); // Client name typed but not matched to existing
      }
    } else {
      setAvailableBookingsForClient([]); // No client name entered
    }
    setSelectedBookingIdForPayment(undefined); // Reset booking if client name changes or clears
  }, [paymentClientName, mockBookingsData, mockClientsData]);


  const allPayments: EnrichedPayment[] = useMemo(() => {
    const payments: EnrichedPayment[] = [];
    mockBookingsData.forEach(booking => {
      const client = mockClientsData.find(c => c.name === booking.clientName);
      booking.payments?.forEach(p => {
        payments.push({
          ...p,
          clientName: client?.name || 'Unknown Client',
          packageName: booking.packageName,
          bookingCategory: booking.category,
        });
      });
    });
    return payments.sort((a, b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime());
  }, [mockBookingsData, mockClientsData, refreshKey]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        payment.clientName.toLowerCase().includes(searchLower) ||
        payment.packageName.toLowerCase().includes(searchLower) ||
        (payment.description && payment.description.toLowerCase().includes(searchLower)) ||
        payment.amount.toString().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allPayments, searchTerm, statusFilter, refreshKey]);

  const recentPayments = useMemo(() => {
    return allPayments.slice(0, 5);
  }, [allPayments, refreshKey]);

  const summaryStats = useMemo(() => {
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    
    let totalRevenueThisMonth = 0;
    let totalOutstanding = 0;
    let totalPaidAllTime = 0;

    allPayments.forEach(payment => {
      if (payment.status === 'Paid') {
        totalPaidAllTime += payment.amount;
         if (isValid(parseISO(payment.paymentDate)) && isWithinInterval(parseISO(payment.paymentDate), currentMonthInterval)) {
          totalRevenueThisMonth += payment.amount;
        }
      }
    });

    mockBookingsData.forEach(booking => {
        const paidForBooking = booking.payments?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
        if (booking.status !== 'Cancelled' && booking.price > paidForBooking) {
            totalOutstanding += (booking.price - paidForBooking);
        }
    });

    return {
      totalRevenueThisMonth,
      totalOutstanding,
      totalPaidAllTime,
      totalTransactions: allPayments.length,
    };
  }, [allPayments, mockBookingsData, refreshKey]);

  const resetRecordPaymentForm = () => {
    setPaymentClientName('');
    setSuggestedPaymentClients([]);
    setIsPaymentClientSuggestionsOpen(false);
    setSelectedBookingIdForPayment(undefined);
    setPaymentAmount('');
    setPaymentDate('');
    setPaymentMethod(undefined);
    setPaymentStatus(undefined);
    setPaymentDescription('');
    setAvailableBookingsForClient([]);
  };
  
  const resetNewClientForPaymentForm = () => {
    setNewClientForPaymentName('');
    setNewClientForPaymentEmail('');
    setNewClientForPaymentPhone('');
    setNewClientForPaymentWhatsApp('');
    setNewClientForPaymentAddress('');
    setNewClientForPaymentNotes('');
    setNewClientForPaymentPhotoFile(null);
    setNewClientForPaymentPhotoPreview(null);
  };

  const handleOpenRecordPaymentDialog = () => {
    resetRecordPaymentForm();
    setIsRecordPaymentDialogOpen(true);
  };
  
  const handlePaymentClientNameChange = (name: string) => {
    setPaymentClientName(name);
    if (name.trim() === '') {
      setSuggestedPaymentClients([]);
      setIsPaymentClientSuggestionsOpen(false);
      return;
    }
    const matches = mockClientsData.filter(client => 
      client.name.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestedPaymentClients(matches);
    setIsPaymentClientSuggestionsOpen(matches.length > 0);
  };

  const handleClientPhotoChangeForPayment = (file: File | null) => {
    setNewClientForPaymentPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewClientForPaymentPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setNewClientForPaymentPhotoPreview(null);
    }
  };

  const handleSaveNewClientForPayment = () => {
    if (!newClientForPaymentName.trim()) {
      toast.error("Client Name is required for the new client.");
      return;
    }

    const existingClient = mockClientsData.find(c => c.name.toLowerCase() === newClientForPaymentName.trim().toLowerCase());
    if (existingClient) {
        toast.warn(`Client "${newClientForPaymentName.trim()}" already exists. Selecting existing client.`);
        setPaymentClientName(existingClient.name);
    } else {
        const newClientToAdd: Client = {
            id: `client-${Date.now()}`,
            name: newClientForPaymentName.trim(),
            contactDetails: {
                email: newClientForPaymentEmail.trim() || undefined,
                phone: newClientForPaymentPhone.trim() || undefined,
                whatsapp: newClientForPaymentWhatsApp.trim() || undefined,
            },
            address: newClientForPaymentAddress.trim() || undefined,
            notes: newClientForPaymentNotes.trim() || undefined,
            avatarUrl: newClientForPaymentPhotoPreview || `https://placehold.co/80x80.png?text=${newClientForPaymentName.trim().split(' ').map(n=>n[0]).join('').toUpperCase()}`,
            dataAiHint: newClientForPaymentPhotoPreview ? "person client custom" : "person client",
            totalPayments: 0,
            outstandingBalance: 0,
            totalBookings: 0,
        };
        mockClientsData.unshift(newClientToAdd); 
        setPaymentClientName(newClientToAdd.name);
        toast.success(`New client "${newClientToAdd.name}" added and selected.`);
    }
    
    setIsAddNewClientDialogForPaymentOpen(false);
    resetNewClientForPaymentForm();
    setSuggestedPaymentClients([]);
    setIsPaymentClientSuggestionsOpen(false);
  };

  const handleRecordPaymentSubmit = () => {
    if (!paymentClientName.trim() || !selectedBookingIdForPayment || !paymentAmount || !paymentDate || !paymentMethod || !paymentStatus) {
      toast.error("Client, Booking, Amount, Date, Method, and Status are required.");
      return;
    }
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (!isValid(new Date(paymentDate))) {
        toast.error("Please enter a valid payment date.");
        return;
    }

    const bookingIndex = mockBookingsData.findIndex(b => b.id === selectedBookingIdForPayment);
    if (bookingIndex === -1) {
      toast.error("Selected booking not found. Please try again.");
      return;
    }
    
    // Ensure the booking client matches the selected/entered client name
    if (mockBookingsData[bookingIndex].clientName.toLowerCase() !== paymentClientName.trim().toLowerCase()){
        toast.error("The selected booking does not belong to the specified client. Please verify your selection.");
        return;
    }

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      bookingId: selectedBookingIdForPayment,
      amount: amount,
      paymentDate: new Date(paymentDate).toISOString(),
      method: paymentMethod,
      status: paymentStatus,
      description: paymentDescription.trim() || undefined,
    };

    if (!mockBookingsData[bookingIndex].payments) {
      mockBookingsData[bookingIndex].payments = [];
    }
    mockBookingsData[bookingIndex].payments!.unshift(newPayment);

    toast.success(`Payment of $${amount.toFixed(2)} recorded for booking.`);
    setRefreshKey(prev => prev + 1); 
    setIsRecordPaymentDialogOpen(false);
    resetRecordPaymentForm();
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Payment Management</h1>
            <p className="text-muted-foreground">Track, record, and manage all client payments.</p>
        </div>
        <Button onClick={handleOpenRecordPaymentDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Record New Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue This Month</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">${summaryStats.totalRevenueThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground pt-1">From paid invoices</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">${summaryStats.totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground pt-1">Across all active bookings</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid (All Time)</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">${summaryStats.totalPaidAllTime.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground pt-1">Overall received payments</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <List className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">{summaryStats.totalTransactions}</div>
             <p className="text-xs text-muted-foreground pt-1">Recorded payment entries</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Recent Payments</CardTitle>
          <CardDescription>A quick overview of the latest transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <ScrollArea className="h-[300px] pr-2">
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors gap-2 sm:gap-4">
                    <div className="flex-grow space-y-0.5">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm font-medium text-foreground">{payment.clientName}</p>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                         <Briefcase className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        <span>{payment.packageName} {payment.bookingCategory && `(${payment.bookingCategory})`}</span>
                      </div>
                       {payment.description && (
                         <div className="flex items-center text-xs text-muted-foreground italic">
                           <List className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                           <span>{payment.description}</span>
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                       <Badge variant={paymentStatusVariantMap[payment.status]} className="text-xs self-start sm:self-auto">
                        {payment.status}
                      </Badge>
                      <p className="text-lg font-semibold text-primary">${payment.amount.toFixed(2)}</p>
                       {isValid(parseISO(payment.paymentDate)) && (
                        <p className="text-xs text-muted-foreground">
                            {format(parseISO(payment.paymentDate), "MMM d, yyyy, h:mm a")}
                        </p>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-10">No recent payments to display.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Full Payment History</CardTitle>
          <CardDescription>Browse and filter all recorded payments.</CardDescription>
           <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, package, amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] w-full overflow-x-auto">
             {filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Package / Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{payment.clientName}</TableCell>
                    <TableCell>
                        {payment.packageName}
                        {payment.bookingCategory && <span className="text-xs text-muted-foreground block">({payment.bookingCategory})</span>}
                    </TableCell>
                    <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{isValid(parseISO(payment.paymentDate)) ? format(parseISO(payment.paymentDate), "MMM d, yyyy") : 'Invalid Date'}</TableCell>
                    <TableCell>{payment.method || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={paymentStatusVariantMap[payment.status]}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {payment.description || 'No description'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4" />
                <p>No payments found matching your criteria.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Record New Payment Dialog */}
      <Dialog open={isRecordPaymentDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setIsRecordPaymentDialogOpen(false);
          resetRecordPaymentForm();
        } else {
          setIsRecordPaymentDialogOpen(true);
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Record New Payment</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new payment record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="relative grid gap-2">
              <Label htmlFor="payment-client-name">Client</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="payment-client-name"
                  placeholder="Search clients or enter new name..."
                  value={paymentClientName}
                  onChange={(e) => handlePaymentClientNameChange(e.target.value)}
                  onFocus={() => {
                     if (paymentClientName.trim()) {
                       const matches = mockClientsData.filter(client => 
                         client.name.toLowerCase().includes(paymentClientName.toLowerCase())
                       );
                       setSuggestedPaymentClients(matches);
                       setIsPaymentClientSuggestionsOpen(matches.length > 0);
                     }
                   }}
                   onBlur={() => setTimeout(() => setIsPaymentClientSuggestionsOpen(false), 150)} 
                  autoComplete="off"
                  className="flex-grow"
                />
                <Button variant="outline" size="sm" onClick={() => { resetNewClientForPaymentForm(); setIsAddNewClientDialogForPaymentOpen(true); setIsPaymentClientSuggestionsOpen(false); }}>
                    <UserPlus className="mr-1 h-4 w-4" /> Add New
                </Button>
              </div>
              {isPaymentClientSuggestionsOpen && suggestedPaymentClients.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
                  {suggestedPaymentClients.map(client => (
                    <div
                      key={client.id}
                      className="p-2 hover:bg-accent cursor-pointer text-sm"
                      onMouseDown={() => { // Use onMouseDown to fire before onBlur of input
                        setPaymentClientName(client.name);
                        setIsPaymentClientSuggestionsOpen(false);
                        setSuggestedPaymentClients([]);
                      }}
                    >
                      {client.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {paymentClientName.trim() && (
              <div className="grid gap-2">
                <Label htmlFor="payment-booking">Booking</Label>
                <Select value={selectedBookingIdForPayment} onValueChange={setSelectedBookingIdForPayment} disabled={availableBookingsForClient.length === 0}>
                  <SelectTrigger id="payment-booking">
                    <SelectValue placeholder={availableBookingsForClient.length > 0 ? "Select a booking" : "No active bookings for client"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Client's Bookings</SelectLabel>
                      {availableBookingsForClient.map(booking => {
                        const firstDate = booking.bookingDates[0]?.dateTime ? format(parseISO(booking.bookingDates[0].dateTime), 'MMM d, yy') : 'No Date';
                        return (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.packageName} ({firstDate}) - ${booking.price.toFixed(2)}
                          </SelectItem>
                        )
                      })}
                       {availableBookingsForClient.length === 0 && <SelectItem value="no-booking" disabled>No active bookings for this client</SelectItem>}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Amount ($)</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="e.g., 100.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="datetime-local"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Methods</SelectLabel>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(val) => setPaymentStatus(val as PaymentStatus)}>
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Statuses</SelectLabel>
                    {PAYMENT_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-description">Description (Optional)</Label>
              <Textarea
                id="payment-description"
                placeholder="e.g., Deposit for wedding, Final payment"
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetRecordPaymentForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleRecordPaymentSubmit}>
              <Save className="mr-2 h-4 w-4" /> Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Client for Payment Dialog (Nested) */}
      <Dialog open={isAddNewClientDialogForPaymentOpen} onOpenChange={setIsAddNewClientDialogForPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="font-headline">Add New Client for Payment</DialogTitle>
                <DialogDescription>
                    Enter the new client's details. This client will be used for the payment record.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                    <Label htmlFor="new-client-payment-photo">Client Photo</Label>
                    <ImageUploadDropzone
                        onFileChange={handleClientPhotoChangeForPayment}
                        initialImageUrl={newClientForPaymentPhotoPreview || undefined}
                        className="h-32"
                        imageClassName="rounded-md"
                        label="Drop photo or click to upload"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-payment-name">Full Name</Label>
                    <Input
                        id="new-client-payment-name"
                        placeholder="e.g., Jane Smith"
                        value={newClientForPaymentName}
                        onChange={(e) => setNewClientForPaymentName(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-client-payment-email">Email (Optional)</Label>
                        <Input
                            id="new-client-payment-email"
                            type="email"
                            placeholder="e.g., jane.smith@example.com"
                            value={newClientForPaymentEmail}
                            onChange={(e) => setNewClientForPaymentEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-client-payment-phone">Phone (Optional)</Label>
                        <Input
                            id="new-client-payment-phone"
                            type="tel"
                            placeholder="e.g., 555-0202"
                            value={newClientForPaymentPhone}
                            onChange={(e) => setNewClientForPaymentPhone(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-payment-whatsapp">WhatsApp Number (Optional)</Label>
                    <Input
                        id="new-client-payment-whatsapp"
                        type="tel"
                        placeholder="e.g., +1 555-0102"
                        value={newClientForPaymentWhatsApp}
                        onChange={(e) => setNewClientForPaymentWhatsApp(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-payment-address">Address (Optional)</Label>
                    <Textarea
                        id="new-client-payment-address"
                        placeholder="e.g., 123 Main St, Anytown, USA"
                        value={newClientForPaymentAddress}
                        onChange={(e) => setNewClientForPaymentAddress(e.target.value)}
                        rows={2}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-payment-notes">Notes (Optional)</Label>
                    <Textarea
                        id="new-client-payment-notes"
                        placeholder="e.g., Prefers evening calls."
                        value={newClientForPaymentNotes}
                        onChange={(e) => setNewClientForPaymentNotes(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => { setIsAddNewClientDialogForPaymentOpen(false); resetNewClientForPaymentForm();}}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveNewClientForPayment}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Client
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

    