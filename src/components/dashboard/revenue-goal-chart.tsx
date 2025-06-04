
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Target } from "react-feather";
import { RadialBarChart, RadialBar, Legend, Tooltip, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts"

const chartData = [
  {
    month: "Current",
    revenue: 3750, // Actual revenue
    goal: 5000,    // Goal revenue
  },
]

const chartConfig = {
  revenue: {
    label: "Revenue Achieved",
    color: "hsl(var(--chart-1))",
  },
  goal: {
    label: "Revenue Goal",
    color: "hsl(var(--muted))",
  }
} satisfies ChartConfig

export function RevenueGoalChart() {
  const percentage = Math.round((chartData[0].revenue / chartData[0].goal) * 100);
  const displayData = [
    { 
      name: `${percentage}% of Goal`, 
      value: percentage, 
      fill: chartConfig.revenue.color 
    }
  ];

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-foreground font-headline">Monthly Revenue Goal</CardTitle>
        <Target className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={displayData}
              startAngle={90}
              endAngle={-270}
              innerRadius="70%"
              outerRadius="100%"
              barSize={20}
            >
              <PolarGrid gridType="circle" stroke="hsl(var(--border))" />
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar
                dataKey="value"
                background={{ fill: chartConfig.goal.color, opacity: 0.3 }}
                cornerRadius={10}
              />
              <Tooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{value}%</span>
                        <span className="text-xs text-muted-foreground">of ${chartData[0].goal.toLocaleString()} goal</span>
                        <span className="text-xs text-muted-foreground">(${chartData[0].revenue.toLocaleString()} achieved)</span>
                      </div>
                    )}
                  />
                } 
              />
               <Legend
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  return (
                    <div className="flex items-center justify-center gap-2 -mt-4">
                       <div className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: payload[0].payload.fill }} />
                       <span className="text-xs text-muted-foreground">{payload[0].value}</span>
                    </div>
                  );
                }}
                verticalAlign="bottom"
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
