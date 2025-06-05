
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Save } from 'react-feather';
import type { SpecialNote, SpecialNoteColor } from '@/types';

const NOTE_COLORS: { value: SpecialNoteColor; label: string; bgClass: string; borderClass: string; textClass: string }[] = [
  { value: 'default', label: 'Default', bgClass: 'bg-card', borderClass: 'border-border', textClass: 'text-card-foreground' },
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-yellow-100 dark:bg-yellow-800/30', borderClass: 'border-yellow-300 dark:border-yellow-700', textClass: 'text-yellow-800 dark:text-yellow-200' },
  { value: 'pink', label: 'Pink', bgClass: 'bg-pink-100 dark:bg-pink-800/30', borderClass: 'border-pink-300 dark:border-pink-700', textClass: 'text-pink-800 dark:text-pink-200' },
  { value: 'blue', label: 'Blue', bgClass: 'bg-blue-100 dark:bg-blue-800/30', borderClass: 'border-blue-300 dark:border-blue-700', textClass: 'text-blue-800 dark:text-blue-200' },
  { value: 'green', label: 'Green', bgClass: 'bg-green-100 dark:bg-green-800/30', borderClass: 'border-green-300 dark:border-green-700', textClass: 'text-green-800 dark:text-green-200' },
];

const noteSchema = z.object({
  content: z.string().min(1, { message: 'Note content cannot be empty.' }).max(500, { message: 'Note cannot exceed 500 characters.' }),
  color: z.custom<SpecialNoteColor>((val) => NOTE_COLORS.some(nc => nc.value === val), {
    message: 'Invalid note color selected.',
  }),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface AddEditSpecialNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (noteData: Omit<SpecialNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialData?: SpecialNote;
}

export function AddEditSpecialNoteDialog({ isOpen, onOpenChange, onSave, initialData }: AddEditSpecialNoteDialogProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
      color: 'default',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          content: initialData.content,
          color: initialData.color,
        });
      } else {
        form.reset({
          content: '',
          color: 'default',
        });
      }
    }
  }, [isOpen, initialData, form]);

  const onSubmit = (values: NoteFormValues) => {
    onSave({
      id: initialData?.id,
      ...values,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{initialData ? 'Edit Special Note' : 'Add New Special Note'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the content or color of your note.' : 'Write down a quick reminder or important information.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your note here..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Color</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NOTE_COLORS.map((nc) => (
                        <SelectItem key={nc.value} value={nc.value}>
                          <div className="flex items-center">
                            <span className={`mr-2 h-4 w-4 rounded-full ${nc.bgClass} border ${nc.borderClass}`}></span>
                            {nc.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" /> {initialData ? 'Save Changes' : 'Add Note'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
