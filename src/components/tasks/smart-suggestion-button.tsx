
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'react-feather'; // Was Sparkles
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { suggestTaskDetails, type SuggestTaskDetailsInput, type SuggestTaskDetailsOutput } from '@/ai/flows/suggest-task-details';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function SmartSuggestionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [projectHistory, setProjectHistory] = useState('');
  const [suggestion, setSuggestion] = useState<SuggestTaskDetailsOutput | null>(null);
  
  const handleSubmit = async () => {
    if (!taskDescription.trim()) {
      toast.error('Task description cannot be empty.');
      return;
    }

    setIsLoading(true);
    setSuggestion(null);
    try {
      const input: SuggestTaskDetailsInput = {
        taskDescription,
        pastProjectHistory: projectHistory || "No specific project history provided for this suggestion.",
      };
      const result = await suggestTaskDetails(input);
      setSuggestion(result);
      toast.success('Suggestions Ready! AI has generated task details.');
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Zap className="mr-2 h-4 w-4 text-accent" />
        Smart Suggest
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-accent" />
              AI Task Suggestions
            </DialogTitle>
            <DialogDescription>
              Let AI suggest an assignee and due date based on the task and project context.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Task Description</Label>
              <Textarea
                id="taskDescription"
                placeholder="e.g., Design new landing page mockups"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectHistory">Past Project History (Optional)</Label>
              <Textarea
                id="projectHistory"
                placeholder="e.g., John usually handles UI design tasks and delivers within 3 days. Similar tasks took 2-4 days."
                value={projectHistory}
                onChange={(e) => setProjectHistory(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {suggestion && (
            <Card className="mt-4 bg-accent/10 border-accent/30">
              <CardHeader>
                <CardTitle className="text-md font-headline">Suggested Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Assignee:</strong> {suggestion.suggestedAssignee}</p>
                <p><strong>Due Date:</strong> {suggestion.suggestedDueDate}</p>
                <p className="text-muted-foreground"><strong>Reasoning:</strong> {suggestion.reasoning}</p>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => { setSuggestion(null); setTaskDescription(''); setProjectHistory(''); }}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit} disabled={isLoading || !taskDescription.trim()}>
              {isLoading ? 'Getting Suggestions...' : 'Get Suggestions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
