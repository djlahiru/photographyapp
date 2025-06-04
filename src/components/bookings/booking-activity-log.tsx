
'use client';

import type { BookingActivityLogEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { format } from 'date-fns';

interface BookingActivityLogProps {
  logs: BookingActivityLogEntry[];
  title?: string;
  description?: string;
}

// A helper to get the icon component by name
const getIcon = (iconName?: keyof typeof LucideIcons.icons) => {
  if (!iconName || !LucideIcons[iconName]) {
    return <LucideIcons.History className="h-5 w-5 text-muted-foreground" />;
  }
  const IconComponent = LucideIcons[iconName] as LucideIcons.LucideIcon;
  return <IconComponent className="h-5 w-5 text-primary" />;
};

export function BookingActivityLog({
  logs,
  title = "Activity Log",
  description = "Timeline of events for this booking."
}: BookingActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <LucideIcons.ClipboardList className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No activity recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-6 relative pl-4">
            {/* Vertical line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border ml-[9px]"></div>

            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 relative">
                <div className="absolute left-0 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-card ring-4 ring-card">
                   {getIcon(log.iconName)}
                </div>
                <div className="ml-10 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    {log.actor && ` by ${log.actor}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
