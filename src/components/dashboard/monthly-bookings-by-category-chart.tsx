
'use client'

import React, { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Calendar } from "react-feather"
import { mockBookingsData, mockBookingCategoriesData } from "@/lib/mock-data";
import type { BookingCategory } from "@/types";
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid } from 'date-fns';

interface MonthlyChartData {
  name: string;
  bookings: number;
  fill: string;
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function MonthlyBookingsByCategoryChart() {
  const monthlyChartData = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const categoryCounts: Record<string, number> = {};

    mockBookingsData.forEach(booking => {
      const firstBookingDateStr = booking.bookingDates[0]?.dateTime;
      if (firstBookingDateStr) {
        const firstBookingDate = parseISO(firstBookingDateStr);
        if (isValid(firstBookingDate) && isWithinInterval(firstBookingDate, { start: currentMonthStart, end: currentMonthEnd })) {
          if (booking.categoryId) {
            categoryCounts[booking.categoryId] = (categoryCounts[booking.categoryId] || 0) + 1;
          } else {
            categoryCounts['uncategorized'] = (categoryCounts['uncategorized'] || 0) + 1;
          }
        }
      }
    });

    const dataForChart: MonthlyChartData[] = Object.entries(categoryCounts).map(([categoryId, count], index) => {
      const category = mockBookingCategoriesData.find(c => c.id === categoryId);
      return {
        name: category ? category.name : "Uncategorized",
        bookings: count,
        fill: category?.gradientClasses ? `url(#gradient-${category.id})` : chartColors[index % chartColors.length],
      };
    });
    return dataForChart;
  }, []);
  
  const chartConfig = useMemo(() => {
     const config: ChartConfig = {};
     monthlyChartData.forEach(item => {
        config[item.name] = {
            label: item.name,
            color: item.fill.startsWith('url') ? chartColors[mockBookingCategoriesData.findIndex(c=>c.name === item.name) % chartColors.length] : item.fill,
        };
     });
     config.bookings = { label: "Bookings" };
     return config;
  }, [monthlyChartData]);


  if (monthlyChartData.length === 0) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold text-foreground font-headline">Bookings This Month by Category</CardTitle>
          <Calendar className="h-6 w-6 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-10">No bookings recorded for the current month.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Define gradients for categories that have them
  const renderGradients = () => {
    return mockBookingCategoriesData.map(category => {
      if (category.gradientClasses && category.gradientClasses.includes('from-') && category.gradientClasses.includes('to-')) {
        // Basic parsing for two-stop gradients. More complex parsing might be needed for more diverse gradients.
        const fromColorMatch = category.gradientClasses.match(/from-([a-z]+)-(\d+)/);
        const toColorMatch = category.gradientClasses.match(/to-([a-z]+)-(\d+)/);

        if (fromColorMatch && toColorMatch) {
          // This is a simplified conversion; Tailwind HSL vars would be better
          const fromColor = `hsl(var(--${fromColorMatch[1]}-${fromColorMatch[2]}))`; 
          const toColor = `hsl(var(--${toColorMatch[1]}-${toColorMatch[2]}))`;
          // Fallback if direct HSL conversion is not feasible, or use fixed colors
          // For demo, let's try to use a fixed known color if parsing is too complex for this context
          const primaryChartColor = chartColors[mockBookingCategoriesData.findIndex(c => c.id === category.id) % chartColors.length];

          return (
            <linearGradient key={`gradient-${category.id}`} id={`gradient-${category.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryChartColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={primaryChartColor} stopOpacity={0.4}/>
            </linearGradient>
          );
        }
      }
      return null;
    }).filter(Boolean);
  };


  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground font-headline">Bookings This Month by Category</CardTitle>
        <Calendar className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={monthlyChartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <defs>
              {renderGradients()}
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend content={({payload}) => {
              if (!payload) return null;
              return (
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-1 mt-4">
                  {payload.map((entry: any) => (
                     <div key={entry.value} className="flex items-center gap-1.5">
                       <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{backgroundColor: entry.color}} />
                       <span className="text-xs text-muted-foreground">{entry.value}</span>
                     </div>
                  ))}
                </div>
              )
            }} />
            <Bar dataKey="bookings" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

