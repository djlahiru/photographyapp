
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, DollarSign, Users, TrendingUp, TrendingDown, List, Filter, Search, CreditCard, Briefcase, Calendar as CalendarIconFeather, Package } from "react-feather";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { Payment, Booking, Client, PaymentStatus } from '@/types';
import { mockBookingsData, mockClientsData } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const paymentStatusVariantMap: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Paid: "success",
  Pending: "warning",
  Failed: "destructive",
  Refunded: "outline",
};

interface EnrichedPayment extends Payment {
  clientName: string;
  packageName: string;
  bookingCategory?: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  const allPayments: EnrichedPayment[] = useMemo(() => {
    const payments: EnrichedPayment[] = [];
    mockBookingsData.forEach(booking => {
      const client = mockClientsData.find(c => c.name === booking.clientName);
      booking.payments?.forEach(p => {
        payments.push({
          ...p,
          clientName: client?.name || 'Unknown Client',
          packageName: booking.packageName,
          bookingCategory: booking.category,
        });
      });
    });
    return payments.sort((a, b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime());
  }, [mockBookingsData, mockClientsData]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter(payment => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        payment.clientName.toLowerCase().includes(searchLower) ||
        payment.packageName.toLowerCase().includes(searchLower) ||
        (payment.description && payment.description.toLowerCase().includes(searchLower)) ||
        payment.amount.toString().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allPayments, searchTerm, statusFilter]);

  const recentPayments = useMemo(() => {
    return allPayments.slice(0, 5);
  }, [allPayments]);

  const summaryStats = useMemo(() => {
    const now = new Date();
    const currentMonthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    
    let totalRevenueThisMonth = 0;
    let totalOutstanding = 0;
    let totalPaidAllTime = 0;

    allPayments.forEach(payment => {
      if (payment.status === 'Paid') {
        totalPaidAllTime += payment.amount;
        if (isWithinInterval(parseISO(payment.paymentDate), currentMonthInterval)) {
          totalRevenueThisMonth += payment.amount;
        }
      }
    });

    mockBookingsData.forEach(booking => {
        const paidForBooking = booking.payments?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
        if (booking.status !== 'Cancelled' && booking.price > paidForBooking) {
            totalOutstanding += (booking.price - paidForBooking);
        }
    });

    return {
      totalRevenueThisMonth,
      totalOutstanding,
      totalPaidAllTime,
      totalTransactions: allPayments.length,
    };
  }, [allPayments, mockBookingsData]);


  const handleRecordPayment = () => {
    // This will eventually open a dialog
    alert("Record New Payment dialog coming soon!");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Payment Management</h1>
            <p className="text-muted-foreground">Track, record, and manage all client payments.</p>
        </div>
        <Button onClick={handleRecordPayment}>
            <PlusCircle className="mr-2 h-4 w-4" /> Record New Payment
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue This Month</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">${summaryStats.totalRevenueThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground pt-1">From paid invoices</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Outstanding</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">${summaryStats.totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground pt-1">Across all active bookings</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid (All Time)</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">${summaryStats.totalPaidAllTime.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground pt-1">Overall received payments</p>
          </CardContent>
        </Card>
         <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            <List className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground font-headline">{summaryStats.totalTransactions}</div>
             <p className="text-xs text-muted-foreground pt-1">Recorded payment entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Recent Payments</CardTitle>
          <CardDescription>A quick overview of the latest transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <ScrollArea className="h-[300px] pr-2">
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors gap-2 sm:gap-4">
                    <div className="flex-grow space-y-0.5">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm font-medium text-foreground">{payment.clientName}</p>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                         <Briefcase className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                        <span>{payment.packageName} {payment.bookingCategory && `(${payment.bookingCategory})`}</span>
                      </div>
                       {payment.description && (
                         <div className="flex items-center text-xs text-muted-foreground italic">
                           <List className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                           <span>{payment.description}</span>
                         </div>
                       )}
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto mt-2 sm:mt-0">
                       <Badge variant={paymentStatusVariantMap[payment.status]} className="text-xs self-start sm:self-auto">
                        {payment.status}
                      </Badge>
                      <p className="text-lg font-semibold text-primary">${payment.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(payment.paymentDate), "MMM d, yyyy, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-10">No recent payments to display.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment History Table - Placeholder */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">Full Payment History</CardTitle>
          <CardDescription>Browse and filter all recorded payments.</CardDescription>
           <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, package, amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PaymentStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[600px] w-full overflow-x-auto">
             {filteredPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Package / Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">{payment.clientName}</TableCell>
                    <TableCell>
                        {payment.packageName}
                        {payment.bookingCategory && <span className="text-xs text-muted-foreground block">({payment.bookingCategory})</span>}
                    </TableCell>
                    <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(parseISO(payment.paymentDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{payment.method || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={paymentStatusVariantMap[payment.status]}>{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {payment.description || 'No description'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4" />
                <p>No payments found matching your criteria.</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

