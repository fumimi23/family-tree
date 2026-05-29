import { Field, type ListCollection, Select } from '@chakra-ui/react';
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
              {/*
                * 未選択時も入力可能と分かるよう、枠線を明示しつつ
                * 背景を透明にして他の入力欄と見た目を揃える (#172)。
                */}
              <Select.Trigger
                bg="transparent"
                borderColor="border.emphasized"
                borderWidth="1px"
              >
                <Select.ValueText placeholder={label} />
              </Select.Trigger>

              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>

            {/*
              * Dialog 内では Portal で body 直下に出すと dialog の focus-trap に
              * aria-hidden 化され、listbox が SR/E2E から不可視になる (#167)。
              * Portal せず dialog 内にレンダリングする。
              */}
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
          </Select.Root>
        )}
      />

      {errorMessages
        .filter((message): message is string => message !== undefined)
        .map((message) => (
          <Field.ErrorText key={`${name}-${message}`}>{message}</Field.ErrorText>
        ))}
    </Field.Root>
  );
}
