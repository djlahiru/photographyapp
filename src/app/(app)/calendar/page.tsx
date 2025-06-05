
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIconFeather } from "react-feather";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for eventClick
import listPlugin from '@fullcalendar/list'; // for list views
import type { EventClickArg, EventSourceInput } from '@fullcalendar/core';
import { mockBookings } from '@/app/(app)/bookings/page'; // Assuming mockBookings is exported
import type { BookingStatus } from '@/types';

// Import FullCalendar styles
// import '@fullcalendar/core/main.css'; 
// import '@fullcalendar/daygrid/main.css'; 
// import '@fullcalendar/list/main.css'; // Required for list views


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
            <p className="text-muted-foreground">Visualize your bookings. Events are color-coded by status. Includes diary view.</p>
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIconFeather className="mr-2 h-6 w-6 text-primary" />
            In-App Calendar
          </CardTitle>
          <CardDescription>
            This calendar displays your bookings. Use the toolbar to change views (e.g., month, week, day, list) and navigate years. Click an event for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[700px] rounded-md text-sm">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto" 
              aspectRatio={1.8} 
              headerToolbar={{
                left: 'prevYear,prev,next,nextYear today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek' 
              }}
              editable={false} 
              selectable={false} 
              dayMaxEvents={true} 
              eventTimeFormat={{ 
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              // Ensure list views have appropriate styling if needed
              // listDayFormat={{ month: 'long', day: 'numeric', year: 'numeric' }} // Example for list day format
              // listDaySideFormat={{ month: 'long', day: 'numeric', year: 'numeric' }} // Example
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
