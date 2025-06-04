
'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart as PieChartIcon } from "react-feather" // Renamed to avoid conflict with Recharts' PieChart


const chartData = [
  { category: "Weddings", bookings: 18, fill: "var(--color-weddings)" },
  { category: "Portraits", bookings: 25, fill: "var(--color-portraits)" },
  { category: "Events", bookings: 12, fill: "var(--color-events)" },
  { category: "Commercial", bookings: 8, fill: "var(--color-commercial)" },
  { category: "Family", bookings: 15, fill: "var(--color-family)" },
]

const chartConfig = {
  bookings: {
    label: "Bookings",
  },
  weddings: {
    label: "Weddings",
    color: "hsl(var(--chart-1))",
  },
  portraits: {
    label: "Portraits",
    color: "hsl(var(--chart-2))",
  },
  events: {
    label: "Events",
    color: "hsl(var(--chart-3))",
  },
  commercial: {
    label: "Commercial",
    color: "hsl(var(--chart-4))",
  },
  family: {
    label: "Family",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function CategoryBreakdown() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground font-headline">Bookings by Category</CardTitle>
        <PieChartIcon className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => value.slice(0, 10)}
            />
             <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend content={({payload}) => {
              if (!payload) return null;
              return (
                <div className="flex items-center justify-center gap-4 mt-4">
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
