import { type FamilyTreeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import { Box } from '@chakra-ui/react';
import React from 'react';

const MAX_MINIMAP_WIDTH = 240;
const MAX_MINIMAP_HEIGHT = 160;
const LABELS_WIDTH = 64;

export interface ScrollState {
  left: number;
  top: number;
  clientW: number;
  clientH: number;
}

interface Props {
  layout: FamilyTreeLayout;
  onNavigate: (layoutX: number, layoutY: number) => void;
  scrollState: ScrollState;
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

export function Minimap({
  layout,
  onNavigate,
  scrollState,
  zoom,
}: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const dimensions = computeDimensions(layout);
  const viewport = computeViewport(scrollState, zoom, layout);
  const handleClick = React.useCallback((e: React.MouseEvent<SVGSVGElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * layout.width;
    const y = ((e.clientY - rect.top) / rect.height) * layout.height;
    onNavigate(x, y);
  }, [layout.width, layout.height, onNavigate]);

  if (dimensions.width === 0) {
    return null;
  }
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
        height={dimensions.height}
        onClick={handleClick}
        style={{ cursor: 'pointer', display: 'block' }}
        viewBox={`0 0 ${layout.width.toString()} ${layout.height.toString()}`}
        width={dimensions.width}
      >
        {layout.nodes.map((node) => (
          <rect
            fill={theme.nodeStroke}
            height={node.height}
            key={node.personId}
            opacity={0.6}
            width={node.width}
            x={node.x}
            y={node.y}
          />
        ))}

        <rect
          fill="rgba(99, 102, 241, 0.15)"
          height={viewport.height}
          pointerEvents="none"
          stroke="#6366f1"
          strokeWidth={Math.max(layout.width / dimensions.width, 2)}
          width={viewport.width}
          x={viewport.x}
          y={viewport.y}
        />
      </svg>
    </Box>
  );
}
