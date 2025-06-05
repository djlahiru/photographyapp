
'use client'; // Add 'use client' for useState and useEffect

import React, { useState, useEffect } from 'react'; // Import React hooks
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, List, Users, Briefcase } from "react-feather";
import { formatCurrency, getSelectedCurrencyDefinition } from '@/lib/currency-utils';
import type { CurrencyDefinition } from '@/lib/constants';

interface StatCardProps {
  title: string;
  value: string; // Value will now be formatted string
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
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
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyDefinition>(getSelectedCurrencyDefinition());

  useEffect(() => {
    setCurrentCurrency(getSelectedCurrencyDefinition());
    const handleCurrencyChange = () => {
      setCurrentCurrency(getSelectedCurrencyDefinition());
    };
    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  // Placeholder raw numerical data
  const rawStats = {
    activeBookings: 12,
    paymentsThisMonth: 2350,
    tasksInProgress: 8,
    newClients: 3,
  };

  const stats = [
    { title: "Active Bookings", value: rawStats.activeBookings.toString(), icon: Briefcase, description: "+2 from last month" },
    { title: "Payments This Month", value: formatCurrency(rawStats.paymentsThisMonth, currentCurrency.code), icon: DollarSign, description: "Total revenue" },
    { title: "Tasks In Progress", value: rawStats.tasksInProgress.toString(), icon: List, description: "Across all projects" },
    { title: "New Clients", value: rawStats.newClients.toString(), icon: Users, description: "Joined this week" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
