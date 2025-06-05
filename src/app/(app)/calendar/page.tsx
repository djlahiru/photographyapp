
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIconFeather } from "react-feather";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for eventClick
import type { EventClickArg, EventSourceInput } from '@fullcalendar/core';
import { mockBookings } from '@/app/(app)/bookings/page'; // Assuming mockBookings is exported
import type { BookingStatus } from '@/types';

// Import FullCalendar styles
// import '@fullcalendar/core/main.css'; // This line was causing the "Module not found" error
// import '@fullcalendar/daygrid/main.css'; // This line was also causing a "Module not found" error


const getEventClassNames = (status: BookingStatus): string[] => {
  let classNames = ['p-1', 'text-xs', 'rounded', 'border', 'text-white', 'cursor-pointer', 'hover:opacity-80'];
  switch (status) {
    case 'Pending':
      classNames.push('bg-yellow-500', 'border-yellow-600');
      break;
    case 'Confirmed':
      classNames.push('bg-blue-500', 'border-blue-600');
      break;
    case 'Completed':
      classNames.push('bg-green-500', 'border-green-600');
      break;
    case 'Cancelled':
      classNames.push('bg-red-500', 'border-red-600', 'line-through');
      break;
    default:
      classNames.push('bg-gray-400', 'border-gray-500');
  }
  return classNames;
};

export default function CalendarPage() {
  const calendarEvents: EventSourceInput = mockBookings.map(booking => ({
    id: booking.id,
    title: `${booking.packageName} (${booking.clientName})`,
    start: booking.bookingDate,
    allDay: false, // Assuming bookings have specific times
    extendedProps: {
      clientName: booking.clientName,
      packageName: booking.packageName,
      status: booking.status,
      category: booking.category,
      price: booking.price
    },
    classNames: getEventClassNames(booking.status),
  }));

  const handleEventClick = (clickInfo: EventClickArg) => {
    // For now, just log the event details. Later, this could open a modal or navigate.
    console.log('Event clicked:', clickInfo.event);
    alert(
      `Booking Details:\n
      ID: ${clickInfo.event.id}\n
      Title: ${clickInfo.event.title}\n
      Status: ${clickInfo.event.extendedProps.status}\n
      Client: ${clickInfo.event.extendedProps.clientName}\n
      Date: ${clickInfo.event.start ? clickInfo.event.start.toLocaleString() : 'N/A'}`
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Booking Calendar</h1>
            <p className="text-muted-foreground">Visualize your bookings. Events are color-coded by status.</p>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIconFeather className="mr-2 h-6 w-6 text-primary" />
            In-App Calendar
          </CardTitle>
          <CardDescription>
            This calendar displays your bookings. Click on an event to view more details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[700px] rounded-md text-sm">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto" // Or a fixed pixel value like "700px"
              aspectRatio={1.8} // Adjust as needed
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay' // Add more views if needed
              }}
              editable={false} // Set to true for drag-and-drop, resizing
              selectable={false} // Set to true to allow selecting date ranges
              dayMaxEvents={true} // Or a number, e.g., 3, to limit events per day cell
              eventTimeFormat={{ // Optional: format time display on events
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
