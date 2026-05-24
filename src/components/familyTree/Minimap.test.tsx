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
      showFamilyName: true,
    },
  ],
  marriageEdges: [],
  secondaryMarriageEdges: [],
  parentGroups: [],
  secondaryParentEdges: [],
  generationRows: [],
  width: 1000,
  height: 800,
};

const CONTAINER_CLIENT_WIDTH = 800;
const CONTAINER_CLIENT_HEIGHT = 600;

function MinimapHarness({ scrollTo }: { scrollTo: ReturnType<typeof vi.fn> }): React.ReactNode {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (el === null) {
      return;
    }
    Object.defineProperty(el, 'clientWidth', {
      configurable: true,
      writable: true,
      value: CONTAINER_CLIENT_WIDTH,
    });
    Object.defineProperty(el, 'clientHeight', {
      configurable: true,
      writable: true,
      value: CONTAINER_CLIENT_HEIGHT,
    });
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

// minimap SVG の getBoundingClientRect を、(0,0) 起点で width×height を持つ矩形に差し替える。
function stubBoundingRect(el: Element, width: number, height: number): void {
  el.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON: () => ({}),
  });
}

const LABELS_WIDTH = 64;

describe('Minimap', () => {
  it('描画されると button role + aria-label を持つ', () => {
    renderWithProvider(<MinimapHarness scrollTo={vi.fn()} />);
    const minimap = screen.getByRole('button', { name: /ミニマップ/u });
    expect(minimap).toBeInTheDocument();
  });

  it('クリック位置を layout 座標に変換して containerRef.scrollTo にスクロールを依頼する', () => {
    const scrollTo = vi.fn();
    renderWithProvider(<MinimapHarness scrollTo={scrollTo} />);
    const minimap = screen.getByRole('button', { name: /ミニマップ/u });
    // minimap が 200x160 で描画されているとみなし、その中央をクリックする想定
    const MINIMAP_W = 200;
    const MINIMAP_H = 160;
    stubBoundingRect(minimap, MINIMAP_W, MINIMAP_H);
    fireEvent.click(minimap, {
      clientX: MINIMAP_W / 2,
      clientY: MINIMAP_H / 2,
    });

    /*
     * layout 座標は中央 → (LAYOUT.width/2, LAYOUT.height/2) = (500, 400)
     * visibleTreeWidth = clientWidth - LABELS_WIDTH = 800 - 64 = 736
     * targetLeft = 500 - 736/2 = 132、targetTop = 400 - 600/2 = 100
     */
    const expectedLeft = (LAYOUT.width / 2) - ((CONTAINER_CLIENT_WIDTH - LABELS_WIDTH) / 2);
    const expectedTop = (LAYOUT.height / 2) - (CONTAINER_CLIENT_HEIGHT / 2);
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
      left: expectedLeft,
      top: expectedTop,
      behavior: 'smooth',
    });
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
