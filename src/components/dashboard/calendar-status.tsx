
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Link as LinkIconFeather } from "react-feather";

export function CalendarStatus() {
  // Placeholder status
  const isConnected = true; //Math.random() > 0.5;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground font-headline">Google Calendar Sync</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {isConnected ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-foreground">Successfully connected to Google Calendar.</p>
            <Button variant="outline">Manage Connection</Button>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-destructive" />
            <p className="text-foreground">Not connected to Google Calendar.</p>
            <Button>
              <LinkIconFeather className="mr-2 h-4 w-4" /> Connect Calendar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
