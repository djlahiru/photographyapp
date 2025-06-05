
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select";
import { PlusCircle, BookOpen, Edit, Trash2, Filter, MoreVertical, Clock, Calendar as CalendarIconFeather, User, Tag, DollarSign, CheckCircle, Mail, FilePlus, XCircle, Search, TrendingUp, TrendingDown, CreditCard, Save, UserPlus, Plus, Trash, FileText } from "react-feather";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import type { Booking, BookingStatus, Payment, PaymentStatus, BookingActivityLogEntry, Client, BookingDateTime } from "@/types";
import { BookingActivityLog } from "@/components/bookings/booking-activity-log";
import React from "react";
import { format, parseISO, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { Textarea } from '@/components/ui/textarea';
import { mockBookingsData, mockClientsData, mockPackagesData } from '@/lib/mock-data';


const ALL_STATUSES: BookingStatus[] = ["Pending", "Confirmed", "Completed", "Cancelled"];

const statusVariantMap: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Pending: "warning",
  Confirmed: "default",
  Completed: "success",
  Cancelled: "destructive",
};

const statusIconMap: Record<BookingStatus, React.ElementType> = {
  Pending: Clock,
  Confirmed: CheckCircle,
  Completed: CheckCircle,
  Cancelled: XCircle,
};


export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>(mockBookingsData);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<BookingStatus[]>([]);
  const [selectedBookingForLog, setSelectedBookingForLog] = React.useState<Booking | null>(null);

  const [isAddBookingDialogOpen, setIsAddBookingDialogOpen] = React.useState(false);
  const [isEditBookingDialogOpen, setIsEditBookingDialogOpen] = React.useState(false);
  const [editingBookingId, setEditingBookingId] = React.useState<string | null>(null);

  const [bookingClientName, setBookingClientName] = React.useState('');
  const [bookingPackageId, setBookingPackageId] = React.useState<string | undefined>(undefined);
  const [dialogBookingDates, setDialogBookingDates] = React.useState<BookingDateTime[]>([{ id: 'dt_new_' + Date.now(), dateTime: '', note: '' }]);
  const [bookingCategory, setBookingCategory] = React.useState('');
  
  const [suggestedClients, setSuggestedClients] = React.useState<Client[]>([]);
  const [isClientSuggestionsOpen, setIsClientSuggestionsOpen] = React.useState(false);


  // State for "Add New Client for Booking" dialog
  const [isAddNewClientDialogForBookingOpen, setIsAddNewClientDialogForBookingOpen] = React.useState(false);
  const [newClientForBookingName, setNewClientForBookingName] = React.useState('');
  const [newClientForBookingEmail, setNewClientForBookingEmail] = React.useState('');
  const [newClientForBookingPhone, setNewClientForBookingPhone] = React.useState('');
  const [newClientForBookingWhatsApp, setNewClientForBookingWhatsApp] = React.useState('');
  const [newClientForBookingAddress, setNewClientForBookingAddress] = React.useState('');
  const [newClientForBookingNotes, setNewClientForBookingNotes] = React.useState('');
  const [newClientForBookingPhotoFile, setNewClientForBookingPhotoFile] = React.useState<File | null>(null);
  const [newClientForBookingPhotoPreview, setNewClientForBookingPhotoPreview] = React.useState<string | null>(null);


  const filteredBookings = React.useMemo(() => {
    return bookings.filter(booking => {
      const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(booking.status);
      const searchMatch = searchTerm.trim() === '' ||
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.category && booking.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return statusMatch && searchMatch;
    });
  }, [bookings, searchTerm, selectedStatuses]);

  const handleStatusUpdate = (bookingId: string, newStatus: BookingStatus) => {
    const bookingIndex = mockBookingsData.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
        const newLogEntry: BookingActivityLogEntry = {
            id: `log-${bookingId}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: `Booking status changed to ${newStatus}.`,
            actor: "Admin",
            iconName: statusIconMap[newStatus] === Clock ? 'Clock' :
                      statusIconMap[newStatus] === CheckCircle ? 'CheckCircle' :
                      statusIconMap[newStatus] === XCircle ? 'XCircle' : 'Edit',
        };
        mockBookingsData[bookingIndex] = {
            ...mockBookingsData[bookingIndex],
            status: newStatus,
            activityLog: mockBookingsData[bookingIndex].activityLog ? [newLogEntry, ...mockBookingsData[bookingIndex].activityLog!] : [newLogEntry]
        };
    }
    setBookings([...mockBookingsData]);
    toast.success(`Booking status updated to ${newStatus}.`);
  };

  const resetBookingForm = () => {
    setBookingClientName('');
    setBookingPackageId(undefined);
    setDialogBookingDates([{ id: 'dt_reset_' + Date.now(), dateTime: '', note: '' }]);
    setBookingCategory('');
    setEditingBookingId(null);
    setSuggestedClients([]);
    setIsClientSuggestionsOpen(false);
  };

  const resetNewClientForBookingForm = () => {
    setNewClientForBookingName('');
    setNewClientForBookingEmail('');
    setNewClientForBookingPhone('');
    setNewClientForBookingWhatsApp('');
    setNewClientForBookingAddress('');
    setNewClientForBookingNotes('');
    setNewClientForBookingPhotoFile(null);
    setNewClientForBookingPhotoPreview(null);
  };
  
  const handleClientNameChange = (name: string) => {
    setBookingClientName(name);
    if (name.trim() === '') {
      setSuggestedClients([]);
      setIsClientSuggestionsOpen(false);
      return;
    }
    const matches = mockClientsData.filter(client => 
      client.name.toLowerCase().includes(name.toLowerCase())
    );
    setSuggestedClients(matches);
    setIsClientSuggestionsOpen(matches.length > 0);
  };

  const handleClientPhotoChangeForBooking = (file: File | null) => {
    setNewClientForBookingPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewClientForBookingPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setNewClientForBookingPhotoPreview(null);
    }
  };

  const handleAddBookingDate = () => {
    setDialogBookingDates(prev => [...prev, { id: 'dt_add_' + Date.now(), dateTime: '', note: '' }]);
  };

  const handleRemoveBookingDate = (idToRemove: string) => {
    if (dialogBookingDates.length <= 1) {
      toast.error("A booking must have at least one date and time.");
      return;
    }
    setDialogBookingDates(prev => prev.filter(dt => dt.id !== idToRemove));
  };

  const handleBookingDateChange = (idToChange: string, newDateTime: string) => {
    setDialogBookingDates(prev => prev.map(dt => dt.id === idToChange ? { ...dt, dateTime: newDateTime } : dt));
  };

  const handleBookingDateNoteChange = (idToChange: string, newNote: string) => {
    setDialogBookingDates(prev => prev.map(dt => dt.id === idToChange ? { ...dt, note: newNote } : dt));
  };

  const handleOpenAddBookingDialog = () => {
    resetBookingForm();
    setIsAddBookingDialogOpen(true);
  };

  const handleOpenEditBookingDialog = (booking: Booking) => {
    resetBookingForm();
    setEditingBookingId(booking.id);
    setBookingClientName(booking.clientName);
    setBookingPackageId(booking.packageId);
    const formattedDates = booking.bookingDates.map(bd => ({
        ...bd,
        dateTime: bd.dateTime && isValid(parseISO(bd.dateTime)) ? format(parseISO(bd.dateTime), "yyyy-MM-dd'T'HH:mm") : '',
        note: bd.note || ''
    }));
    setDialogBookingDates(formattedDates.length > 0 ? formattedDates : [{ id: 'dt_edit_empty_' + Date.now(), dateTime: '', note: '' }]);
    setBookingCategory(booking.category || '');
    setIsEditBookingDialogOpen(true);
    setSuggestedClients([]);
    setIsClientSuggestionsOpen(false);
  };

  const handleSaveNewClientForBooking = () => {
    if (!newClientForBookingName.trim()) {
      toast.error("Client Name is required for the new client.");
      return;
    }

    const existingClient = mockClientsData.find(c => c.name.toLowerCase() === newClientForBookingName.trim().toLowerCase());
    if (existingClient) {
        toast.warn(`Client "${newClientForBookingName.trim()}" already exists. Selecting existing client.`);
        setBookingClientName(existingClient.name);
    } else {
        const newClientToAdd: Client = {
            id: `client-${Date.now()}`,
            name: newClientForBookingName.trim(),
            contactDetails: {
                email: newClientForBookingEmail.trim() || undefined,
                phone: newClientForBookingPhone.trim() || undefined,
                whatsapp: newClientForBookingWhatsApp.trim() || undefined,
            },
            address: newClientForBookingAddress.trim() || undefined,
            notes: newClientForBookingNotes.trim() || undefined,
            avatarUrl: newClientForBookingPhotoPreview || `https://placehold.co/80x80.png?text=${newClientForBookingName.trim().split(' ').map(n=>n[0]).join('').toUpperCase()}`,
            dataAiHint: newClientForBookingPhotoPreview ? "person client custom" : "person client",
            totalPayments: 0,
            outstandingBalance: 0,
            totalBookings: 0,
        };
        mockClientsData.unshift(newClientToAdd); 
        setBookingClientName(newClientToAdd.name);
        toast.success(`New client "${newClientToAdd.name}" added and selected for this booking.`);
    }
    
    setIsAddNewClientDialogForBookingOpen(false);
    resetNewClientForBookingForm();
    setSuggestedClients([]);
    setIsClientSuggestionsOpen(false);
  };


  const handleSaveBooking = () => {
    if (!bookingClientName.trim() || !bookingPackageId || dialogBookingDates.some(dt => !dt.dateTime.trim())) {
      toast.error("Client Name, Package, and at least one valid Booking Date & Time are required.");
      return;
    }

    const selectedPackage = mockPackagesData.find(p => p.id === bookingPackageId); 
    if (!selectedPackage) {
      toast.error("Selected package not found.");
      return;
    }

    const validBookingDates = dialogBookingDates
        .filter(dt => dt.dateTime.trim() !== '')
        .map(dt => ({ 
            ...dt, 
            dateTime: new Date(dt.dateTime).toISOString(),
            note: dt.note?.trim() || undefined 
        }));

    if (validBookingDates.length === 0) {
        toast.error("Please provide at least one valid booking date and time.");
        return;
    }

    const bookingData = {
      clientName: bookingClientName.trim(),
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      bookingDates: validBookingDates,
      category: bookingCategory.trim() || undefined,
      price: selectedPackage.price,
    };

    if (isEditBookingDialogOpen && editingBookingId) {
        const bookingIndex = mockBookingsData.findIndex(b => b.id === editingBookingId);
        if (bookingIndex !== -1) {
            const newLogEntry: BookingActivityLogEntry = {
              id: `log-edit-${editingBookingId}-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: `Booking details updated.`,
              actor: "Admin",
              iconName: "Edit",
            };
            mockBookingsData[bookingIndex] = {
              ...mockBookingsData[bookingIndex],
              ...bookingData,
              activityLog: mockBookingsData[bookingIndex].activityLog ? [newLogEntry, ...mockBookingsData[bookingIndex].activityLog!] : [newLogEntry],
            };
        }
      setBookings([...mockBookingsData]);
      toast.success(`Booking for ${bookingData.clientName} updated!`);
      setIsEditBookingDialogOpen(false);
    } else {
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        ...bookingData,
        status: "Pending" as BookingStatus,
        payments: [],
        activityLog: [
          {
            id: `log-new-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: `Booking created for ${selectedPackage.name}.`,
            actor: "Admin",
            iconName: "PlusCircle",
          },
        ],
      };
      mockBookingsData.unshift(newBooking); 
      setBookings([...mockBookingsData]); 
      toast.success(`Booking for ${newBooking.clientName} with ${newBooking.packageName} scheduled!`);
      setIsAddBookingDialogOpen(false);
    }
    resetBookingForm();
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Bookings Management</h1>
            <p className="text-muted-foreground">Schedule, view, and manage client bookings.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-grow md:flex-grow-0">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search bookings..."
                className="pl-8 w-full md:w-[200px] lg:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter by Status
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ALL_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={(checked) => {
                      setSelectedStatuses(prev => checked ? [...prev, status] : prev.filter(s => s !== status))
                    }}
                >
                    {status}
                </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
            <Button className="hidden sm:inline-flex" onClick={handleOpenAddBookingDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule Booking
            </Button>
             <Button size="icon" className="sm:hidden" onClick={handleOpenAddBookingDialog} title="Schedule Booking">
              <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
                const StatusIcon = statusIconMap[booking.status];
                const totalPaid = booking.payments?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
                const remainingAmount = booking.price - totalPaid;
                const firstBookingDateEntry = booking.bookingDates && booking.bookingDates.length > 0 ? booking.bookingDates[0] : null;
                const firstBookingDate = firstBookingDateEntry && firstBookingDateEntry.dateTime ? parseISO(firstBookingDateEntry.dateTime) : null;

                return (
                <Card key={booking.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg font-semibold font-headline leading-tight">{booking.packageName}</CardTitle>
                                <CardDescription className="text-xs">Client: {booking.clientName}</CardDescription>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenEditBookingDialog(booking)}>
                                        <Edit className="mr-2 h-4 w-4" />Edit Booking
                                    </DropdownMenuItem>

                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Update Status
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                          {ALL_STATUSES.map((statusOption) => (
                                            <DropdownMenuItem
                                              key={statusOption}
                                              onClick={() => handleStatusUpdate(booking.id, statusOption)}
                                              disabled={booking.status === statusOption}
                                            >
                                              {statusIconMap[statusOption] && React.createElement(statusIconMap[statusOption], { className: "mr-2 h-4 w-4" })}
                                              {statusOption}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuPortal>
                                    </DropdownMenuSub>

                                    <DropdownMenuItem onClick={() => toast.info(`Track payment for booking ${booking.id} - coming soon!`)}>
                                      <DollarSign className="mr-2 h-4 w-4" />Track Payment
                                    </DropdownMenuItem>
                                    {booking.activityLog && booking.activityLog.length > 0 && (
                                      <DropdownMenuItem onClick={() => setSelectedBookingForLog(booking)}>
                                          <Clock className="mr-2 h-4 w-4" /> View Activity Log
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                      onClick={() => handleStatusUpdate(booking.id, "Cancelled" as BookingStatus)}
                                      disabled={booking.status === "Cancelled"}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />Cancel Booking
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow space-y-3 text-sm">
                        <div className="space-y-1">
                            <div className="flex items-center">
                                <CalendarIconFeather className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                                {firstBookingDate && isValid(firstBookingDate) ? (
                                    <div className="flex-grow">
                                        <span>{format(firstBookingDate, "eee, MMM d, yyyy 'at' h:mm a")}</span>
                                        {booking.bookingDates.length > 1 && <span className="ml-1 text-xs text-muted-foreground">(+{booking.bookingDates.length -1} more)</span>}
                                    </div>
                                ) : (
                                    <span className="flex-grow">No date set</span>
                                )}
                            </div>
                            {firstBookingDateEntry?.note && (
                                <div className="flex items-start pl-6">
                                    <FileText className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <p className="text-xs text-muted-foreground italic leading-tight">{firstBookingDateEntry.note}</p>
                                </div>
                            )}
                        </div>
                        {booking.category && (
                            <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Category: {booking.category}</span>
                            </div>
                        )}
                        <div className="space-y-1 pt-2 border-t border-border/50">
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Total Price: ${booking.price.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center text-green-600 dark:text-green-400">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                <span>Paid: ${totalPaid.toFixed(2)}</span>
                            </div>
                            <div className={`flex items-center ${remainingAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'}`}>
                                {remainingAmount > 0 ? <TrendingDown className="h-4 w-4 mr-2" /> : <CreditCard className="h-4 w-4 mr-2"/>}
                                <span>Remaining: ${remainingAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                         <Badge variant={statusVariantMap[booking.status]} className="w-full justify-center py-1.5 text-xs">
                            <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                            {booking.status}
                        </Badge>
                    </CardFooter>
                </Card>
            )})}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed">
          <BookOpen className="h-20 w-20 text-muted-foreground mb-6" />
           {bookings.length === 0 && searchTerm.trim() === '' && selectedStatuses.length === 0 ? (
            <>
              <h3 className="text-2xl font-semibold mb-3 font-headline">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">You haven&apos;t scheduled any bookings. Click the button to create your first one.</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-semibold mb-3 font-headline">No Bookings Found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">No bookings match your current search or filter criteria. Try adjusting your search or filters.</p>
            </>
          )}
          <Button size="lg" onClick={handleOpenAddBookingDialog}>
            <PlusCircle className="mr-2 h-5 w-5" /> Schedule Booking
          </Button>
        </div>
      )}

      {selectedBookingForLog && selectedBookingForLog.activityLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={() => setSelectedBookingForLog(null)}>
            <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <BookingActivityLog
                    logs={selectedBookingForLog.activityLog}
                    title={`Activity Log for ${selectedBookingForLog.clientName}'s Booking`}
                    description={`Timeline of events for booking ID: ${selectedBookingForLog.id}. Click outside to close.`}
                />
            </div>
        </div>
      )}

      <Dialog open={isAddBookingDialogOpen || isEditBookingDialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setIsAddBookingDialogOpen(false);
          setIsEditBookingDialogOpen(false);
          resetBookingForm();
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{isEditBookingDialogOpen ? "Edit Booking" : "Schedule Booking"}</DialogTitle>
            <DialogDescription>
              {isEditBookingDialogOpen ? "Update the booking details below." : "Fill in the details below to create a new booking."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Added max-height and overflow */}
            <div className="relative grid gap-2">
              <Label htmlFor="booking-client-name">Client Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="booking-client-name"
                  placeholder="Search clients or enter new name..."
                  value={bookingClientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  onFocus={() => {
                     if (bookingClientName.trim()) {
                       const matches = mockClientsData.filter(client => 
                         client.name.toLowerCase().includes(bookingClientName.toLowerCase())
                       );
                       setSuggestedClients(matches);
                       setIsClientSuggestionsOpen(matches.length > 0);
                     }
                   }}
                   onBlur={() => setTimeout(() => setIsClientSuggestionsOpen(false), 150)} 
                  autoComplete="off"
                  className="flex-grow"
                />
                <Button variant="outline" size="sm" onClick={() => { resetNewClientForBookingForm(); setIsAddNewClientDialogForBookingOpen(true); setIsClientSuggestionsOpen(false); }}>
                    <UserPlus className="mr-1 h-4 w-4" /> Add New
                </Button>
              </div>
              {isClientSuggestionsOpen && suggestedClients.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
                  {suggestedClients.map(client => (
                    <div
                      key={client.id}
                      className="p-2 hover:bg-accent cursor-pointer text-sm"
                      onMouseDown={() => { 
                        setBookingClientName(client.name);
                        setIsClientSuggestionsOpen(false);
                        setSuggestedClients([]);
                      }}
                    >
                      {client.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="booking-package">Photography Package</Label>
              <Select value={bookingPackageId} onValueChange={setBookingPackageId}>
                <SelectTrigger id="booking-package">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Packages</SelectLabel>
                    {mockPackagesData.map((pkg) => ( 
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} (${pkg.price.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
                <Label>Booking Dates & Times</Label>
                {dialogBookingDates.map((dt, index) => (
                    <div key={dt.id} className="space-y-2 p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Input
                                type="datetime-local"
                                value={dt.dateTime}
                                onChange={(e) => handleBookingDateChange(dt.id, e.target.value)}
                                className="flex-grow bg-background"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveBookingDate(dt.id)}
                                disabled={dialogBookingDates.length <= 1}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Remove date/time"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input
                            type="text"
                            placeholder="Short note for this session (optional)"
                            value={dt.note || ''}
                            onChange={(e) => handleBookingDateNoteChange(dt.id, e.target.value)}
                            className="text-sm bg-background"
                        />
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddBookingDate} className="mt-1">
                    <Plus className="mr-1 h-4 w-4" /> Add Another Date/Time
                </Button>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="booking-category">Category (Optional)</Label>
              <Input
                id="booking-category"
                placeholder="e.g., Wedding, Portrait, Event"
                value={bookingCategory}
                onChange={(e) => setBookingCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetBookingForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveBooking}>
              <Save className="mr-2 h-4 w-4" /> {isEditBookingDialogOpen ? "Save Changes" : "Save Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNewClientDialogForBookingOpen} onOpenChange={setIsAddNewClientDialogForBookingOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="font-headline">Add New Client for Booking</DialogTitle>
                <DialogDescription>
                    Enter the new client's details. This client will be associated with the current booking.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid gap-2">
                    <Label htmlFor="new-client-booking-photo">Client Photo</Label>
                    <ImageUploadDropzone
                        onFileChange={handleClientPhotoChangeForBooking}
                        initialImageUrl={newClientForBookingPhotoPreview || undefined}
                        className="h-32"
                        imageClassName="rounded-md"
                        label="Drop photo or click to upload"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-booking-name">Full Name</Label>
                    <Input
                        id="new-client-booking-name"
                        placeholder="e.g., Jane Smith"
                        value={newClientForBookingName}
                        onChange={(e) => setNewClientForBookingName(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-client-booking-email">Email (Optional)</Label>
                        <Input
                            id="new-client-booking-email"
                            type="email"
                            placeholder="e.g., jane.smith@example.com"
                            value={newClientForBookingEmail}
                            onChange={(e) => setNewClientForBookingEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-client-booking-phone">Phone (Optional)</Label>
                        <Input
                            id="new-client-booking-phone"
                            type="tel"
                            placeholder="e.g., 555-0202"
                            value={newClientForBookingPhone}
                            onChange={(e) => setNewClientForBookingPhone(e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-booking-whatsapp">WhatsApp Number (Optional)</Label>
                    <Input
                        id="new-client-booking-whatsapp"
                        type="tel"
                        placeholder="e.g., +1 555-0102"
                        value={newClientForBookingWhatsApp}
                        onChange={(e) => setNewClientForBookingWhatsApp(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-booking-address">Address (Optional)</Label>
                    <Textarea
                        id="new-client-booking-address"
                        placeholder="e.g., 123 Main St, Anytown, USA"
                        value={newClientForBookingAddress}
                        onChange={(e) => setNewClientForBookingAddress(e.target.value)}
                        rows={2}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="new-client-booking-notes">Notes (Optional)</Label>
                    <Textarea
                        id="new-client-booking-notes"
                        placeholder="e.g., Prefers evening calls, interested in family portraits."
                        value={newClientForBookingNotes}
                        onChange={(e) => setNewClientForBookingNotes(e.target.value)}
                        rows={3}
                    />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => { setIsAddNewClientDialogForBookingOpen(false); resetNewClientForBookingForm();}}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveNewClientForBooking}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add Client to Booking
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
