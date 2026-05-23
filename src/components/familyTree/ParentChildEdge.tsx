import React from 'react';

import { ADOPTED_DASH } from '@/components/familyTree/edgeStyle';
import { type ParentChildrenGroupLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';

interface Props {
  group: ParentChildrenGroupLayout;
}

const STROKE_WIDTH = 1.5;

export function ParentChildEdge({ group }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const childXs = group.children.map((c) => c.childX);
  const minX = Math.min(group.parentAnchorX, ...childXs);
  const maxX = Math.max(group.parentAnchorX, ...childXs);
  const hasHorizontalSpan = minX !== maxX;
  return (
    <g>
      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={group.parentAnchorX}
        x2={group.parentAnchorX}
        y1={group.parentAnchorY}
        y2={group.busY}
      />

      {hasHorizontalSpan
        ? (
          <line
            stroke={theme.lineStroke}
            strokeWidth={STROKE_WIDTH}
            x1={minX}
            x2={maxX}
            y1={group.busY}
            y2={group.busY}
          />
        )
        : null}

      {group.children.map((child) => (
        <line
          key={child.childPersonId}
          stroke={theme.lineStroke}
          strokeDasharray={child.adopted ? ADOPTED_DASH : undefined}
          strokeWidth={STROKE_WIDTH}
          x1={child.childX}
          x2={child.childX}
          y1={group.busY}
          y2={child.childTopY}
        />
      ))}
    </g>
  );
}
