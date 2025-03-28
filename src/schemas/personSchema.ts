import { z } from 'zod';

export const personSchema = z.object({
  id: z.string().uuid()
    .describe('ID'),
  familyName: z.string().min(1)
    .describe('姓'),
  givenName: z.string().min(1)
    .describe('名'),
  familyNameKana: z.string().min(1)
    .describe('姓（カナ）'),
  givenNameKana: z.string().min(1)
    .describe('名（カナ）'),
  birth: z.union([
    z.string().date(),
    z.literal(''),
  ])
    .describe('生年月日'),
  death: z.union([
    z.string().date(),
    z.literal(''),
  ])
    .describe('没年月日'),
  posthumousName: z.string().optional()
    .describe('戒名'),
});

export type Person = z.infer<typeof personSchema>;
