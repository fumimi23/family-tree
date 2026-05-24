import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Minimap } from '@/components/familyTree/Minimap';
import { type FamilyTreeLayout } from '@/components/familyTree/types';
import { renderWithProvider } from '@/test/renderWithProvider';

const LAYOUT: FamilyTreeLayout = {
  nodes: [
    {
      personId: 'p1',
      x: 0,
      y: 0,
      width: 120,
      height: 76,
    },
  ] as unknown as FamilyTreeLayout['nodes'],
  marriageEdges: [],
  parentGroups: [],
  secondaryParentEdges: [],
  generationRows: [],
  width: 1000,
  height: 800,
};

function MinimapHarness({ scrollTo }: { scrollTo: ReturnType<typeof vi.fn> }): React.ReactNode {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (el === null) {
      return;
    }
    Object.defineProperty(el, 'clientWidth', { value: 800 });
    Object.defineProperty(el, 'clientHeight', { value: 600 });
    el.scrollTo = scrollTo as unknown as HTMLElement['scrollTo'];
  }, [scrollTo]);
  return (
    <div>
      <div ref={ref} />

      <Minimap
        containerRef={ref}
        layout={LAYOUT}
        zoom={1}
      />
    </div>
  );
}

describe('Minimap', () => {
  it('描画されると button role + aria-label を持つ', () => {
    renderWithProvider(<MinimapHarness scrollTo={vi.fn()} />);
    const minimap = screen.getByRole('button', { name: /ミニマップ/u });
    expect(minimap).toBeInTheDocument();
  });

  it('クリックで containerRef.scrollTo が呼ばれる', () => {
    const scrollTo = vi.fn();
    renderWithProvider(<MinimapHarness scrollTo={scrollTo} />);
    const minimap = screen.getByRole('button', { name: /ミニマップ/u });
    // jsdom では getBoundingClientRect が 0 を返すので click 座標も 0 になる
    fireEvent.click(minimap, { clientX: 0,
      clientY: 0 });
    expect(scrollTo).toHaveBeenCalledTimes(1);
    const callArg = scrollTo.mock.calls[0][0] as { behavior: string };
    expect(callArg.behavior).toBe('smooth');
  });

  it('layout の幅/高さが 0 なら何も描画しない', () => {
    const emptyLayout: FamilyTreeLayout = {
      ...LAYOUT,
      width: 0,
      height: 0,
    };
    renderWithProvider(
      <Minimap
        containerRef={React.createRef()}
        layout={emptyLayout}
        zoom={1}
      />,
    );
    expect(screen.queryByRole('button', { name: /ミニマップ/u })).not.toBeInTheDocument();
  });
});
