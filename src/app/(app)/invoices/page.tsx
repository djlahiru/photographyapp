
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from '@/components/ui/date-picker'; // Assuming you have a DatePicker, if not use Input type="date"
import { toast } from 'react-toastify';
import { FileText, Save, Send, DollarSign, User, Calendar as CalendarIcon } from 'react-feather';
import { INVOICE_TEMPLATE_LS_KEY } from '@/lib/constants';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const [invoiceTemplate, setInvoiceTemplate] = useState('');
  const [clientName, setClientName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();

  useEffect(() => {
    const storedTemplate = localStorage.getItem(INVOICE_TEMPLATE_LS_KEY);
    if (storedTemplate) {
      setInvoiceTemplate(storedTemplate);
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

  const handleGenerateInvoice = () => {
    // Placeholder for generation logic
    console.log({
      clientName,
      invoiceNumber,
      invoiceAmount,
      issueDate,
      dueDate,
      template: invoiceTemplate,
    });
    toast.info(t('invoices.issueNew.generateSuccess'));
    // Reset form potentially
    setClientName('');
    setInvoiceNumber('');
    setInvoiceAmount('');
    setIssueDate(new Date());
    setDueDate(undefined);
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
      </div>

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
          
          {/* Placeholder for adding line items - Future enhancement */}
          {/* 
          <div className="space-y-2">
            <Label>Line Items</Label>
            <Button variant="outline" size="sm">Add Line Item</Button>
          </div> 
          */}

          <Button onClick={handleGenerateInvoice} size="lg">
            <Send className="mr-2 h-4 w-4" /> {t('invoices.issueNew.generateButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Basic DatePicker component if not already existing (can be moved to ui/date-picker.tsx)
// For simplicity, placing a basic one here. You might have a more robust one.
const BasicDatePicker: React.FC<{ date: Date | undefined; setDate: (date: Date | undefined) => void; placeholder?: string }> = ({ date, setDate, placeholder }) => {
  return (
    <Input
      type="date"
      value={date ? date.toISOString().split('T')[0] : ''}
      onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)}
      placeholder={placeholder}
    />
  );
};

// If you have a shadcn/ui DatePicker, it would look more like this:
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";

// const ShadcnDatePicker: React.FC<{ date: Date | undefined; setDate: (date: Date | undefined) => void; buttonClassName?: string }> = ({ date, setDate, buttonClassName }) => {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           variant={"outline"}
//           className={cn(
//             "w-full justify-start text-left font-normal",
//             !date && "text-muted-foreground",
//             buttonClassName
//           )}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {date ? format(date, "PPP") : <span>Pick a date</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0">
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={setDate}
//           initialFocus
//         />
//       </PopoverContent>
//     </Popover>
//   );
// };

// Using basic Input type="date" for now to avoid dependency on a specific DatePicker not provided in context.
// Replace `BasicDatePicker` with your actual `DatePicker` component if you have one.
const DatePicker = BasicDatePicker;

