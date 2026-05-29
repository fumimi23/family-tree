import { z } from 'zod';

export const RelationType = {
  PARENT_CHILD: 'parent-child',
  PARENT_ADOPTED_CHILD: 'parent-adopted-child',
  MARRIED_COUPLE: 'married-couple',
  COUPLE: 'couple',
} as const;

export type RelationType = typeof RelationType[keyof typeof RelationType];

export const HouseholdSide = {
  PERSON1: 'person1',
  PERSON2: 'person2',
} as const;

export type HouseholdSide = typeof HouseholdSide[keyof typeof HouseholdSide];

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

const MARRIAGE_RELATION_TYPES: string[] = [RelationType.MARRIED_COUPLE, RelationType.COUPLE];

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
  // 婚姻 (married-couple / couple) の解消フラグ。親子関係では指定不可。
  divorced: z.boolean().optional()
    .describe('離婚済み'),

  /*
   * 家系を継ぐ側 (= レイアウトで自分の親系統を primary にする側)。婚姻関係でのみ指定可。
   * 未指定なら従来どおり personId1 側が primary になる。
   * 値のタプルを直接渡し、出力型を 'person1' | 'person2' の union に保つ。
   */
  householdSide: z.enum([HouseholdSide.PERSON1, HouseholdSide.PERSON2]).optional()
    .describe('家系を継ぐ側'),
}).superRefine((val, ctx) => {
  const isMarriage = val.relationType.length > 0
    && MARRIAGE_RELATION_TYPES.includes(val.relationType[0]);
  if (val.divorced !== undefined && !isMarriage) {
    ctx.addIssue({
      code: 'custom',
      message: '離婚フラグは婚姻関係 (夫婦 / 事実婚) でのみ指定できます。',
      path: ['divorced'],
    });
  }
  if (val.householdSide !== undefined && !isMarriage) {
    ctx.addIssue({
      code: 'custom',
      message: '家系を継ぐ側は婚姻関係 (夫婦 / 事実婚) でのみ指定できます。',
      path: ['householdSide'],
    });
  }
});

export type Relation = z.infer<typeof relationSchema>;
