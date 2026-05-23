import React from 'react';

import { type MarriageEdgeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';

interface Props {
  edge: MarriageEdgeLayout;
}

const STROKE_WIDTH = 1.5;
const DOUBLE_LINE_OFFSET = 2;

export function MarriageEdge({ edge }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  if (edge.type === 'married') {
    return (
      <g>
        <line
          stroke={theme.lineStroke}
          strokeWidth={STROKE_WIDTH}
          x1={edge.x1}
          x2={edge.x2}
          y1={edge.y - DOUBLE_LINE_OFFSET}
          y2={edge.y - DOUBLE_LINE_OFFSET}
        />

        <line
          stroke={theme.lineStroke}
          strokeWidth={STROKE_WIDTH}
          x1={edge.x1}
          x2={edge.x2}
          y1={edge.y + DOUBLE_LINE_OFFSET}
          y2={edge.y + DOUBLE_LINE_OFFSET}
        />
      </g>
    );
  }
  return (
    <line
      stroke={theme.lineStroke}
      strokeWidth={STROKE_WIDTH}
      x1={edge.x1}
      x2={edge.x2}
      y1={edge.y}
      y2={edge.y}
    />
  );
}
