
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
// Removed Label import from here as FormLabel from ui/form will be used
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Save, Plus, AlertCircle, Trash2 } from 'react-feather';
import { format, parseISO, isValid } from 'date-fns';
import { toast } from 'react-toastify';
import type { Task, TaskPriority, TaskStatus, TaskFileAttachment, Client, Booking } from '@/types';
import { mockClientsData, mockBookingsData } from '@/lib/mock-data';
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form"; // Correctly import Form here

const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Waiting', 'Completed', 'Cancelled'];
const TASK_COLOR_TAGS = ['None', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal'];

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  priority: z.custom<TaskPriority>(val => TASK_PRIORITIES.includes(val as TaskPriority), {
    message: "Invalid priority level."
  }),
  status: z.custom<TaskStatus>(val => TASK_STATUSES.includes(val as TaskStatus), {
    message: "Invalid task status."
  }),
  relatedClientId: z.string().optional(),
  relatedBookingId: z.string().optional(),
  category: z.string().optional(),
  attachments: z.array(z.object({ id: z.string(), name: z.string(), url: z.string(), type: z.string(), size: z.number() })).optional(),
  reminderDate: z.date().optional(),
  subtasks: z.string().optional(),
  colorTag: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onTaskSave: (task: Task, saveAndAddAnother: boolean) => void;
  initialTask?: Task;
}

const NO_CLIENT_VALUE = "NO_CLIENT_SELECTED_PLACEHOLDER";
const NO_BOOKING_VALUE = "NO_BOOKING_SELECTED_PLACEHOLDER";

export function AddTaskDialog({ isOpen, onOpenChange, onTaskSave, initialTask }: AddTaskDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<TaskFileAttachment[]>([]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialTask ? {
      ...initialTask,
      dueDate: initialTask.dueDate ? parseISO(initialTask.dueDate) : undefined,
      startDate: initialTask.startDate ? parseISO(initialTask.startDate) : undefined,
      reminderDate: initialTask.reminderDate ? parseISO(initialTask.reminderDate) : undefined,
      attachments: initialTask.attachments || [],
      relatedClientId: initialTask.relatedClientId === NO_CLIENT_VALUE ? undefined : initialTask.relatedClientId,
      relatedBookingId: initialTask.relatedBookingId === NO_BOOKING_VALUE ? undefined : initialTask.relatedBookingId,
    } : {
      title: '',
      description: '',
      assignee: '',
      priority: 'Medium',
      status: 'To Do',
      category: '',
      subtasks: '',
      colorTag: 'None',
      attachments: [],
    },
  });

  const selectedClientIdWatch = form.watch('relatedClientId');
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (selectedClientIdWatch && selectedClientIdWatch !== NO_CLIENT_VALUE) {
      const client = mockClientsData.find(c => c.id === selectedClientIdWatch);
      if (client) {
        setAvailableBookings(mockBookingsData.filter(b => b.clientName === client.name));
      } else {
        setAvailableBookings([]);
      }
    } else {
      setAvailableBookings([]);
    }
    // Reset booking if client changes or is cleared, but only if it's not already set to the placeholder
    if (form.getValues('relatedBookingId') !== NO_BOOKING_VALUE) {
        form.setValue('relatedBookingId', undefined);
    }
  }, [selectedClientIdWatch, form]);
  
  useEffect(() => {
    if (isOpen) {
        if (initialTask) {
            form.reset({
                ...initialTask,
                dueDate: initialTask.dueDate ? parseISO(initialTask.dueDate) : undefined,
                startDate: initialTask.startDate ? parseISO(initialTask.startDate) : undefined,
                reminderDate: initialTask.reminderDate ? parseISO(initialTask.reminderDate) : undefined,
                attachments: initialTask.attachments || [],
                relatedClientId: initialTask.relatedClientId === NO_CLIENT_VALUE ? undefined : initialTask.relatedClientId,
                relatedBookingId: initialTask.relatedBookingId === NO_BOOKING_VALUE ? undefined : initialTask.relatedBookingId,
            });
            setFilePreviews(initialTask.attachments || []);
            setSelectedFiles([]);
        } else {
            form.reset({
                title: '', description: '', assignee: '', priority: 'Medium', status: 'To Do',
                category: '', subtasks: '', colorTag: 'None', attachments: [],
                dueDate: undefined, startDate: undefined, reminderDate: undefined,
                relatedClientId: undefined, relatedBookingId: undefined
            });
            setFilePreviews([]);
            setSelectedFiles([]);
        }
    }
  }, [initialTask, form, isOpen]);


  const handleFileChange = (newFiles: File[] | null) => {
    const currentLiveFiles = newFiles || [];
    setSelectedFiles(currentLiveFiles);

    const newPreviews = currentLiveFiles.map(file => ({
      id: `temp-${file.name}-${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }));

    // Preserve existing previews from initialTask if they weren't replaced by new files with the same name
    const existingPreviewsFromInitial = initialTask?.attachments?.filter(
        att => !currentLiveFiles.some(f => f.name === att.name)
    ) || [];

    // Preserve current filePreviews that are not from initialTask and not being replaced
    const currentNonInitialPreviews = filePreviews.filter(
        fp => !fp.id.startsWith('temp-') && // not a preview of a currently selected live file
              !(initialTask?.attachments || []).some(att => att.id === fp.id) && // not from initialTask
              !currentLiveFiles.some(f => f.name === fp.name) // not being replaced by a new file
    );
    
    setFilePreviews([...existingPreviewsFromInitial, ...currentNonInitialPreviews, ...newPreviews]);
  };
  
  const removeAttachment = (attachmentIdToRemove: string) => {
    // For previews from newly selected files (temp-id)
    setSelectedFiles(prevFiles => prevFiles.filter(f => {
        const tempIdPattern = `temp-${f.name}-`;
        return !attachmentIdToRemove.startsWith(tempIdPattern) || !filePreviews.find(p => p.id === attachmentIdToRemove && p.name === f.name);
    }));
    
    // For previews from initialTask (non-temp-id) or existing filePreviews state
    setFilePreviews(prevPreviews => prevPreviews.filter(att => att.id !== attachmentIdToRemove));
  };


  const processSave = (values: TaskFormValues, saveAndAddAnother: boolean) => {
    const finalAttachments: TaskFileAttachment[] = filePreviews.map(fp => ({
        id: fp.id.startsWith('temp-') ? `file-${Date.now()}-${Math.random().toString(36).substring(7)}` : fp.id,
        name: fp.name,
        url: fp.url, // For actual uploads, this would be a server URL
        type: fp.type,
        size: fp.size,
    }));

    const newTask: Task = {
      id: initialTask?.id || `task-${Date.now()}`,
      ...values,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      startDate: values.startDate ? values.startDate.toISOString() : undefined,
      reminderDate: values.reminderDate ? values.reminderDate.toISOString() : undefined,
      attachments: finalAttachments,
      relatedClientId: values.relatedClientId === NO_CLIENT_VALUE ? undefined : values.relatedClientId,
      relatedBookingId: values.relatedBookingId === NO_BOOKING_VALUE ? undefined : values.relatedBookingId,
      createdBy: initialTask?.createdBy || "Admin User",
      createdAt: initialTask?.createdAt || new Date().toISOString(),
    };
    onTaskSave(newTask, saveAndAddAnother);
    if (saveAndAddAnother) {
       form.reset({ 
            title: '', description: '', assignee: values.assignee, 
            priority: values.priority, status: 'To Do', category: values.category,
            relatedClientId: values.relatedClientId, // Keep client if adding another for same client
            relatedBookingId: undefined, // Reset booking as it might be different
            subtasks: '', colorTag: values.colorTag, attachments: [],
            dueDate: undefined, startDate: undefined, reminderDate: undefined,
        });
        setSelectedFiles([]);
        setFilePreviews([]);
    }
    // If !saveAndAddAnother, dialog closes, and useEffect handles form reset based on isOpen.
  };
  
  const onSubmit = (values: TaskFormValues) => processSave(values, false);
  const onSaveAndAddAnother = () => form.handleSubmit((values) => processSave(values, true))();


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{initialTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {initialTask ? 'Update the details for this task.' : 'Fill in the details below to create a new task.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="max-h-[65vh] p-1 pr-3">
              <div className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Edit Album - Johnson Wedding" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl><Textarea placeholder="More detailed notes or instructions..." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="assignee" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <FormControl><Input placeholder="e.g., Jane Doe or Team Alpha" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="priority" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {TASK_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="dueDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Due Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="relatedClientId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Client (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === NO_CLIENT_VALUE ? undefined : value)} 
                        value={field.value || NO_CLIENT_VALUE}
                      >
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl>
                        <SelectContent>
                           <SelectItem value={NO_CLIENT_VALUE}>None</SelectItem>
                           {mockClientsData.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="relatedBookingId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Booking (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === NO_BOOKING_VALUE ? undefined : value)} 
                        value={field.value || NO_BOOKING_VALUE}
                        disabled={!selectedClientIdWatch || selectedClientIdWatch === NO_CLIENT_VALUE || availableBookings.length === 0}
                      >
                        <FormControl><SelectTrigger>
                          <SelectValue placeholder={
                            !selectedClientIdWatch || selectedClientIdWatch === NO_CLIENT_VALUE 
                            ? "Select client first" 
                            : availableBookings.length === 0 
                            ? "No bookings for client" 
                            : "Select a booking"
                          } />
                        </SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value={NO_BOOKING_VALUE}>None</SelectItem>
                          {availableBookings.map(booking => {
                            const firstDate = booking.bookingDates[0]?.dateTime ? format(parseISO(booking.bookingDates[0].dateTime), 'MMM d, yy') : 'No Date';
                            return (
                              <SelectItem key={booking.id} value={booking.id}>
                                {booking.packageName} ({firstDate})
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category / Labels (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Editing, Admin, Urgent" {...field} /></FormControl>
                    <FormDescription>Comma-separated values.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormItem>
                    <FormLabel>Attachments (Optional)</FormLabel>
                    <ImageUploadDropzone
                        onFileChange={(file) => handleFileChange(file ? [file] : [])} 
                        className="h-28" 
                        label="Drop files or click to upload (images, PDFs, etc.)"
                    />
                    {filePreviews.length > 0 && (
                        <div className="mt-2 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Selected files:</p>
                        {filePreviews.map((att, index) => (
                            <div key={att.id || `file-${index}`} className="flex items-center justify-between p-1.5 bg-muted/50 rounded-md text-xs">
                            <span className="truncate max-w-[80%]">{att.name} ({ (att.size / 1024).toFixed(1) } KB)</span>
                            <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => removeAttachment(att.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                            </div>
                        ))}
                        </div>
                    )}
                </FormItem>


                <FormField control={form.control} name="reminderDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Reminder Date (Optional)</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button variant={"outline"} className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a reminder date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="subtasks" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtasks (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="List sub-items, one per line..." {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="colorTag" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Tag (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'None'}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a color tag" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TASK_COLOR_TAGS.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center">
                              {color !== 'None' && <span className={`inline-block w-3 h-3 rounded-full mr-2 bg-${color.toLowerCase()}-500 border border-${color.toLowerCase()}-700`}></span>}
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                 {initialTask && <p className="text-xs text-muted-foreground">Created by: {initialTask.createdBy} on {format(parseISO(initialTask.createdAt), "PPP")}</p>}


              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="button" variant="secondary" onClick={onSaveAndAddAnother} disabled={form.formState.isSubmitting}>
                <Plus className="mr-2 h-4 w-4" /> Save & Add Another
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> {initialTask ? 'Save Changes' : 'Save Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
