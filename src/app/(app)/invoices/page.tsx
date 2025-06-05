
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'react-toastify';
import { FileText, Save, Download, DollarSign, User, Calendar as CalendarIcon, Eye, List } from 'react-feather';
import { INVOICE_TEMPLATE_LS_KEY, INVOICE_HISTORY_LS_KEY } from '@/lib/constants';
import type { Invoice, InvoiceStatus, CurrencyCode } from '@/types';
import { format, parseISO, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, getSelectedCurrencyDefinition } from '@/lib/currency-utils';
import type { CurrencyDefinition } from '@/lib/constants';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [invoiceTemplate, setInvoiceTemplate] = useState('');
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const [invoiceHistory, setInvoiceHistory] = useState<Invoice[]>([]);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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

  useEffect(() => {
    const storedTemplate = localStorage.getItem(INVOICE_TEMPLATE_LS_KEY);
    if (storedTemplate) {
      setInvoiceTemplate(storedTemplate);
    }
    const storedHistory = localStorage.getItem(INVOICE_HISTORY_LS_KEY);
    if (storedHistory) {
      try {
        const parsedHistory: Invoice[] = JSON.parse(storedHistory);
        // Ensure dates are valid or handled, potentially re-parse if needed
        const validatedHistory = parsedHistory.map(inv => ({
          ...inv,
          issueDate: isValid(parseISO(inv.issueDate)) ? inv.issueDate : new Date().toISOString(),
          dueDate: inv.dueDate && isValid(parseISO(inv.dueDate)) ? inv.dueDate : undefined,
        }));
        setInvoiceHistory(validatedHistory);
      } catch (error) {
        console.error("Error parsing invoice history from localStorage:", error);
        setInvoiceHistory([]);
      }
    }
  }, []);

  const handleSaveTemplate = () => {
    try {
      localStorage.setItem(INVOICE_TEMPLATE_LS_KEY, invoiceTemplate);
      toast.success(t('invoices.templateSetup.saveSuccess'));
    } catch (error) {
      console.error("Error saving invoice template to localStorage:", error);
      toast.error(t('invoices.templateSetup.saveError'));
    }
  };

  const resetInvoiceForm = () => {
    setClientName('');
    setInvoiceNumber('');
    setInvoiceAmount('');
    setIssueDate(new Date());
    setDueDate(undefined);
  }

  const handleRecordAndShowHistory = () => {
    if (!clientName.trim() || !invoiceNumber.trim() || !invoiceAmount.trim() || !issueDate) {
      toast.error(t('invoices.issueNew.validationError'));
      return;
    }
    const amount = parseFloat(invoiceAmount);
    if (isNaN(amount) || amount <= 0) {
        toast.error(t('invoices.issueNew.amountValidationError'));
        return;
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim(),
      clientName: clientName.trim(),
      amount: amount,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      status: 'Recorded' as InvoiceStatus,
    };

    const updatedHistory = [newInvoice, ...invoiceHistory];
    setInvoiceHistory(updatedHistory);
    try {
      localStorage.setItem(INVOICE_HISTORY_LS_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error("Error saving invoice history to localStorage:", error);
        toast.error(t('invoices.history.saveError'));
    }
    
    toast.success(t('invoices.issueNew.generateSuccess', { number: newInvoice.invoiceNumber, client: newInvoice.clientName }));
    setIsHistoryDialogOpen(true); // Open full history dialog after recording
    resetInvoiceForm();
  };

  const recentInvoicesToDisplay = invoiceHistory.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" />
            {t('invoices.title')}
          </h1>
          <p className="text-muted-foreground">{t('invoices.description')}</p>
        </div>
         <Button onClick={() => setIsHistoryDialogOpen(true)} variant="outline" disabled={invoiceHistory.length === 0}>
            <Eye className="mr-2 h-4 w-4" /> {t('invoices.history.viewButton')} ({invoiceHistory.length})
        </Button>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">{t('invoices.issueNew.title')}</CardTitle>
          <CardDescription>{t('invoices.issueNew.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />{t('invoices.issueNew.clientNameLabel')}
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t('invoices.issueNew.clientNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />{t('invoices.issueNew.invoiceNumberLabel')}
              </Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder={t('invoices.issueNew.invoiceNumberPlaceholder')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="issueDate" className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />{t('invoices.issueNew.issueDateLabel')}
              </Label>
              <DatePicker date={issueDate} setDate={setIssueDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />{t('invoices.issueNew.dueDateLabel')}
              </Label>
              <DatePicker date={dueDate} setDate={setDueDate} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="invoiceAmount" className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />{t('invoices.issueNew.amountLabel')} ({currentCurrency.symbol})
              </Label>
              <Input
                id="invoiceAmount"
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder={t('invoices.issueNew.amountPlaceholder')}
              />
            </div>
          </div>
          
          <Button onClick={handleRecordAndShowHistory} size="lg">
            <Download className="mr-2 h-4 w-4" /> {t('invoices.issueNew.generateButton')}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <List className="mr-3 h-6 w-6 text-primary" />
            {t('invoices.recentHistory.title')}
          </CardTitle>
          <CardDescription>{t('invoices.recentHistory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {recentInvoicesToDisplay.length > 0 ? (
            <div className="space-y-4">
              {recentInvoicesToDisplay.map((invoice) => (
                <div key={invoice.id} className="p-3 border rounded-md hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {t('invoices.history.invoiceNumberShort')}{invoice.invoiceNumber} - {invoice.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('invoices.history.issuedOn')} {isValid(parseISO(invoice.issueDate)) ? format(parseISO(invoice.issueDate), "MMM d, yyyy") : 'Invalid Date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <Badge variant={invoice.status === 'Recorded' ? 'success' : 'default'} className="text-xs">
                        {invoice.status}
                      </Badge>
                      <p className="text-sm font-semibold text-primary">{formatCurrency(invoice.amount, currentCurrency.code)}</p>
                    </div>
                  </div>
                  {invoice.dueDate && isValid(parseISO(invoice.dueDate)) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('invoices.history.dueOn')} {format(parseISO(invoice.dueDate), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              ))}
              {invoiceHistory.length > recentInvoicesToDisplay.length && (
                <Button variant="link" onClick={() => setIsHistoryDialogOpen(true)} className="w-full mt-2">
                  {t('invoices.recentHistory.viewAllButton')} ({invoiceHistory.length})
                </Button>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">{t('invoices.history.noInvoices')}</p>
          )}
        </CardContent>
      </Card>


      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline">{t('invoices.templateSetup.title')}</CardTitle>
          <CardDescription>{t('invoices.templateSetup.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invoiceTemplate" className="text-sm font-medium">
              {t('invoices.templateSetup.label')}
            </Label>
            <Textarea
              id="invoiceTemplate"
              value={invoiceTemplate}
              onChange={(e) => setInvoiceTemplate(e.target.value)}
              placeholder={t('invoices.templateSetup.placeholder')}
              className="min-h-[300px] font-mono text-sm mt-1"
            />
          </div>
          <Button onClick={handleSaveTemplate}>
            <Save className="mr-2 h-4 w-4" /> {t('invoices.templateSetup.saveButton')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline">{t('invoices.history.title')}</DialogTitle>
            <DialogDescription>{t('invoices.history.description')}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {invoiceHistory.length > 0 ? (
              <ScrollArea className="h-[400px] pr-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('invoices.history.invoiceNumber')}</TableHead>
                      <TableHead>{t('invoices.history.client')}</TableHead>
                      <TableHead>{t('invoices.history.issueDate')}</TableHead>
                      <TableHead>{t('invoices.history.dueDate')}</TableHead>
                      <TableHead className="text-right">{t('invoices.history.amount')}</TableHead>
                      <TableHead className="text-center">{t('invoices.history.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceHistory.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>{isValid(parseISO(invoice.issueDate)) ? format(parseISO(invoice.issueDate), "MMM d, yyyy") : 'Invalid Date'}</TableCell>
                        <TableCell>{invoice.dueDate && isValid(parseISO(invoice.dueDate)) ? format(parseISO(invoice.dueDate), "MMM d, yyyy") : 'N/A'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.amount, currentCurrency.code)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={invoice.status === 'Recorded' ? 'success' : 'default'}>{invoice.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-10">{t('invoices.history.noInvoices')}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
