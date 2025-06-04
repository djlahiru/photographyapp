import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, List, Users, Briefcase } from "react-feather"; // ListChecks -> List

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground font-headline">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function SummaryStats() {
  // Placeholder data
  const stats = [
    { title: "Active Bookings", value: "12", icon: Briefcase, description: "+2 from last month" },
    { title: "Payments This Month", value: "$2,350", icon: DollarSign, description: "Total revenue" },
    { title: "Tasks In Progress", value: "8", icon: List, description: "Across all projects" }, // Was ListChecks
    { title: "New Clients", value: "3", icon: Users, description: "Joined this week" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
