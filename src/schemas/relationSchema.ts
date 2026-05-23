import { z } from 'zod';

export const RelationType = {
  PARENT_CHILD: 'parent-child',
  PARENT_ADOPTED_CHILD: 'parent-adopted-child',
  MARRIED_COUPLE: 'married-couple',
  COUPLE: 'couple',
} as const;

export type RelationType = typeof RelationType[keyof typeof RelationType];

export const relationTypeList = [
  {
    label: '親子(実子)',
    value: RelationType.PARENT_CHILD,
    person1Label: '親',
    person2Label: '実子',
  },
  {
    label: '親子(養子)',
    value: RelationType.PARENT_ADOPTED_CHILD,
    person1Label: '親',
    person2Label: '養子',
  },
  {
    label: '夫婦',
    value: RelationType.MARRIED_COUPLE,
    person1Label: '夫',
    person2Label: '妻',
  },
  {
    label: '事実婚',
    value: RelationType.COUPLE,
    person1Label: '夫',
    person2Label: '妻',
  },
];

export const relationSchema = z.object({
  id: z.uuid()
    .describe('ID'),
  relationType: z.array(
    z.enum(Object.values(RelationType) as [string, ...string[]]),
  ).max(1)
    .describe('関係タイプ'),
  persons: z.object({
    personId1: z.array(
      z.uuid(),
    ).max(1)
      .describe('人物1'),
    personId2: z.array(
      z.uuid(),
    ).max(1)
      .describe('人物2'),
  }).refine((val) => {
    const { personId1, personId2 } = val;
    return personId1.length !== personId2.length || personId1.length === 0 || personId1[0] !== personId2[0];
  }, {
    message: '同じ人物を指定することはできません。',
  }),
});

export type Relation = z.infer<typeof relationSchema>;
