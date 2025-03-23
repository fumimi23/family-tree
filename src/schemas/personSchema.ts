import { z } from 'zod';

export const personSchema = z.object({
  id: z.string().uuid()
    .describe('ID'),
  familyName: z.string().describe('姓'),
  givenName: z.string().describe('名'),
  familyNameKana: z.string().describe('姓（カナ）'),
  givenNameKana: z.string().describe('名（カナ）'),
  birth: z.string().nullable()
    .describe('生年月日'),
  death: z.string().nullable()
    .describe('没年月日'),
  posthumousName: z.string().nullable()
    .describe('戒名'),
});

export type Person = z.infer<typeof personSchema>;
