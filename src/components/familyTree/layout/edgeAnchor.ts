import {
  COUPLE_GAP,
  GENERATION_GAP,
  PERSON_HEIGHT,
  PERSON_WIDTH,
  type UnitType,
} from '@/components/familyTree/layout/internalTypes';

export interface ParentAnchor {
  x: number;
  y: number;
  busY: number;
}

export function computeParentAnchor(
  unitType: UnitType,
  unitLeftX: number,
  unitY: number,
): ParentAnchor {
  const isCouple = unitType === 'couple';
  return {
    x: isCouple
      ? unitLeftX + PERSON_WIDTH + (COUPLE_GAP / 2)
      : unitLeftX + (PERSON_WIDTH / 2),
    y: isCouple
      ? unitY + (PERSON_HEIGHT / 2)
      : unitY + PERSON_HEIGHT,
    busY: unitY + PERSON_HEIGHT + (GENERATION_GAP / 2),
  };
}
