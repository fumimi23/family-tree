import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PersonDialog } from '@/components/person/PersonDialog';
import { type Person, Sex } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { renderWithProvider } from '@/test/renderWithProvider';

const ID = 'abcdef12-3456-4789-9abc-def123456789';

function makePerson(overrides: Partial<Person> = {}): Person {
  return {
    id: ID,
    familyName: '山田',
    givenName: '太郎',
    familyNameKana: 'ヤマダ',
    givenNameKana: 'タロウ',
    sex: Sex.MALE,
    birth: '1980-01-01',
    death: '',
    posthumousName: '',
    ...overrides,
  };
}

describe('PersonDialog', () => {
  let confirmMock = vi.fn();
  beforeEach(() => {
    usePeopleStore.setState({ people: [] });
    confirmMock = vi.fn();
    window.confirm = confirmMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('person 未指定 (新規) は「人物追加」ヘッダで、削除ボタンを出さない', () => {
    renderWithProvider(
      <PersonDialog
        isOpen
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByText('人物追加')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument();
  });

  it('person 指定 (編集) は「人物編集」ヘッダで、削除ボタンが表示される', () => {
    renderWithProvider(
      <PersonDialog
        isOpen
        onOpenChange={vi.fn()}
        person={makePerson()}
      />,
    );
    expect(screen.getByText('人物編集')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
  });

  it('編集モードでは既存の値が入力欄に反映される', () => {
    renderWithProvider(
      <PersonDialog
        isOpen
        onOpenChange={vi.fn()}
        person={makePerson({ familyName: '田中' })}
      />,
    );
    const familyName = screen.getByPlaceholderText('姓');
    expect(familyName).toHaveValue('田中');
  });

  it('削除ボタン押下 → 確認 OK で store から人物が消える', async() => {
    const user = userEvent.setup();
    const person = makePerson();
    usePeopleStore.setState({ people: [person] });
    confirmMock.mockReturnValue(true);
    const onOpenChange = vi.fn();
    renderWithProvider(
      <PersonDialog
        isOpen
        onOpenChange={onOpenChange}
        person={person}
      />,
    );
    await user.click(screen.getByRole('button', { name: '削除' }));
    expect(usePeopleStore.getState().people).toEqual([]);
    expect(onOpenChange).toHaveBeenCalledWith({ open: false });
  });

  it('削除ボタン押下 → 確認 Cancel ならば store はそのまま', async() => {
    const user = userEvent.setup();
    const person = makePerson();
    usePeopleStore.setState({ people: [person] });
    confirmMock.mockReturnValue(false);
    renderWithProvider(
      <PersonDialog
        isOpen
        onOpenChange={vi.fn()}
        person={person}
      />,
    );
    await user.click(screen.getByRole('button', { name: '削除' }));
    expect(usePeopleStore.getState().people).toEqual([person]);
  });
});
