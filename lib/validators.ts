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