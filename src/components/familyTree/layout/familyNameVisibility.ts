import { type ParentLink } from '@/components/familyTree/layout/internalTypes';
import { type Person } from '@/schemas/personSchema';

export function computeShowFamilyNameMap(
  people: Person[],
  childToParents: Map<string, ParentLink[]>,
): Map<string, boolean> {
  const familyNameOf = new Map(people.map((p) => [p.id, p.familyName]));
  const result = new Map<string, boolean>();
  for (const person of people) {
    const parents = childToParents.get(person.id) ?? [];
    const hasSameSurnameParent = parents.some(
      ({ parentId }) => familyNameOf.get(parentId) === person.familyName,
    );
    result.set(person.id, !hasSameSurnameParent);
  }
  return result;
}
