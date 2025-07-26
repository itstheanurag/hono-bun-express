import { z } from 'zod';

export const bookCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publishedYear: z
    .number()
    .int()
    .min(1000, 'Enter a valid year')
    .max(9999, 'Enter a valid year')
    .optional(),
  totalSales: z
    .number()
    .int()
    .min(0, 'Sales cannot be negative')
    .optional(),
});

export const updateBookSchema = bookCreateSchema.partial();

export const findByIdSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const searchQuerySchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  minYear: z
    .string()
    .regex(/^\d{4}$/, 'Year must be a 4-digit number')
    .optional(),
  maxYear: z
    .string()
    .regex(/^\d{4}$/, 'Year must be a 4-digit number')
    .optional(),
  minSales: z
    .string()
    .regex(/^\d+$/, 'Sales must be a non-negative number')
    .optional(),
  maxSales: z
    .string()
    .regex(/^\d+$/, 'Sales must be a non-negative number')
    .optional(),
});

export type BookCreateInput = z.infer<typeof bookCreateSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type FindByIdInput = z.infer<typeof findByIdSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;