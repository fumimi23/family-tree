import React from 'react';

import { type SecondaryMarriageEdgeLayout } from '@/components/familyTree/types';
import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';

interface Props {
  edge: SecondaryMarriageEdgeLayout;
}

const STROKE_WIDTH = 1.5;
const DOUBLE_LINE_OFFSET = 2;

/*
 * 2 回目以降の婚姻線。primary 婚姻 (MarriageEdge) と区別するため、
 * primary person のノードの直下から段差状に伸ばして配偶者へ繋ぐ。
 * married は二重線、couple (事実婚) は単線。
 */
export function SecondaryMarriageEdge({ edge }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  const isMarried = edge.type === 'married';

  function horizontalLine(yOffset: number): React.ReactNode {
    return (
      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={edge.primaryAnchorX}
        x2={edge.spouseAnchorX}
        y1={edge.busY + yOffset}
        y2={edge.busY + yOffset}
      />
    );
  }

  return (
    <g>
      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={edge.primaryAnchorX}
        x2={edge.primaryAnchorX}
        y1={edge.primaryAnchorY}
        y2={edge.busY}
      />

      {isMarried
        ? (
          <>
            {horizontalLine(-DOUBLE_LINE_OFFSET)}
            {horizontalLine(DOUBLE_LINE_OFFSET)}
          </>
        )
        : horizontalLine(0)}

      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={edge.spouseAnchorX}
        x2={edge.spouseAnchorX}
        y1={edge.busY}
        y2={edge.spouseAnchorY}
      />
    </g>
  );
}
