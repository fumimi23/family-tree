import { z } from 'zod';

const relationTypeSchema = z.union([
  z.literal('parent-child').describe('親子'),
  z.literal('married-couple').describe('夫婦'),
  z.literal('couple').describe('事実婚'),
]).describe('関係性タイプ');

export type RelationType = z.infer<typeof relationTypeSchema>;

export const relationSchema = z.object({
  id: z.string().uuid()
    .describe('ID'),
  relationType: relationTypeSchema,
  personId1: z.string().uuid()
    .describe('人物1'),
  personId2: z.string().uuid()
    .describe('人物2'),
});

export type Relation = z.infer<typeof relationSchema>;
