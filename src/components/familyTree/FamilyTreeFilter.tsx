import { Button, Checkbox, createListCollection, Flex, Portal, Select } from '@chakra-ui/react';
import React from 'react';

import { type FilterCriteria, type FilterScope } from '@/components/familyTree/applyFilter';
import { type Person } from '@/schemas/personSchema';

interface Props {
  people: Person[];
  criteria: FilterCriteria | null;
  onChange: (criteria: FilterCriteria | null) => void;
}

const SCOPE_OPTIONS: { value: FilterScope;
  label: string; }[] = [
  {
    value: 'both',
    label: '祖先と子孫',
  },
  {
    value: 'ancestors',
    label: '祖先のみ',
  },
  {
    value: 'descendants',
    label: '子孫のみ',
  },
];

export function FamilyTreeFilter({ people, criteria, onChange }: Props): React.ReactNode {
  const personCollection = createListCollection({
    items: people.map((p) => ({
      label: `${p.familyName} ${p.givenName}`,
      value: p.id,
    })),
  });
  const scopeCollection = createListCollection({ items: SCOPE_OPTIONS });

  const handlePersonChange = (value: string[]): void => {
    if (value.length === 0) {
      onChange(null);
      return;
    }
    onChange({
      focusPersonId: value[0],
      scope: criteria?.scope ?? 'both',
    });
  };

  const handleScopeChange = (value: string[]): void => {
    if (value.length === 0 || criteria === null) {
      return;
    }
    onChange({
      ...criteria,
      scope: value[0] as FilterScope,
    });
  };

  const handleSiblingsChange = (checked: boolean): void => {
    if (criteria === null) {
      return;
    }
    onChange({
      ...criteria,
      includeSiblings: checked,
    });
  };

  const handleClear = (): void => {
    onChange(null);
  };

  const selectedPerson = criteria === null ? [] : [criteria.focusPersonId];
  const selectedScope = criteria === null ? ['both'] : [criteria.scope];

  return (
    <Flex
      alignItems="center"
      gap={2}
    >
      <Select.Root
        collection={personCollection}
        onValueChange={({ value }): void => { handlePersonChange(value); }}
        size="sm"
        value={selectedPerson}
        width="180px"
      >
        <Select.HiddenSelect />

        <Select.Control>
          <Select.Trigger aria-label="フィルタの起点人物">
            <Select.ValueText placeholder="起点人物を選択" />
          </Select.Trigger>

          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content zIndex={1500}>
              {personCollection.items.map((p) => (
                <Select.Item
                  item={p}
                  key={p.value}
                >
                  {p.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      <Select.Root
        collection={scopeCollection}
        disabled={criteria === null}
        onValueChange={({ value }): void => { handleScopeChange(value); }}
        size="sm"
        value={selectedScope}
        width="130px"
      >
        <Select.HiddenSelect />

        <Select.Control>
          <Select.Trigger aria-label="フィルタの範囲">
            <Select.ValueText />
          </Select.Trigger>

          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>

        <Portal>
          <Select.Positioner>
            <Select.Content zIndex={1500}>
              {scopeCollection.items.map((s) => (
                <Select.Item
                  item={s}
                  key={s.value}
                >
                  {s.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>

      {criteria === null
        ? null
        : (
          <Checkbox.Root
            checked={criteria.includeSiblings === true}
            onCheckedChange={(e): void => { handleSiblingsChange(e.checked === true); }}
            size="sm"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>兄弟も含める</Checkbox.Label>
          </Checkbox.Root>
        )}

      {criteria === null
        ? null
        : (
          <Button
            onClick={handleClear}
            size="sm"
            variant="outline"
          >
            クリア
          </Button>
        )}
    </Flex>
  );
}
