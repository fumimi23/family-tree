import { Field, type ListCollection, Portal, Select } from '@chakra-ui/react';
import React from 'react';
import { type Control, Controller } from 'react-hook-form';

import { type Relation } from '@/schemas/relationSchema';

interface PersonOption {
  label: string;
  value: string;
}

interface Props {
  control: Control<Relation>;
  name: 'persons.personId1' | 'persons.personId2';
  label: string;
  personCollection: ListCollection<PersonOption>;
  invalid: boolean;
  errorMessages: (string | undefined)[];
}

/*
 * 関係追加フォームの人物セレクタ。person1 / person2 で同一構造なので共通化している。
 */
export function RelationPersonField({
  control,
  name,
  label,
  personCollection,
  invalid,
  errorMessages,
}: Props): React.ReactNode {
  return (
    <Field.Root invalid={invalid}>
      <Field.Label>{label}</Field.Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select.Root
            collection={personCollection}
            name={field.name}
            onInteractOutside={field.onBlur}
            onValueChange={({ value }): void => { field.onChange(value); }}
            value={field.value}
          >
            <Select.HiddenSelect />

            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder={label} />
              </Select.Trigger>

              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>

            <Portal>
              <Select.Positioner>
                <Select.Content zIndex={1500}>
                  {personCollection.items.map((person) => (
                    <Select.Item
                      item={person}
                      key={person.value}
                    >
                      {person.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        )}
      />

      {errorMessages.map((message, i) => (
        <Field.ErrorText key={`${name}-err-${i.toString()}`}>{message}</Field.ErrorText>
      ))}
    </Field.Root>
  );
}
