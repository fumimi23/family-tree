import { describe, expect, it } from 'vitest';

import { personSchema, Sex } from '@/schemas/personSchema';

const PERSON_ID = '11111111-1111-4111-8111-111111111111';

function base(): Record<string, unknown> {
  return {
    id: PERSON_ID,
    familyName: '山田',
    givenName: '太郎',
    familyNameKana: 'ヤマダ',
    givenNameKana: 'タロウ',
    sex: Sex.UNKNOWN,
    birth: '',
    death: '',
  };
}

describe('personSchema maidenName', () => {
  it('未指定なら undefined のまま', () => {
    const result = personSchema.safeParse(base());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maidenName).toBeUndefined();
    }
  });

  it('空文字は undefined に正規化される', () => {
    const result = personSchema.safeParse({ ...base(),
      maidenName: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maidenName).toBeUndefined();
    }
  });

  it('非空文字はそのまま保持される', () => {
    const result = personSchema.safeParse({ ...base(),
      maidenName: '鈴木' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maidenName).toBe('鈴木');
    }
  });
});
