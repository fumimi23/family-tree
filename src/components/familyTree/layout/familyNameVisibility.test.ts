import { computeShowFamilyNameMap } from '@/components/familyTree/layout/familyNameVisibility';
import { type ParentLink } from '@/components/familyTree/layout/internalTypes';
import { type Person, Sex } from '@/schemas/personSchema';
import { describe, expect, it } from 'vitest';

const ID = {
  PARENT: '11111111-1111-4111-8111-111111111111',
  CHILD: '22222222-2222-4222-8222-222222222222',
  MOTHER: '33333333-3333-4333-8333-333333333333',
  FATHER: '44444444-4444-4444-8444-444444444444',
} as const;

function makePerson(id: string, familyName: string): Person {
  return {
    id,
    familyName,
    givenName: '名',
    familyNameKana: 'カナ',
    givenNameKana: 'カナ',
    sex: Sex.UNKNOWN,
    birth: '',
    death: '',
  };
}

function link(parentId: string): ParentLink {
  return {
    parentId,
    adopted: false,
  };
}

describe('computeShowFamilyNameMap', () => {
  it('親不在の人物は姓を表示する (true)', () => {
    const people = [makePerson(ID.PARENT, '山田')];
    const childToParents = new Map<string, ParentLink[]>();
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get(ID.PARENT)).toBe(true);
  });

  it('親と同姓なら姓を省略する (false)', () => {
    const people = [
      makePerson(ID.PARENT, '山田'),
      makePerson(ID.CHILD, '山田'),
    ];
    const childToParents = new Map<string, ParentLink[]>();
    childToParents.set(ID.CHILD, [link(ID.PARENT)]);
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get(ID.CHILD)).toBe(false);
    expect(result.get(ID.PARENT)).toBe(true);
  });

  it('親と他姓なら姓を表示する (true)', () => {
    const people = [
      makePerson(ID.PARENT, '鈴木'),
      makePerson(ID.CHILD, '山田'),
    ];
    const childToParents = new Map<string, ParentLink[]>();
    childToParents.set(ID.CHILD, [link(ID.PARENT)]);
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get(ID.CHILD)).toBe(true);
  });

  it('複数の親のうち 1 人でも同姓なら姓を省略する (false)', () => {
    const people = [
      makePerson(ID.MOTHER, '鈴木'),
      makePerson(ID.FATHER, '山田'),
      makePerson(ID.CHILD, '山田'),
    ];
    const childToParents = new Map<string, ParentLink[]>();
    childToParents.set(ID.CHILD, [link(ID.MOTHER), link(ID.FATHER)]);
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get(ID.CHILD)).toBe(false);
  });
});
