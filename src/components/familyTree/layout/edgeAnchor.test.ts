import { describe, expect, it } from 'vitest';

import { computeParentAnchor } from '@/components/familyTree/layout/edgeAnchor';
import {
  COUPLE_GAP,
  GENERATION_GAP,
  PERSON_HEIGHT,
  PERSON_WIDTH,
} from '@/components/familyTree/layout/internalTypes';

describe('computeParentAnchor', () => {
  it('single は人物中央下端を anchor、busY は次世代まで GENERATION_GAP/2', () => {
    const result = computeParentAnchor('single', 100, 200);
    expect(result.x).toBe(100 + (PERSON_WIDTH / 2));
    expect(result.y).toBe(200 + PERSON_HEIGHT);
    expect(result.busY).toBe(200 + PERSON_HEIGHT + (GENERATION_GAP / 2));
  });

  it('couple は二人の間 (高さは中央) を anchor とする', () => {
    const result = computeParentAnchor('couple', 100, 200);
    expect(result.x).toBe(100 + PERSON_WIDTH + (COUPLE_GAP / 2));
    expect(result.y).toBe(200 + (PERSON_HEIGHT / 2));
    expect(result.busY).toBe(200 + PERSON_HEIGHT + (GENERATION_GAP / 2));
  });
});
