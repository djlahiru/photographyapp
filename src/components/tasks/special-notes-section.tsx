
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Edit2, Trash2, FileText as NoteIcon, Info } from 'react-feather'; // Changed StickyNote to FileText and aliased as NoteIcon
import type { SpecialNote, SpecialNoteColor } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SpecialNotesSectionProps {
  notes: SpecialNote[];
  onAddNote: () => void;
  onEditNote: (note: SpecialNote) => void;
  onDeleteNote: (noteId: string) => void;
}

const noteColorClasses: Record<SpecialNoteColor, { bg: string; border: string; text: string; contentText: string }> = {
  default: { bg: 'bg-card', border: 'border-border', text: 'text-card-foreground', contentText: 'text-muted-foreground' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/70', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200', contentText: 'text-yellow-700 dark:text-yellow-300' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/70', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-800 dark:text-pink-200', contentText: 'text-pink-700 dark:text-pink-300' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/70', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200', contentText: 'text-blue-700 dark:text-blue-300' },
  green: { bg: 'bg-green-100 dark:bg-green-900/70', border: 'border-green-300 dark:border-green-700', text: 'text-green-800 dark:text-green-200', contentText: 'text-green-700 dark:text-green-300' },
};


export function SpecialNotesSection({ notes, onAddNote, onEditNote, onDeleteNote }: SpecialNotesSectionProps) {
  return (
    <Card className="shadow-lg mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <NoteIcon className="h-6 w-6 mr-2 text-primary" /> {/* Used NoteIcon (FileText) */}
          <CardTitle className="font-headline text-xl">Special Notes</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onAddNote}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Info className="h-12 w-12 mb-3" />
            <p>No special notes yet.</p>
            <p className="text-xs">Click "Add Note" to jot down quick reminders or important info.</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px] sm:h-[150px] pr-3 -mr-3"> {/* Adjusted height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {notes.map((note) => {
                const colorTheme = noteColorClasses[note.color] || noteColorClasses.default;
                return (
                  <Card
                    key={note.id}
                    className={cn(
                      "flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow",
                      colorTheme.bg,
                      colorTheme.border
                    )}
                  >
                    <CardContent className={cn("p-3 text-sm whitespace-pre-wrap break-words flex-grow", colorTheme.contentText)}>
                      {note.content}
                    </CardContent>
                    <CardFooter className={cn("p-2 border-t flex items-center justify-between text-xs", colorTheme.border)}>
                      <span className={cn("text-muted-foreground", colorTheme.text === 'text-card-foreground' ? '' : colorTheme.text)}>
                        {note.updatedAt ? `${formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })} (edited)` : formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-7 w-7", colorTheme.text === 'text-card-foreground' ? 'text-muted-foreground hover:text-primary' : `${colorTheme.text} hover:bg-primary/10`)}
                          onClick={() => onEditNote(note)}
                          title="Edit Note"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-7 w-7", colorTheme.text === 'text-card-foreground' ? 'text-destructive hover:text-destructive' : `${colorTheme.text} hover:bg-destructive/10 hover:text-destructive`)}
                          onClick={() => onDeleteNote(note.id)}
                          title="Delete Note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
