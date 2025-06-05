
import { SummaryStats } from "@/components/dashboard/summary-stats";
import { OverviewList } from "@/components/dashboard/overview-list";
import { CalendarStatus } from "@/components/dashboard/calendar-status";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { RevenueGoalChart } from "@/components/dashboard/revenue-goal-chart";
import { ProjectStatusProgress } from "@/components/dashboard/project-status-progress";
import { WorkProgressTracker } from "@/components/dashboard/work-progress-tracker";
import { DashboardCoverPhotoDisplay } from "@/components/dashboard/dashboard-cover-photo-display"; // Import the new component
import { BookOpen, Clock, UserPlus, MoreHorizontal, Activity } from "react-feather"; 
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for lists
const upcomingBookings = [
  { id: "1", title: "Smith Wedding", subtitle: "Tomorrow, 2:00 PM", status: "Confirmed", statusVariant: "success" as const, imageUrl: "https://placehold.co/40x40.png", fallbackText: "SW", dataAiHint: "wedding couple" },
  { id: "2", title: "Doe Corporate Event", subtitle: "Next week", status: "Pending", statusVariant: "warning" as const, imageUrl: "https://placehold.co/40x40.png", fallbackText: "DE", dataAiHint: "corporate event" },
];

const recentClients = [
  { id: "1", title: "Alice Wonderland", subtitle: "Joined 2 days ago", imageUrl: "https://placehold.co/40x40.png", fallbackText: "AW", dataAiHint: "portrait person" },
  { id: "2", title: "Bob The Builder", subtitle: "Joined 5 days ago", imageUrl: "https://placehold.co/40x40.png", fallbackText: "BB", dataAiHint: "construction worker" },
];

const itemActionMenu = (item: { id: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>View Details</DropdownMenuItem>
      <DropdownMenuItem>Edit</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const projectStages = [
  { name: "Booked" },
  { name: "Planning" },
  { name: "Shooting" },
  { name: "Editing" },
  { name: "Review" },
  { name: "Delivered" },
];
const currentProjectStage = "Editing";


export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardCoverPhotoDisplay /> {/* Add the cover photo display here */}
      <SummaryStats />
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <OverviewList 
            title="Upcoming Bookings" 
            items={upcomingBookings} 
            icon={Clock} 
            emptyMessage="No upcoming bookings."
            itemAction={itemActionMenu}
        />
        <OverviewList 
            title="Recently Added Clients" 
            items={recentClients} 
            icon={UserPlus}
            emptyMessage="No new clients recently."
            itemAction={itemActionMenu}
        />
         <div className="lg:col-span-1 space-y-8">
          <RevenueGoalChart />
          <WorkProgressTracker stages={projectStages} currentStageName={currentProjectStage} />
          <CategoryBreakdown />
          <ProjectStatusProgress />
          <CalendarStatus />
        </div>
      </div>

       {/* Placeholder for more recent activity if needed */}
       {/* <OverviewList title="Recent Activity" items={[]} icon={Activity} /> */}

    </div>
  );
}

    