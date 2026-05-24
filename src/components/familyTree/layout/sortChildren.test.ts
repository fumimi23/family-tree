import { describe, expect, it } from 'vitest';

import {
  type ParentLink,
  type Unit,
} from '@/components/familyTree/layout/internalTypes';
import { sortChildrenByBirth } from '@/components/familyTree/layout/sortChildren';
import { type Person, Sex } from '@/schemas/personSchema';

const ID = {
  PARENT: '11111111-1111-4111-8111-111111111111',
  YOUNGER: '22222222-2222-4222-8222-222222222222',
  ELDER: '33333333-3333-4333-8333-333333333333',
  NO_BIRTH: '44444444-4444-4444-8444-444444444444',
} as const;

function makePerson(id: string, birth: string): Person {
  return {
    id,
    familyName: '姓',
    givenName: '名',
    familyNameKana: 'カナ',
    givenNameKana: 'カナ',
    sex: Sex.UNKNOWN,
    birth,
    death: '',
  };
}

function singleUnit(id: string, personId: string): Unit {
  return {
    id,
    type: 'single',
    personIds: [personId],
    marriageRelationId: null,
    marriageType: null,
    generation: 0,
  };
}

function link(parentId: string): ParentLink {
  return {
    parentId,
    adopted: false,
  };
}

describe('sortChildrenByBirth', () => {
  it('生年月日が新しい (= 若い) ほど先頭、古い (= 年長) ほど末尾になる', () => {
    const parent = singleUnit('u-parent', ID.PARENT);
    const younger = singleUnit('u-younger', ID.YOUNGER);
    const elder = singleUnit('u-elder', ID.ELDER);
    const unitMap = new Map([
      [parent.id, parent],
      [younger.id, younger],
      [elder.id, elder],
    ]);
    const childToParents = new Map([
      [ID.YOUNGER, [link(ID.PARENT)]],
      [ID.ELDER, [link(ID.PARENT)]],
    ]);
    const personMap = new Map([
      [ID.YOUNGER, makePerson(ID.YOUNGER, '2010-01-01')],
      [ID.ELDER, makePerson(ID.ELDER, '2000-01-01')],
    ]);
    const childrenOfUnit = new Map([[parent.id, [elder.id, younger.id]]]);
    sortChildrenByBirth(childrenOfUnit, unitMap, childToParents, personMap);
    expect(childrenOfUnit.get(parent.id)).toEqual([younger.id, elder.id]);
  });

  it('生年月日不明 (空文字) は先頭側に並ぶ', () => {
    const parent = singleUnit('u-parent', ID.PARENT);
    const known = singleUnit('u-known', ID.YOUNGER);
    const unknown = singleUnit('u-unknown', ID.NO_BIRTH);
    const unitMap = new Map([
      [parent.id, parent],
      [known.id, known],
      [unknown.id, unknown],
    ]);
    const childToParents = new Map([
      [ID.YOUNGER, [link(ID.PARENT)]],
      [ID.NO_BIRTH, [link(ID.PARENT)]],
    ]);
    const personMap = new Map([
      [ID.YOUNGER, makePerson(ID.YOUNGER, '2000-01-01')],
      [ID.NO_BIRTH, makePerson(ID.NO_BIRTH, '')],
    ]);
    const childrenOfUnit = new Map([[parent.id, [known.id, unknown.id]]]);
    sortChildrenByBirth(childrenOfUnit, unitMap, childToParents, personMap);
    expect(childrenOfUnit.get(parent.id)).toEqual([unknown.id, known.id]);
  });

  it('親ユニットが存在しなければソートをスキップする', () => {
    const childrenOfUnit = new Map([['missing-parent', ['a', 'b']]]);
    sortChildrenByBirth(childrenOfUnit, new Map(), new Map(), new Map());
    expect(childrenOfUnit.get('missing-parent')).toEqual(['a', 'b']);
  });
});
