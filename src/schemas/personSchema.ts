import { z } from 'zod';

export const Sex = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  UNKNOWN: 'unknown',
} as const;

export type Sex = typeof Sex[keyof typeof Sex];

export const sexList = [
  {
    label: '男性',
    value: Sex.MALE,
  },
  {
    label: '女性',
    value: Sex.FEMALE,
  },
  {
    label: 'その他',
    value: Sex.OTHER,
  },
  {
    label: '不明',
    value: Sex.UNKNOWN,
  },
];

export const personSchema = z.object({
  id: z.uuid()
    .describe('ID'),
  familyName: z.string().min(1)
    .describe('姓'),
  givenName: z.string().min(1)
    .describe('名'),
  familyNameKana: z.string().min(1)
    .describe('姓（カナ）'),
  givenNameKana: z.string().min(1)
    .describe('名（カナ）'),
  sex: z.enum(Object.values(Sex) as [string, ...string[]])
    .describe('性別'),
  birth: z.union([
    z.iso.date(),
    z.literal(''),
  ])
    .describe('生年月日'),
  death: z.union([
    z.iso.date(),
    z.literal(''),
  ])
    .describe('没年月日'),
  posthumousName: z.string().optional()
    .describe('戒名'),
});

export type Person = z.infer<typeof personSchema>;
