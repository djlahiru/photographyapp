
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIconFeather, Eye, EyeOff } from "react-feather";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for eventClick
import listPlugin from '@fullcalendar/list'; 
import timeGridPlugin from '@fullcalendar/timegrid'; // for timeGrid views
import type { EventClickArg, EventSourceInput } from '@fullcalendar/core';
import { mockBookings } from '@/app/(app)/bookings/page'; 
import type { BookingStatus } from '@/types';

// Removed direct CSS imports as they were causing module resolution issues.
// FullCalendar might inject some base styles, or rely on component-level styling.
// If styling issues persist, further investigation into CSS bundling might be needed.


const getEventClassNames = (status: BookingStatus): string[] => {
  let classNames = ['p-1', 'text-xs', 'rounded', 'border', 'cursor-pointer', 'hover:opacity-80'];
  // Using theme-based colors where possible
  switch (status) {
    case 'Pending':
      // Using accent for pending. If accent color is not suitable, this could be changed.
      // The PRD mentions accent is Soft Orange, but globals.css has Violet. Following globals.css.
      classNames.push('bg-accent', 'border-accent', 'text-accent-foreground');
      break;
    case 'Confirmed':
      classNames.push('bg-primary', 'border-primary', 'text-primary-foreground');
      break;
    case 'Completed':
      // Green is often used for completed/success, but not a direct theme background color.
      // Using a specific green, ensuring text contrast.
      classNames.push('bg-green-500', 'border-green-600', 'text-white');
      break;
    case 'Cancelled':
      classNames.push('bg-destructive', 'border-destructive', 'text-destructive-foreground', 'line-through');
      break;
    default:
      classNames.push('bg-muted', 'border-border', 'text-muted-foreground');
  }
  return classNames;
};

export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = React.useState(true);

  const calendarEvents: EventSourceInput = mockBookings.map(booking => ({
    id: booking.id,
    title: `${booking.packageName} (${booking.clientName})`,
    start: booking.bookingDate,
    allDay: false, 
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

  const toggleWeekends = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Booking Calendar</h1>
            <p className="text-muted-foreground">Visualize your bookings. Events are color-coded by status. Includes timeGrid and expanded list views.</p>
        </div>
        <Button onClick={toggleWeekends} variant="outline">
          {weekendsVisible ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {weekendsVisible ? 'Hide Weekends' : 'Show Weekends'}
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIconFeather className="mr-2 h-6 w-6 text-primary" />
            In-App Calendar
          </CardTitle>
          <CardDescription>
            This calendar displays your bookings. Use the toolbar to change views and navigate. Click an event for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[700px] rounded-md text-sm">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={handleEventClick}
              weekends={weekendsVisible}
              height="auto" 
              aspectRatio={1.8} 
              headerToolbar={{
                left: 'prevYear,prev,next,nextYear today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,listDay,listMonth' 
              }}
              editable={false} 
              selectable={false} 
              dayMaxEvents={true} 
              slotDuration={'00:30:00'} // Example: sets time slots to 30 minutes for timeGrid views
              eventTimeFormat={{ 
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
