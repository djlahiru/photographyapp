'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting task details (assignee and due date)
 * based on the task description and past project history.
 *
 * @exports {
 *   suggestTaskDetails,
 *   SuggestTaskDetailsInput,
 *   SuggestTaskDetailsOutput,
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskDetailsInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The description of the task for which to suggest details.'),
  pastProjectHistory: z
    .string()
    .describe('The past project history, which may contain details of previous assignees and due dates.'),
});
export type SuggestTaskDetailsInput = z.infer<typeof SuggestTaskDetailsInputSchema>;

const SuggestTaskDetailsOutputSchema = z.object({
  suggestedAssignee: z
    .string()
    .describe('The suggested assignee for the task, based on the task description and past project history.'),
  suggestedDueDate: z
    .string()
    .describe('The suggested due date for the task, based on the task description and past project history.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested assignee and due date.'),
});
export type SuggestTaskDetailsOutput = z.infer<typeof SuggestTaskDetailsOutputSchema>;

export async function suggestTaskDetails(input: SuggestTaskDetailsInput): Promise<SuggestTaskDetailsOutput> {
  return suggestTaskDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTaskDetailsPrompt',
  input: {schema: SuggestTaskDetailsInputSchema},
  output: {schema: SuggestTaskDetailsOutputSchema},
  prompt: `Based on the following task description and past project history, suggest an assignee and a due date for the task.

Task Description: {{{taskDescription}}}

Past Project History: {{{pastProjectHistory}}}

Consider the past project history to identify the most suitable assignee and a realistic due date.
Explain your reasoning for the suggested assignee and due date.

Output your response as a JSON object.
`,
});

const suggestTaskDetailsFlow = ai.defineFlow(
  {
    name: 'suggestTaskDetailsFlow',
    inputSchema: SuggestTaskDetailsInputSchema,
    outputSchema: SuggestTaskDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
