import { personSchema } from '@/schemas/personSchema';
import { relationSchema } from '@/schemas/relationSchema';
import { z } from 'zod';

export const importJsonSchema = z.object({
  people: z.array(personSchema),
  relations: z.array(relationSchema),
});

export type ImportJson = z.infer<typeof importJsonSchema>;
