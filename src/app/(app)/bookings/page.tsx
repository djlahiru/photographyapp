
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Edit, Trash2, Filter, MoreVertical, History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Booking, BookingStatus } from "@/types";
import { BookingActivityLog } from "@/components/bookings/booking-activity-log";
import React from "react";

// Mock data for bookings
const mockBookings: Booking[] = [
  { 
    id: "1", 
    clientName: "Alice Wonderland", 
    packageName: "Basic Portrait Session", 
    bookingDate: "2024-08-15", 
    category: "Portrait", 
    status: "Confirmed" as BookingStatus,
    activityLog: [
      { id: "log1a", timestamp: "2024-08-01T10:00:00Z", action: "Booking created by Alice Wonderland.", actor: "Alice Wonderland", iconName: "PlusCircle" },
      { id: "log1b", timestamp: "2024-08-02T11:30:00Z", action: "Payment of $75 received (Deposit).", actor: "System", iconName: "DollarSign" },
      { id: "log1c", timestamp: "2024-08-03T14:15:00Z", action: "Booking status changed to Confirmed.", actor: "Admin", iconName: "CheckCircle" },
      { id: "log1d", timestamp: "2024-08-14T09:00:00Z", action: "Reminder email sent to client.", actor: "System", iconName: "Mail" },
    ]
  },
  { id: "2", clientName: "Bob The Builder", packageName: "Standard Wedding Package", bookingDate: "2024-09-20", category: "Wedding", status: "Completed" as BookingStatus },
  { id: "3", clientName: "Charlie Chaplin", packageName: "Family Lifestyle Shoot", bookingDate: "2024-07-30", category: "Family", status: "Pending" as BookingStatus },
  { id: "4", clientName: "Diana Prince", packageName: "Basic Portrait Session", bookingDate: "2024-08-05", category: "Portrait", status: "Cancelled" as BookingStatus,
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

export default function BookingsPage() {
  // Placeholder for status filter state
  // const [selectedStatuses, setSelectedStatuses] = React.useState<BookingStatus[]>([]);

  const firstBookingWithLog = mockBookings.find(b => b.activityLog && b.activityLog.length > 0);

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

      <Card>
        <CardHeader>
            <CardTitle>Booking List</CardTitle>
            <CardDescription>Overview of all client bookings.</CardDescription>
        </CardHeader>
        <CardContent>
            {mockBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Package</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.clientName}</TableCell>
                    <TableCell className="hidden md:table-cell">{booking.packageName}</TableCell>
                    <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">{booking.category}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[booking.status]}>{booking.status}</Badge>
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
                           <DropdownMenuItem>Update Status</DropdownMenuItem>
                           <DropdownMenuItem>Track Payment</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" />Cancel Booking</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
             <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
              <p className="text-muted-foreground mb-4">Start by scheduling your first client booking.</p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Booking
              </Button>
            </div>
            )}
        </CardContent>
      </Card>

      {firstBookingWithLog && firstBookingWithLog.activityLog && (
        <BookingActivityLog 
            logs={firstBookingWithLog.activityLog} 
            title={`Activity Log for ${firstBookingWithLog.clientName}'s Booking`}
            description={`Timeline of events for booking ID: ${firstBookingWithLog.id}`}
        />
      )}
    </div>
  );
}

