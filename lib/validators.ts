// lib/validators.ts
import { z } from 'zod';

export const createTask = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  description: z
    .string()
    .max(1000, 'Description is too long')
    .optional(),
  dueDate: z
    .string()
    .datetime()
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});


export const createNote = z.object({
  content: z.string().min(1, 'A content is required').max(1024),
  pinned: z.boolean('pinned').default(false)
});

export const createQuickExpense = z.object({
  label: z.string().min(1, 'A label is required').max(200),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  category: z.enum(['food', 'transport', 'health', 'shopping', 'other']),
});
