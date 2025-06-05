
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, BookOpen, Edit, Trash2, Filter, MoreVertical, Clock, Calendar as CalendarIcon, User, Tag, DollarSign, CheckCircle, Mail, FilePlus, XCircle, Search } from "react-feather";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import type { Booking, BookingStatus, Payment, PaymentStatus, BookingActivityLogEntry } from "@/types";
import { BookingActivityLog } from "@/components/bookings/booking-activity-log";
import React from "react";
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Mock data for bookings - Renamed to initialMockBookings and exported
export const initialMockBookings: Booking[] = [
  {
    id: "1",
    clientName: "Alice Wonderland",
    packageName: "Basic Portrait Session",
    bookingDate: "2024-08-15T14:00:00Z",
    category: "Portrait",
    status: "Confirmed" as BookingStatus,
    price: 150,
    payments: [
      { id: "p1a", bookingId: "1", amount: 75, paymentDate: "2024-08-02T11:30:00Z", method: "Credit Card", status: "Paid" as PaymentStatus, description: "Deposit" },
      { id: "p1b", bookingId: "1", amount: 75, paymentDate: "2024-08-14T10:00:00Z", method: "Credit Card", status: "Paid" as PaymentStatus, description: "Final Payment" }
    ],
    activityLog: [
      { id: "log1a", timestamp: "2024-08-01T10:00:00Z", action: "Booking created by Alice Wonderland.", actor: "Alice Wonderland", iconName: "PlusCircle" },
      { id: "log1b", timestamp: "2024-08-02T11:30:00Z", action: "Payment of $75 received (Deposit).", actor: "System", iconName: "DollarSign" },
      { id: "log1c", timestamp: "2024-08-03T14:15:00Z", action: "Booking status changed to Confirmed.", actor: "Admin", iconName: "CheckCircle" },
      { id: "log1d", timestamp: "2024-08-14T09:00:00Z", action: "Reminder email sent to client.", actor: "System", iconName: "Mail" },
      { id: "log1e", timestamp: "2024-08-14T10:00:00Z", action: "Final payment of $75 received.", actor: "System", iconName: "DollarSign" },
    ]
  },
  { 
    id: "2", 
    clientName: "Bob The Builder", 
    packageName: "Standard Wedding Package", 
    bookingDate: "2024-09-20T10:30:00Z", 
    category: "Wedding", 
    status: "Completed" as BookingStatus, 
    price: 2500,
    payments: [
      { id: "p2a", bookingId: "2", amount: 1000, paymentDate: "2024-07-10T10:00:00Z", method: "Bank Transfer", status: "Paid" as PaymentStatus, description: "Initial Deposit" },
      { id: "p2b", bookingId: "2", amount: 1500, paymentDate: "2024-09-15T14:00:00Z", method: "Bank Transfer", status: "Paid" as PaymentStatus, description: "Final Balance" }
    ],
    activityLog: [
        { id: "log2a", timestamp: "2024-07-01T10:00:00Z", action: "Booking created by Bob The Builder.", actor: "Bob The Builder", iconName: "PlusCircle" },
        { id: "log2b", timestamp: "2024-07-10T10:00:00Z", action: "Payment of $1000 received (Initial Deposit).", actor: "System", iconName: "DollarSign" },
        { id: "log2c", timestamp: "2024-09-15T14:00:00Z", action: "Final payment of $1500 received.", actor: "System", iconName: "DollarSign" },
        { id: "log2d", timestamp: "2024-09-21T10:00:00Z", action: "Booking status changed to Completed.", actor: "Admin", iconName: "CheckCircle" },
    ]
  },
  { 
    id: "3", 
    clientName: "Charlie Chaplin", 
    packageName: "Family Lifestyle Shoot", 
    bookingDate: "2024-07-30T16:00:00Z", 
    category: "Family", 
    status: "Pending" as BookingStatus, 
    price: 350,
    payments: [
      { id: "p3a", bookingId: "3", amount: 100, paymentDate: "2024-07-20T12:00:00Z", method: "PayPal", status: "Pending" as PaymentStatus, description: "Deposit" }
    ],
    activityLog: [
        { id: "log3a", timestamp: "2024-07-19T10:00:00Z", action: "Booking created.", actor: "Charlie Chaplin", iconName: "PlusCircle" },
        { id: "log3b", timestamp: "2024-07-20T12:00:00Z", action: "Deposit payment of $100 initiated.", actor: "System", iconName: "DollarSign" },
    ] 
  },
  {
    id: "4", 
    clientName: "Diana Prince", 
    packageName: "Basic Portrait Session", 
    bookingDate: "2024-08-05T09:00:00Z", 
    category: "Portrait", 
    status: "Cancelled" as BookingStatus, 
    price: 150,
    activityLog: [
       { id: "log4a", timestamp: "2024-07-20T10:00:00Z", action: "Booking requested.", actor: "Diana Prince", iconName: "FilePlus" },
       { id: "log4b", timestamp: "2024-07-28T16:00:00Z", action: "Booking cancelled by client.", actor: "Diana Prince", iconName: "XCircle" },
    ]
  },
];

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
  Completed: CheckCircle, // Using CheckCircle for Completed as well
  Cancelled: XCircle, // Changed from Trash2 for better semantic meaning of cancellation
};

// Export for calendar page (will show initial static data)
export const mockBookings = initialMockBookings;

export default function BookingsPage() {
  const [bookings, setBookings] = React.useState<Booking[]>(initialMockBookings);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatuses, setSelectedStatuses] = React.useState<BookingStatus[]>([]);
  const [selectedBookingForLog, setSelectedBookingForLog] = React.useState<Booking | null>(null);

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
    setBookings(prevBookings =>
      prevBookings.map(booking => {
        if (booking.id === bookingId) {
          const newLogEntry: BookingActivityLogEntry = {
            id: `log-${booking.id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: `Booking status changed to ${newStatus}.`,
            actor: "Admin", // Or current user if available
            iconName: statusIconMap[newStatus] === Clock ? 'Clock' :
                      statusIconMap[newStatus] === CheckCircle ? 'CheckCircle' :
                      statusIconMap[newStatus] === XCircle ? 'XCircle' : 'Edit',
          };
          return { 
            ...booking, 
            status: newStatus,
            activityLog: booking.activityLog ? [newLogEntry, ...booking.activityLog] : [newLogEntry]
          };
        }
        return booking;
      })
    );
    toast.success(`Booking status updated to ${newStatus}.`);
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
            <Button className="hidden sm:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule New
            </Button>
             <Button size="icon" className="sm:hidden">
              <PlusCircle className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => {
                const StatusIcon = statusIconMap[booking.status];
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
                                    <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit Booking</DropdownMenuItem>
                                    
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

                                    <DropdownMenuItem>Track Payment</DropdownMenuItem>
                                    {booking.activityLog && booking.activityLog.length > 0 && (
                                      <DropdownMenuItem onClick={() => setSelectedBookingForLog(booking)}>
                                          <Clock className="mr-2 h-4 w-4" /> View Activity Log
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Cancel Booking</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow space-y-3 text-sm">
                        <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{format(new Date(booking.bookingDate), "eee, MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        {booking.category && (
                            <div className="flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Category: {booking.category}</span>
                            </div>
                        )}
                        {booking.price && (
                             <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>Price: ${booking.price.toFixed(2)}</span>
                            </div>
                        )}
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
           {bookings.length === 0 && searchTerm.trim() === '' && selectedStatuses.length === 0 ? ( // Adjusted condition
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
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Schedule New Booking
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
    </div>
  );
}


    