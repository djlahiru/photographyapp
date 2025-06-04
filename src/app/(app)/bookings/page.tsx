
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Edit, Trash2, Filter, MoreVertical, History, CalendarDays, User, Tag, DollarSign, CheckCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Booking, BookingStatus } from "@/types";
import { BookingActivityLog } from "@/components/bookings/booking-activity-log";
import React from "react";
import { format } from 'date-fns';

// Mock data for bookings
const mockBookings: Booking[] = [
  { 
    id: "1", 
    clientName: "Alice Wonderland", 
    packageName: "Basic Portrait Session", 
    bookingDate: "2024-08-15T14:00:00Z", 
    category: "Portrait", 
    status: "Confirmed" as BookingStatus,
    price: 150,
    activityLog: [
      { id: "log1a", timestamp: "2024-08-01T10:00:00Z", action: "Booking created by Alice Wonderland.", actor: "Alice Wonderland", iconName: "PlusCircle" },
      { id: "log1b", timestamp: "2024-08-02T11:30:00Z", action: "Payment of $75 received (Deposit).", actor: "System", iconName: "DollarSign" },
      { id: "log1c", timestamp: "2024-08-03T14:15:00Z", action: "Booking status changed to Confirmed.", actor: "Admin", iconName: "CheckCircle" },
      { id: "log1d", timestamp: "2024-08-14T09:00:00Z", action: "Reminder email sent to client.", actor: "System", iconName: "Mail" },
    ]
  },
  { id: "2", clientName: "Bob The Builder", packageName: "Standard Wedding Package", bookingDate: "2024-09-20T10:30:00Z", category: "Wedding", status: "Completed" as BookingStatus, price: 2500 },
  { id: "3", clientName: "Charlie Chaplin", packageName: "Family Lifestyle Shoot", bookingDate: "2024-07-30T16:00:00Z", category: "Family", status: "Pending" as BookingStatus, price: 350 },
  { id: "4", clientName: "Diana Prince", packageName: "Basic Portrait Session", bookingDate: "2024-08-05T09:00:00Z", category: "Portrait", status: "Cancelled" as BookingStatus, price: 150,
    activityLog: [
       { id: "log4a", timestamp: "2024-07-20T10:00:00Z", action: "Booking requested.", actor: "Diana Prince", iconName: "FilePlus" },
       { id: "log4b", timestamp: "2024-07-28T16:00:00Z", action: "Booking cancelled by client.", actor: "Diana Prince", iconName: "XCircle" },
    ]
  },
];

const statusVariantMap: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Pending: "warning",
  Confirmed: "default",
  Completed: "success",
  Cancelled: "destructive",
};

const statusIconMap: Record<BookingStatus, React.ElementType> = {
  Pending: History,
  Confirmed: CheckCircle,
  Completed: CheckCircle,
  Cancelled: Trash2,
};

export default function BookingsPage() {
  // Placeholder for status filter state
  // const [selectedStatuses, setSelectedStatuses] = React.useState<BookingStatus[]>([]);

  const [selectedBookingForLog, setSelectedBookingForLog] = React.useState<Booking | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Bookings Management</h1>
            <p className="text-muted-foreground">Schedule, view, and manage client bookings.</p>
        </div>
        <div className="flex gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filter by Status
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(["Pending", "Confirmed", "Completed", "Cancelled"] as BookingStatus[]).map((status) => (
                <DropdownMenuCheckboxItem
                    key={status}
                    // checked={selectedStatuses.includes(status)}
                    // onCheckedChange={(checked) => {
                    //   setSelectedStatuses(prev => checked ? [...prev, status] : prev.filter(s => s !== status))
                    // }}
                >
                    {status}
                </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Booking
            </Button>
        </div>
      </div>

      {mockBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockBookings.map((booking) => {
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
                                    <DropdownMenuItem>Update Status</DropdownMenuItem>
                                    <DropdownMenuItem>Track Payment</DropdownMenuItem>
                                    {booking.activityLog && booking.activityLog.length > 0 && (
                                      <DropdownMenuItem onClick={() => setSelectedBookingForLog(booking)}>
                                          <History className="mr-2 h-4 w-4" /> View Activity Log
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
                            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
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
          <h3 className="text-2xl font-semibold mb-3 font-headline">No Bookings Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">You haven&apos;t scheduled any bookings. Click the button below to create your first one.</p>
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Schedule New Booking
          </Button>
        </div>
      )}

      {selectedBookingForLog && selectedBookingForLog.activityLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center" onClick={() => setSelectedBookingForLog(null)}>
            <div className="max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
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
