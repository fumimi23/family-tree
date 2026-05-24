import React from 'react';

import { useFamilyTreeTheme } from '@/components/familyTree/useFamilyTreeTheme';

interface Props {
  centerX: number;
  centerY: number;
}

const STROKE_WIDTH = 1.5;
const HALF_LENGTH = 6;
const GAP = 3;

/*
 * 離婚を表す二重斜線 (`//`) を婚姻線の中央に描く。
 * 婚姻線は水平方向なので、斜線は右肩下がりに 2 本配置する。
 */
export function DivorcedMark({ centerX, centerY }: Props): React.ReactNode {
  const theme = useFamilyTreeTheme();
  return (
    <g>
      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={centerX - GAP - HALF_LENGTH}
        x2={centerX - GAP + HALF_LENGTH}
        y1={centerY + HALF_LENGTH}
        y2={centerY - HALF_LENGTH}
      />

      <line
        stroke={theme.lineStroke}
        strokeWidth={STROKE_WIDTH}
        x1={centerX + GAP - HALF_LENGTH}
        x2={centerX + GAP + HALF_LENGTH}
        y1={centerY + HALF_LENGTH}
        y2={centerY - HALF_LENGTH}
      />
    </g>
  );
}
