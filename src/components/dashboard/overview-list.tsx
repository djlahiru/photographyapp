
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ElementType } from "react"; // Changed from LucideIcon
import { cn } from "@/lib/utils";

interface OverviewItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  fallbackText?: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  dataAiHint?: string;
}

interface OverviewListProps {
  title: string;
  items: OverviewItem[];
  icon: ElementType; // Changed from LucideIcon
  emptyMessage?: string;
  itemAction?: (item: OverviewItem) => React.ReactNode;
}

const statusColorMap = {
  success: "bg-green-500 hover:bg-green-600",
  warning: "bg-yellow-500 hover:bg-yellow-600",
  default: "bg-primary hover:bg-primary/90",
  secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
  destructive: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
  outline: "text-foreground border-border",
};


export function OverviewList({ title, items, icon: Icon, emptyMessage = "No items to display.", itemAction }: OverviewListProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground font-headline">{title}</CardTitle>
        <Icon className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4 pr-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-md border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {item.imageUrl && (
                       <Avatar className="h-10 w-10">
                        <AvatarImage src={item.imageUrl} alt={item.title} data-ai-hint={item.dataAiHint || "list item"} />
                        <AvatarFallback>{item.fallbackText || item.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="text-sm font-medium leading-none text-foreground">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.status && (
                       <Badge variant={item.statusVariant || "default"} className={cn(item.statusVariant && statusColorMap[item.statusVariant])}>
                        {item.status}
                      </Badge>
                    )}
                    {itemAction && itemAction(item)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
