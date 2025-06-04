import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Booking Calendar</h1>
            <p className="text-muted-foreground">Visualize your bookings on a calendar. Events are color-coded by status.</p>
        </div>
        {/* Add any calendar specific actions here if needed */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" />
            In-App Calendar
          </CardTitle>
          <CardDescription>
            This calendar displays your bookings from the local database. Click on an event to view booking details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px] bg-muted/30 rounded-md flex items-center justify-center">
            <p className="text-lg text-muted-foreground">
              FullCalendar integration coming soon.
            </p>
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            This section will feature a fully interactive calendar powered by FullCalendar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
