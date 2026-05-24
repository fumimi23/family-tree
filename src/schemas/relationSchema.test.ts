import { describe, expect, it } from 'vitest';

import { relationSchema, RelationType } from '@/schemas/relationSchema';

const P1 = '11111111-1111-4111-8111-111111111111';
const P2 = '22222222-2222-4222-8222-222222222222';
const REL_ID = 'aaaaaaaa-0000-4000-8000-000000000001';

describe('relationSchema divorced refinement', () => {
  it('夫婦に divorced を指定するのは OK', () => {
    const result = relationSchema.safeParse({
      id: REL_ID,
      relationType: [RelationType.MARRIED_COUPLE],
      persons: { personId1: [P1],
        personId2: [P2] },
      divorced: true,
    });
    expect(result.success).toBe(true);
  });

  it('事実婚に divorced を指定するのも OK', () => {
    const result = relationSchema.safeParse({
      id: REL_ID,
      relationType: [RelationType.COUPLE],
      persons: { personId1: [P1],
        personId2: [P2] },
      divorced: false,
    });
    expect(result.success).toBe(true);
  });

  it('親子関係 (parent-child) に divorced を指定するとエラー', () => {
    const result = relationSchema.safeParse({
      id: REL_ID,
      relationType: [RelationType.PARENT_CHILD],
      persons: { personId1: [P1],
        personId2: [P2] },
      divorced: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['divorced']);
    }
  });

  it('親子 (養子) 関係に divorced を指定するとエラー', () => {
    const result = relationSchema.safeParse({
      id: REL_ID,
      relationType: [RelationType.PARENT_ADOPTED_CHILD],
      persons: { personId1: [P1],
        personId2: [P2] },
      divorced: true,
    });
    expect(result.success).toBe(false);
  });

  it('divorced を未指定なら全リレーションタイプで通る', () => {
    for (const t of Object.values(RelationType)) {
      const result = relationSchema.safeParse({
        id: REL_ID,
        relationType: [t],
        persons: { personId1: [P1],
          personId2: [P2] },
      });
      expect(result.success).toBe(true);
    }
  });
});
