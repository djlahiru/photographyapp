
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIconFeather, Eye, EyeOff } from "react-feather";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { EventClickArg, EventSourceInput, EventInput } from '@fullcalendar/core';
import type { BookingStatus, BookingDateTime } from '@/types';
import { mockBookingsData } from '@/lib/mock-data'; // Import from centralized mock data


const getEventClassNames = (status: BookingStatus): string[] => {
  let classNames = ['p-1', 'text-xs', 'rounded', 'border', 'cursor-pointer', 'hover:opacity-80'];
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

const sriLankanHolidays: EventInput[] = [
  // 2024
  { title: 'Thaipongal Day', start: '2024-01-15', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'National Day', start: '2024-02-04', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Sinhala & Tamil New Year\'s Day', start: '2024-04-13', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Vesak Full Moon Poya Day', start: '2024-05-23', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  // 2025
  { title: 'Thaipongal Day', start: '2025-01-15', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'National Day', start: '2025-02-04', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Sinhala & Tamil New Year\'s Day', start: '2025-04-14', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Vesak Full Moon Poya Day', start: '2025-05-12', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Christmas Day', start: '2025-12-25', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  // 2026
  { title: 'National Day', start: '2026-02-04', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'May Day', start: '2026-05-01', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Vesak Full Moon Poya Day', start: '2026-05-31', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Christmas Day', start: '2026-12-25', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  // 2027
   { title: 'National Day', start: '2027-02-04', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Sinhala & Tamil New Year\'s Day', start: '2027-04-14', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Vesak Full Moon Poya Day', start: '2027-05-20', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
  { title: 'Christmas Day', start: '2027-12-25', allDay: true, backgroundColor: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))', textColor: 'hsl(var(--muted-foreground))', classNames: ['opacity-80'] },
];


export default function CalendarPage() {
  const [weekendsVisible, setWeekendsVisible] = React.useState(true);

  // Use mockBookingsData directly for events. Re-evaluate if component state for bookings is needed later.
  const bookingEvents: EventSourceInput = mockBookingsData.flatMap(booking =>
    booking.bookingDates.map((bookingDateItem: BookingDateTime) => ({
      id: `${booking.id}_${bookingDateItem.id}`, 
      title: `${booking.packageName} (${booking.clientName})`,
      start: bookingDateItem.dateTime,
      allDay: false,
      extendedProps: {
        bookingId: booking.id, 
        clientName: booking.clientName,
        packageName: booking.packageName,
        status: booking.status,
        category: booking.category,
        price: booking.price
      },
      classNames: getEventClassNames(booking.status),
    }))
  );

  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Event clicked:', clickInfo.event);
    if (!clickInfo.event.extendedProps.clientName) { // Holiday event
       alert(`Holiday: ${clickInfo.event.title}\nDate: ${clickInfo.event.start ? clickInfo.event.start.toLocaleDateString() : 'N/A'}`);
       return;
    }
    alert(
      `Booking Details:\n
      Event ID: ${clickInfo.event.id}\n
      Booking ID: ${clickInfo.event.extendedProps.bookingId}\n
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
              events={[bookingEvents, sriLankanHolidays]} // Pass bookings events directly
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

