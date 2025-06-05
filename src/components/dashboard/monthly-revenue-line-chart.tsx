'use client'

import React, { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { DollarSign } from "react-feather";
import { mockBookingsData } from "@/lib/mock-data";
import { parseISO, isValid, format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface RevenueChartData {
    month: string;
    revenue: number;
}

export function MonthlyRevenueLineChart() {
    const chartData = useMemo(() => {
        const now = new Date();
        const months: { start: Date; end: Date; label: string }[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            months.push({
                start: startOfMonth(date),
                end: endOfMonth(date),
                label: format(date, 'yyyy-MM'),
            });
        }
        // Aggregate revenue per month
        const revenuePerMonth: Record<string, number> = {};
        months.forEach(m => { revenuePerMonth[m.label] = 0; });
        mockBookingsData.forEach(booking => {
            if (booking.payments) {
                booking.payments.forEach(payment => {
                    if (payment.status === 'Paid') {
                        const paymentDate = parseISO(payment.paymentDate);
                        if (isValid(paymentDate)) {
                            months.forEach(m => {
                                if (isWithinInterval(paymentDate, { start: m.start, end: m.end })) {
                                    revenuePerMonth[m.label] += payment.amount;
                                }
                            });
                        }
                    }
                });
            }
        });
        return months.map(m => ({ month: m.label, revenue: revenuePerMonth[m.label] }));
    }, []);

    const chartConfig: ChartConfig = {
        revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
    };

    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-foreground font-headline">Monthly Revenue</CardTitle>
                <DollarSign className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                        <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
} 