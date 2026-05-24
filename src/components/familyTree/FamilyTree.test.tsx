import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/*
 * 本テストでは FamilyTree → PersonDialog 遷移を検証するが、
 * PersonDialog の中身は別途 PersonDialog.test.tsx で検証済み。
 * Dialog 内部の Chakra RadioGroup が jsdom 環境で @zag-js focus-visible の
 * `prototype.focus` 上書きに失敗するため、PersonDialog をシンプルなマーカに置き換える。
 */
vi.mock('@/components/person/PersonDialog', () => {
  interface Props {
    person?: { familyName: string;
      givenName: string; };
  }
  function PersonDialog({ person }: Props): React.ReactNode {
    if (person === undefined) {
      return null;
    }
    return (
      <div data-testid="person-dialog">
        {`${person.familyName} ${person.givenName}`}
      </div>
    );
  }
  return { PersonDialog };
});

import { FamilyTree } from '@/components/familyTree/FamilyTree';
import { type Person, Sex } from '@/schemas/personSchema';
import { type Relation, RelationType } from '@/schemas/relationSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';
import { renderWithProvider } from '@/test/renderWithProvider';

const HUSBAND: Person = {
  id: '11111111-1111-4111-8111-111111111111',
  familyName: '山田',
  givenName: '太郎',
  familyNameKana: 'ヤマダ',
  givenNameKana: 'タロウ',
  sex: Sex.MALE,
  birth: '1970-01-01',
  death: '',
};

const WIFE: Person = {
  id: '22222222-2222-4222-8222-222222222222',
  familyName: '山田',
  givenName: '花子',
  familyNameKana: 'ヤマダ',
  givenNameKana: 'ハナコ',
  sex: Sex.FEMALE,
  birth: '1972-01-01',
  death: '',
};

const MARRIAGE: Relation = {
  id: 'aaaaaaaa-0000-4000-8000-000000000001',
  relationType: [RelationType.MARRIED_COUPLE],
  persons: {
    personId1: [HUSBAND.id],
    personId2: [WIFE.id],
  },
};

describe('FamilyTree', () => {
  beforeEach(() => {
    usePeopleStore.setState({ people: [] });
    useRelationStore.setState({ relations: [] });
  });

  afterEach(() => {
    usePeopleStore.setState({ people: [] });
    useRelationStore.setState({ relations: [] });
  });

  it('人物 0 件のときは案内メッセージを表示する', () => {
    renderWithProvider(<FamilyTree />);
    expect(screen.getByText('人物を追加すると家系図が表示されます。')).toBeInTheDocument();
  });

  it('人物がいると SVG ノードとして描画される', () => {
    usePeopleStore.setState({ people: [HUSBAND, WIFE] });
    useRelationStore.setState({ relations: [MARRIAGE] });
    renderWithProvider(<FamilyTree />);
    expect(screen.getByRole('button', { name: '山田 太郎' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '山田 花子' })).toBeInTheDocument();
  });

  it('ノードクリックで該当人物の PersonDialog が開く', async() => {
    usePeopleStore.setState({ people: [HUSBAND] });
    const user = userEvent.setup();
    renderWithProvider(<FamilyTree />);
    expect(screen.queryByTestId('person-dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '山田 太郎' }));
    const dialog = await screen.findByTestId('person-dialog');
    expect(dialog).toHaveTextContent('山田 太郎');
  });
});
