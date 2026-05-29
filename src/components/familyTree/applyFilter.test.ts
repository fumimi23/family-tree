import { describe, expect, it } from 'vitest';

import { applyFilter } from '@/components/familyTree/applyFilter';
import { type Person, Sex } from '@/schemas/personSchema';
import { type Relation, RelationType } from '@/schemas/relationSchema';

const ID = {
  GP_FATHER: 'aaaaaaaa-0000-4000-8000-000000000001',
  GP_MOTHER: 'aaaaaaaa-0000-4000-8000-000000000002',
  P_FATHER: 'bbbbbbbb-0000-4000-8000-000000000001',
  P_MOTHER: 'bbbbbbbb-0000-4000-8000-000000000002',
  ME: 'cccccccc-0000-4000-8000-000000000001',
  SPOUSE: 'cccccccc-0000-4000-8000-000000000002',
  CHILD: 'dddddddd-0000-4000-8000-000000000001',
  OUTSIDER: 'eeeeeeee-0000-4000-8000-000000000001',
} as const;

function person(id: string): Person {
  return {
    id,
    familyName: '山田',
    givenName: '名',
    familyNameKana: 'ヤマダ',
    givenNameKana: 'ナ',
    sex: Sex.UNKNOWN,
    birth: '',
    death: '',
  };
}

function parentRel(id: string, parent: string, child: string): Relation {
  return {
    id,
    relationType: [RelationType.PARENT_CHILD],
    persons: {
      personId1: [parent],
      personId2: [child],
    },
  };
}

function marriedRel(id: string, p1: string, p2: string): Relation {
  return {
    id,
    relationType: [RelationType.MARRIED_COUPLE],
    persons: {
      personId1: [p1],
      personId2: [p2],
    },
  };
}

const people = [
  person(ID.GP_FATHER),
  person(ID.GP_MOTHER),
  person(ID.P_FATHER),
  person(ID.P_MOTHER),
  person(ID.ME),
  person(ID.SPOUSE),
  person(ID.CHILD),
  person(ID.OUTSIDER),
];

const relations: Relation[] = [
  // 祖父母世代
  marriedRel('m-gp', ID.GP_FATHER, ID.GP_MOTHER),
  // 親世代
  marriedRel('m-p', ID.P_FATHER, ID.P_MOTHER),
  // 祖父母 → 父
  parentRel('par-gpf-pf', ID.GP_FATHER, ID.P_FATHER),
  parentRel('par-gpm-pf', ID.GP_MOTHER, ID.P_FATHER),
  // 親 → 私
  parentRel('par-pf-me', ID.P_FATHER, ID.ME),
  parentRel('par-pm-me', ID.P_MOTHER, ID.ME),
  // 私と配偶者
  marriedRel('m-me', ID.ME, ID.SPOUSE),
  // 私と配偶者 → 子
  parentRel('par-me-c', ID.ME, ID.CHILD),
  parentRel('par-s-c', ID.SPOUSE, ID.CHILD),
];

describe('applyFilter', () => {
  it('criteria=null なら無加工で返す', () => {
    const result = applyFilter(people, relations, null);
    expect(result.people).toHaveLength(8);
    expect(result.relations).toHaveLength(9);
  });

  it('scope=ancestors: 起点+祖先+それぞれの配偶者のみ', () => {
    const result = applyFilter(people, relations, {
      focusPersonId: ID.ME,
      scope: 'ancestors',
    });
    const ids = result.people.map((p) => p.id).sort();
    // 起点 = ME, ancestors = P_FATHER, GP_FATHER (経路上). 配偶者として P_MOTHER, GP_MOTHER, SPOUSE
    expect(ids).toEqual([
      ID.GP_FATHER,
      ID.GP_MOTHER,
      ID.P_FATHER,
      ID.P_MOTHER,
      ID.ME,
      ID.SPOUSE,
    ].sort());
    // CHILD と OUTSIDER は含まれない
    expect(ids).not.toContain(ID.CHILD);
    expect(ids).not.toContain(ID.OUTSIDER);
  });

  it('scope=descendants: 起点+子孫+配偶者', () => {
    const result = applyFilter(people, relations, {
      focusPersonId: ID.ME,
      scope: 'descendants',
    });
    const ids = result.people.map((p) => p.id).sort();
    expect(ids).toEqual([ID.ME, ID.SPOUSE, ID.CHILD].sort());
  });

  it('scope=both: 起点+祖先+子孫+各々の配偶者', () => {
    const result = applyFilter(people, relations, {
      focusPersonId: ID.ME,
      scope: 'both',
    });
    const ids = result.people.map((p) => p.id).sort();
    expect(ids).toContain(ID.GP_FATHER);
    expect(ids).toContain(ID.ME);
    expect(ids).toContain(ID.CHILD);
    expect(ids).not.toContain(ID.OUTSIDER);
  });

  it('対象 personIds 外を参照する relation は除外される', () => {
    const result = applyFilter(people, relations, {
      focusPersonId: ID.ME,
      scope: 'descendants',
    });
    // 祖父母世代の婚姻 (m-gp) は除外、子の親子関係 (par-me-c, par-s-c) と私の婚姻 (m-me) は残る
    const ids = result.relations.map((r) => r.id).sort();
    expect(ids).toEqual(['m-me', 'par-me-c', 'par-s-c'].sort());
  });

  it('削除済み人物を経由した辿りでその先の親類を含めない', () => {
    /*
     * P_FATHER が削除されたが par-gpf-pf / par-gpm-pf / par-pf-me などの relation は残っている状態。
     * 起点 = ME で祖先方向に辿るとき、削除済みの P_FATHER を経由して GP_FATHER / GP_MOTHER に
     * 到達してしまわないことを検証する。
     */
    const peopleWithoutFather = people.filter((p) => p.id !== ID.P_FATHER);
    const result = applyFilter(peopleWithoutFather, relations, {
      focusPersonId: ID.ME,
      scope: 'ancestors',
    });
    const ids = result.people.map((p) => p.id);
    expect(ids).not.toContain(ID.GP_FATHER);
    expect(ids).not.toContain(ID.GP_MOTHER);
    // 母 (P_MOTHER) と起点 (ME) は残る (P_MOTHER は別経路で繋がっている)
    expect(ids).toContain(ID.P_MOTHER);
    expect(ids).toContain(ID.ME);
  });

  it('relations にだけ残っていて people に無い id は filteredRelations に含めない', () => {
    /*
     * 親 (P_FATHER) が削除された状態 (people には居ないが、par-pf-me / par-gpf-pf 等の
     * relation には残っている) を模擬する。
     */
    const peopleWithoutFather = people.filter((p) => p.id !== ID.P_FATHER);
    const result = applyFilter(peopleWithoutFather, relations, {
      focusPersonId: ID.ME,
      scope: 'ancestors',
    });
    // P_FATHER が両端のいずれかになる relation は含まれない
    const referencesFather = result.relations.some((r) => {
      return r.persons.personId1[0] === ID.P_FATHER
        || r.persons.personId2[0] === ID.P_FATHER;
    });
    expect(referencesFather).toBe(false);
    // people 側にも P_FATHER は居ない
    expect(result.people.some((p) => p.id === ID.P_FATHER)).toBe(false);
  });
});
