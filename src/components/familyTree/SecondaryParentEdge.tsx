import { type SecondaryParentEdgeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';
import React from 'react';

interface Props {
  edge: SecondaryParentEdgeLayout;
}

const STROKE_WIDTH = 1;
const OPACITY = 0.55;
const ADOPTED_DASH = '4 3';

export function SecondaryParentEdge({ edge }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const dash = edge.adopted ? ADOPTED_DASH : undefined;
  return (
    <g opacity={OPACITY}>
      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={edge.parentAnchorX}
        x2={edge.parentAnchorX}
        y1={edge.parentAnchorY}
        y2={edge.busY}
      />

      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={edge.parentAnchorX}
        x2={edge.childX}
        y1={edge.busY}
        y2={edge.busY}
      />

      <line
        stroke={theme.lineStroke}
        strokeDasharray={dash}
        strokeWidth={STROKE_WIDTH}
        x1={edge.childX}
        x2={edge.childX}
        y1={edge.busY}
        y2={edge.childTopY}
      />
    </g>
  );
}
