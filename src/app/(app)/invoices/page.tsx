
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'react-toastify';
import { FileText, Save, Download, DollarSign, User, Calendar as CalendarIcon, Eye } from 'react-feather';
import { INVOICE_TEMPLATE_LS_KEY, INVOICE_HISTORY_LS_KEY } from '@/lib/constants';
import type { Invoice, InvoiceStatus } from '@/types';
import { format, parseISO, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

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

  useEffect(() => {
    const storedTemplate = localStorage.getItem(INVOICE_TEMPLATE_LS_KEY);
    if (storedTemplate) {
      setInvoiceTemplate(storedTemplate);
    }
    const storedHistory = localStorage.getItem(INVOICE_HISTORY_LS_KEY);
    if (storedHistory) {
      try {
        setInvoiceHistory(JSON.parse(storedHistory));
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
    setIsHistoryDialogOpen(true);
    resetInvoiceForm();
  };

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
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />{t('invoices.issueNew.amountLabel')}
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
                        <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
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
