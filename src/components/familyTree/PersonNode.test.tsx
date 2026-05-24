import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PersonNode } from '@/components/familyTree/PersonNode';
import { type PersonNodeLayout } from '@/components/familyTree/types';
import { type Person, Sex } from '@/schemas/personSchema';
import { renderWithProvider } from '@/test/renderWithProvider';

const ID = '12345678-1234-4234-9234-123456789012';

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
    ...overrides,
  };
}

const NODE_LAYOUT: PersonNodeLayout = {
  personId: ID,
  x: 0,
  y: 0,
  width: 120,
  height: 76,
  showFamilyName: true,
};

function renderNode(props: {
  person?: Person;
  onClick?: (id: string) => void;
  node?: PersonNodeLayout;
}): void {
  const person = props.person ?? makePerson();
  renderWithProvider(
    <svg>
      <PersonNode
        node={props.node ?? NODE_LAYOUT}
        onClick={props.onClick}
        person={person}
      />
    </svg>,
  );
}

describe('PersonNode', () => {
  it('生存中の人物はフルオパシティ (rect の fill-opacity が 1)', () => {
    renderNode({ person: makePerson({ death: '' }) });
    const rect = document.querySelector('rect');
    expect(rect?.getAttribute('fill-opacity')).toBe('1');
  });

  it('故人は rect が DECEASED 用の半透明になる', () => {
    renderNode({ person: makePerson({ death: '2020-01-01' }) });
    const rect = document.querySelector('rect');
    expect(rect?.getAttribute('fill-opacity')).toBe('0.45');
  });

  it('onClick 未指定なら button role を持たない (純粋な装飾)', () => {
    renderNode({});
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('onClick 指定時は button role + aria-label + tabIndex でアクセシブル', () => {
    renderNode({ onClick: vi.fn() });
    const button = screen.getByRole('button', { name: '山田 太郎' });
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('クリックすると onClick が person.id 付きで呼ばれる', async() => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderNode({ onClick });
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledExactlyOnceWith(ID);
  });

  it('Enter キーでも onClick が発火する', async() => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderNode({ onClick });
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledExactlyOnceWith(ID);
  });

  it('maidenName が指定されている人物は「(旧姓 X)」が併記される', () => {
    renderNode({ person: makePerson({ maidenName: '鈴木' }) });
    expect(screen.getByText('(旧姓 鈴木)')).toBeInTheDocument();
  });

  it('maidenName 未指定なら「旧姓」表示は出ない', () => {
    renderNode({ person: makePerson({ maidenName: undefined }) });
    expect(screen.queryByText(/旧姓/u)).not.toBeInTheDocument();
  });

  it('showFamilyName=false なら maidenName があっても表示しない', () => {
    renderNode({
      person: makePerson({ maidenName: '鈴木' }),
      node: { ...NODE_LAYOUT,
        showFamilyName: false },
    });
    expect(screen.queryByText(/旧姓/u)).not.toBeInTheDocument();
  });
});
