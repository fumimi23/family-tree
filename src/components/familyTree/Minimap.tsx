import { LABELS_WIDTH } from '@/components/familyTree/layout/internalTypes';
import { type FamilyTreeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import { Box } from '@chakra-ui/react';
import React from 'react';

const MAX_MINIMAP_WIDTH = 240;
const MAX_MINIMAP_HEIGHT = 160;
const VIEWPORT_STROKE_PX = 2;

interface ScrollState {
  left: number;
  top: number;
  clientW: number;
  clientH: number;
}

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  layout: FamilyTreeLayout;
  zoom: number;
}

interface Dimensions {
  width: number;
  height: number;
}

function computeDimensions(layout: FamilyTreeLayout): Dimensions {
  if (layout.width === 0 || layout.height === 0) {
    return {
      width: 0,
      height: 0,
    };
  }
  const aspectRatio = layout.width / layout.height;
  let width = MAX_MINIMAP_WIDTH;
  let height = width / aspectRatio;
  if (height > MAX_MINIMAP_HEIGHT) {
    height = MAX_MINIMAP_HEIGHT;
    width = height * aspectRatio;
  }
  return {
    width,
    height,
  };
}

interface ViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function computeViewport(
  scrollState: ScrollState,
  zoom: number,
  layout: FamilyTreeLayout,
): ViewportRect {
  const visibleLeft = Math.max((scrollState.left - LABELS_WIDTH) / zoom, 0);
  const visibleTop = Math.max(scrollState.top / zoom, 0);
  const visibleW = Math.min(
    (scrollState.clientW - LABELS_WIDTH) / zoom,
    layout.width - visibleLeft,
  );
  const visibleH = Math.min(
    scrollState.clientH / zoom,
    layout.height - visibleTop,
  );
  return {
    x: visibleLeft,
    y: visibleTop,
    width: Math.max(visibleW, 0),
    height: Math.max(visibleH, 0),
  };
}

function sameState(a: ScrollState, b: ScrollState): boolean {
  return a.left === b.left
    && a.top === b.top
    && a.clientW === b.clientW
    && a.clientH === b.clientH;
}

function useScrollState(containerRef: React.RefObject<HTMLDivElement | null>): ScrollState {
  const [scrollState, setScrollState] = React.useState<ScrollState>({
    left: 0,
    top: 0,
    clientW: 0,
    clientH: 0,
  });
  React.useEffect(() => {
    const el = containerRef.current;
    if (el === null) {
      return undefined;
    }
    let rafId: number | null = null;
    const update = (): void => {
      if (rafId !== null) {
        return;
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const next: ScrollState = {
          left: el.scrollLeft,
          top: el.scrollTop,
          clientW: el.clientWidth,
          clientH: el.clientHeight,
        };
        setScrollState((prev) => (sameState(prev, next) ? prev : next));
      });
    };
    update();
    el.addEventListener('scroll', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      el.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [containerRef]);
  return scrollState;
}

export function Minimap({ containerRef, layout, zoom }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const dimensions = computeDimensions(layout);
  const scrollState = useScrollState(containerRef);
  const viewport = computeViewport(scrollState, zoom, layout);
  const navigateTo = React.useCallback((layoutX: number, layoutY: number): void => {
    const el = containerRef.current;
    if (el === null) {
      return;
    }
    const visibleTreeWidth = el.clientWidth - LABELS_WIDTH;
    const targetLeft = (layoutX * zoom) - (visibleTreeWidth / 2);
    const targetTop = (layoutY * zoom) - (el.clientHeight / 2);
    el.scrollTo({
      left: Math.max(targetLeft, 0),
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });
  }, [containerRef, zoom]);
  const handleClick = React.useCallback((e: React.MouseEvent<SVGSVGElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * layout.width;
    const y = ((e.clientY - rect.top) / rect.height) * layout.height;
    navigateTo(x, y);
  }, [layout.width, layout.height, navigateTo]);
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<SVGSVGElement>): void => {
    if (e.key !== 'Enter' && e.key !== ' ') {
      return;
    }
    e.preventDefault();
    navigateTo(layout.width / 2, layout.height / 2);
  }, [layout.width, layout.height, navigateTo]);

  const nodeRects = React.useMemo(() => layout.nodes.map((node) => (
    <rect
      fill={theme.nodeStroke}
      height={node.height}
      key={node.personId}
      opacity={0.6}
      width={node.width}
      x={node.x}
      y={node.y}
    />
  )), [layout.nodes, theme.nodeStroke]);

  if (dimensions.width === 0) {
    return null;
  }
  const viewboxStroke = VIEWPORT_STROKE_PX * (layout.width / dimensions.width);
  return (
    <Box
      bg="bg"
      borderColor="border"
      borderRadius="md"
      borderWidth="1px"
      boxShadow="md"
      padding={1}
    >
      <svg
        aria-label="家系図のミニマップ。クリックして該当位置にスクロールします。"
        height={dimensions.height}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        style={{ cursor: 'pointer', display: 'block' }}
        tabIndex={0}
        viewBox={`0 0 ${layout.width.toString()} ${layout.height.toString()}`}
        width={dimensions.width}
      >
        {nodeRects}

        <rect
          fill="rgba(99, 102, 241, 0.15)"
          height={viewport.height}
          pointerEvents="none"
          stroke="#6366f1"
          strokeWidth={viewboxStroke}
          width={viewport.width}
          x={viewport.x}
          y={viewport.y}
        />
      </svg>
    </Box>
  );
}
