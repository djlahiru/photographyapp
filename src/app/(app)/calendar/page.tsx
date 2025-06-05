
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
import type { EventClickArg, EventSourceInput, EventInput } from '@fullcalendar/core';
import { initialMockBookings } from '@/app/(app)/bookings/page'; 
import type { BookingStatus } from '@/types';

// Removed direct CSS imports as they were causing module resolution issues.
// FullCalendar might inject some base styles, or rely on component-level styling.
// If styling issues persist, further investigation into CSS bundling might be needed.


const getEventClassNames = (status: BookingStatus): string[] => {
  let classNames = ['p-1', 'text-xs', 'rounded', 'border', 'cursor-pointer', 'hover:opacity-80'];
  // Using theme-based colors where possible
  switch (status) {
    case 'Pending':
      classNames.push('bg-accent', 'border-accent', 'text-accent-foreground');
      break;
    case 'Confirmed':
      classNames.push('bg-primary', 'border-primary', 'text-primary-foreground');
      break;
    case 'Completed':
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

// Sample Sri Lankan Holidays for 2024-2027 (demonstration)
const sriLankanHolidays: EventInput[] = [
  // 2024
  {
    title: 'Thaipongal Day',
    start: '2024-01-15',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'National Day',
    start: '2024-02-04',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Sinhala & Tamil New Year\'s Day',
    start: '2024-04-13',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Vesak Full Moon Poya Day',
    start: '2024-05-23',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  // 2025
  {
    title: 'Thaipongal Day',
    start: '2025-01-15',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'National Day',
    start: '2025-02-04',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Sinhala & Tamil New Year\'s Day',
    start: '2025-04-14', // Adjusted for 2025
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Vesak Full Moon Poya Day',
    start: '2025-05-12', // Adjusted for 2025
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Christmas Day',
    start: '2025-12-25',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  // 2026
  {
    title: 'National Day',
    start: '2026-02-04',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'May Day',
    start: '2026-05-01',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Vesak Full Moon Poya Day',
    start: '2026-05-31', // Adjusted for 2026
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Christmas Day',
    start: '2026-12-25',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  // 2027
   {
    title: 'National Day',
    start: '2027-02-04',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Sinhala & Tamil New Year\'s Day',
    start: '2027-04-14',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Vesak Full Moon Poya Day',
    start: '2027-05-20', // Adjusted for 2027
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
  {
    title: 'Christmas Day',
    start: '2027-12-25',
    allDay: true,
    backgroundColor: 'hsl(var(--muted))',
    borderColor: 'hsl(var(--border))',
    textColor: 'hsl(var(--muted-foreground))',
    classNames: ['opacity-80']
  },
];


export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = React.useState(true);

  const bookingEvents: EventSourceInput = initialMockBookings.map(booking => ({
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
    // Check if it's a holiday event (by checking if extendedProps are missing clientName, for this example)
    if (!clickInfo.event.extendedProps.clientName) { 
       alert(`Holiday: ${clickInfo.event.title}\nDate: ${clickInfo.event.start ? clickInfo.event.start.toLocaleDateString() : 'N/A'}`);
       return;
    }
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
            This calendar displays your bookings and Sri Lankan public holidays (sample). Use the toolbar to change views and navigate. Click an event for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[700px] rounded-md text-sm">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              events={[bookingEvents, sriLankanHolidays]} // Pass multiple event sources
              eventClick={handleEventClick}
              weekends={weekendsVisible}
              height="auto" 
              aspectRatio={1.8} 
              headerToolbar={{
                left: 'prevYear,prev,next,nextYear today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' 
              }}
              editable={false} 
              selectable={false} 
              dayMaxEvents={true} 
              slotDuration={'00:30:00'} 
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

