import { computeShowFamilyNameMap } from '@/components/familyTree/layout/familyNameVisibility';
import { type ParentLink } from '@/components/familyTree/layout/internalTypes';
import { type Person, Sex } from '@/schemas/personSchema';
import { describe, expect, it } from 'vitest';

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
    const people = [makePerson('a', '山田')];
    const childToParents = new Map<string, ParentLink[]>();
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get('a')).toBe(true);
  });

  it('親と同姓なら姓を省略する (false)', () => {
    const people = [
      makePerson('parent', '山田'),
      makePerson('child', '山田'),
    ];
    const childToParents = new Map<string, ParentLink[]>();
    childToParents.set('child', [link('parent')]);
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get('child')).toBe(false);
    expect(result.get('parent')).toBe(true);
  });

  it('親と他姓なら姓を表示する (true)', () => {
    const people = [
      makePerson('parent', '鈴木'),
      makePerson('child', '山田'),
    ];
    const childToParents = new Map<string, ParentLink[]>();
    childToParents.set('child', [link('parent')]);
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get('child')).toBe(true);
  });

  it('複数の親のうち 1 人でも同姓なら姓を省略する (false)', () => {
    const people = [
      makePerson('mother', '鈴木'),
      makePerson('father', '山田'),
      makePerson('child', '山田'),
    ];
    const childToParents = new Map<string, ParentLink[]>();
    childToParents.set('child', [link('mother'), link('father')]);
    const result = computeShowFamilyNameMap(people, childToParents);
    expect(result.get('child')).toBe(false);
  });
});
