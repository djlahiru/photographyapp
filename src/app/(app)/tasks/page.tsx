
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Zap } from "react-feather";
import { SmartSuggestionButton } from "@/components/tasks/smart-suggestion-button";
import { AddTaskDialog } from '@/components/tasks/add-task-dialog';
import { SpecialNotesSection } from '@/components/tasks/special-notes-section'; // Import SpecialNotesSection
import { AddEditSpecialNoteDialog } from '@/components/tasks/add-edit-special-note-dialog'; // Import AddEditSpecialNoteDialog
import type { Task, SpecialNote } from '@/types';
import { mockTasksData, mockSpecialNotesData } from '@/lib/mock-data';
import { toast } from 'react-toastify';

export default function TasksPage() {
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasksData);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const [specialNotes, setSpecialNotes] = useState<SpecialNote[]>(mockSpecialNotesData);
  const [isAddEditNoteDialogOpen, setIsAddEditNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SpecialNote | undefined>(undefined);


  const handleOpenAddTaskDialog = (task?: Task) => {
    setEditingTask(task);
    setIsAddTaskDialogOpen(true);
  };

  const handleSaveTask = (task: Task, saveAndAddAnother: boolean) => {
    const isEditing = tasks.some(t => t.id === task.id);
    if (isEditing) {
        const updatedTasks = tasks.map(t => t.id === task.id ? task : t);
        setTasks(updatedTasks);
        const idx = mockTasksData.findIndex(t => t.id === task.id);
        if (idx !== -1) mockTasksData[idx] = task;
        toast.success(`Task "${task.title}" updated!`);
    } else {
        const newTaskWithMeta = { ...task, createdAt: new Date().toISOString(), createdBy: "Admin User" };
        setTasks(prevTasks => [newTaskWithMeta, ...prevTasks]);
        mockTasksData.unshift(newTaskWithMeta);
        toast.success(`Task "${task.title}" added!`);
    }
    
    if (!saveAndAddAnother) {
      setIsAddTaskDialogOpen(false);
      setEditingTask(undefined);
    } else {
      setEditingTask(undefined);
    }
  };

  const handleOpenAddEditNoteDialog = (note?: SpecialNote) => {
    setEditingNote(note);
    setIsAddEditNoteDialogOpen(true);
  };

  const handleSaveSpecialNote = (
    noteData: Omit<SpecialNote, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (noteData.id) { // Editing existing note
      const updatedNote: SpecialNote = {
        ...mockSpecialNotesData.find(n => n.id === noteData.id)!,
        ...noteData,
        updatedAt: new Date().toISOString(),
      };
      setSpecialNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      const idx = mockSpecialNotesData.findIndex(n => n.id === updatedNote.id);
      if (idx !== -1) mockSpecialNotesData[idx] = updatedNote;
      toast.success("Note updated successfully!");
    } else { // Adding new note
      const newNote: SpecialNote = {
        id: `note-${Date.now()}`,
        content: noteData.content,
        color: noteData.color,
        createdAt: new Date().toISOString(),
      };
      setSpecialNotes(prev => [newNote, ...prev]);
      mockSpecialNotesData.unshift(newNote);
      toast.success("Note added successfully!");
    }
    setEditingNote(undefined);
  };

  const handleDeleteSpecialNote = (noteId: string) => {
    setSpecialNotes(prev => prev.filter(n => n.id !== noteId));
    const idx = mockSpecialNotesData.findIndex(n => n.id === noteId);
    if (idx !== -1) mockSpecialNotesData.splice(idx, 1);
    toast.info("Note deleted.");
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Task Board</h1>
          <p className="text-muted-foreground">Visualize and manage your project tasks and important notes.</p>
        </div>
        <div className="flex gap-2">
          <SmartSuggestionButton />
          <Button onClick={() => handleOpenAddTaskDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Task
          </Button>
        </div>
      </div>

      <SpecialNotesSection
        notes={specialNotes}
        onAddNote={() => handleOpenAddEditNoteDialog()}
        onEditNote={handleOpenAddEditNoteDialog}
        onDeleteNote={handleDeleteSpecialNote}
      />

      <AddEditSpecialNoteDialog
        isOpen={isAddEditNoteDialogOpen}
        onOpenChange={setIsAddEditNoteDialogOpen}
        onSave={handleSaveSpecialNote}
        initialData={editingNote}
      />

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        onTaskSave={handleSaveTask}
        initialTask={editingTask}
      />

      <Card>
        <CardHeader>
          <CardTitle>Kanban Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto p-2 min-h-[500px] bg-muted/30 rounded-md">
            {['To Do', 'In Progress', 'Done'].map((status) => (
              <div key={status} className="min-w-[300px] bg-card p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-foreground font-headline">{status}</h2>
                <div className="space-y-3">
                  {tasks.filter(t => t.status.toLowerCase().replace(/\s+/g, '-') === status.toLowerCase().replace(/\s+/g, '-')).slice(0,3).map(task => ( // Show more tasks
                     <Card key={task.id} className="p-3 border rounded-md bg-background shadow-sm cursor-pointer hover:shadow-md" onClick={() => handleOpenAddTaskDialog(task)}>
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        {task.description && <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>}
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-muted-foreground">
                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                            </span>
                            {task.assignee && (
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-semibold" title={task.assignee}>
                                    {task.assignee.substring(0,2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {task.priority && <span className={`mt-1 text-xs px-1.5 py-0.5 rounded-full border ${
                            task.priority === 'Urgent' ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300' :
                            task.priority === 'High' ? 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/50 dark:border-orange-700 dark:text-orange-300' :
                            task.priority === 'Medium' ? 'bg-yellow-100 border-yellow-300 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300' :
                            'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300'
                        }`}>{task.priority}</span>}
                     </Card>
                  ))}
                   {tasks.filter(t => t.status.toLowerCase().replace(/\s+/g, '-') === status.toLowerCase().replace(/\s+/g, '-')).length === 0 && (
                     <p className="text-xs text-muted-foreground text-center py-4">No tasks in {status}.</p>
                   )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Full Kanban board with drag-and-drop and detailed task cards coming soon. Click on a task card to edit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
