import { Button, Checkbox, CloseButton, createListCollection, Dialog, Field, Flex, Portal, RadioGroup, Select } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import { RelationPersonField } from '@/components/relation/RelationPersonField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { toaster } from '@/components/ui/toaster';
import { type Person } from '@/schemas/personSchema';
import { HouseholdSide, type Relation, relationSchema, RelationType, relationTypeList } from '@/schemas/relationSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';

interface AddRelationDialogProps {
  isOpen: boolean;
  onOpenChange: (e: { open: boolean }) => void;
}

export function AddRelationDialog({ isOpen, onOpenChange }: AddRelationDialogProps): React.ReactNode {
  const people: Person[] = usePeopleStore((state) => state.people);
  const addRelation = useRelationStore((state) => state.addRelation);

  const defaultValues: Relation = {
    id: uuidv4(),
    persons: {
      personId1: [],
      personId2: [],
    },
    relationType: [],
  };
  const { control, handleSubmit, formState: { errors }, watch } = useForm<Relation>({
    defaultValues,
    resolver: zodResolver(relationSchema),
  });

  const relationTypeCollection = createListCollection({ items: relationTypeList });

  const personCollection = createListCollection({
    items: people.map((person) => ({
      label: `${person.familyName} ${person.givenName}`,
      value: person.id,
    })),
  });

  const selectedRelationType = relationTypeList.find((relationType) => Boolean(watch('relationType').find((value) => value === relationType.value)));
  const isMarriageRelation = selectedRelationType?.value === RelationType.MARRIED_COUPLE
    || selectedRelationType?.value === RelationType.COUPLE;

  const onSubmit = (relation: Relation): void => {
    console.log(relation);
    addRelation(relation);
    onOpenChange({ open: false });
    toaster.create({
      title: '関係を追加しました。',
      description: `${selectedRelationType?.label ?? ''}関係を追加しました。`,
      type: 'success',
    });
  };

  return (
    <Dialog.Root
      lazyMount
      onOpenChange={onOpenChange}
      open={isOpen}
    >
      <Portal>
        <Dialog.Backdrop />

        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              関係追加
            </Dialog.Header>

            <form
              onSubmit={(e): void => {
                void handleSubmit(onSubmit)(e);
              }}
            >
              <Dialog.Body>
                <Flex direction="column">
                  <Field.Root invalid={Boolean(errors.relationType)}>

                    <Field.Label>関係</Field.Label>

                    <Controller
                      control={control}
                      name="relationType"
                      render={({ field }) => (
                        <Select.Root
                          collection={relationTypeCollection}
                          defaultValue={field.value}
                          name={field.name}
                          onInteractOutside={field.onBlur}
                          onValueChange={({ value }) => { field.onChange(value); }}
                          value={field.value}
                        >
                          <Select.HiddenSelect />

                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder="関係" />
                            </Select.Trigger>

                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>

                          <Portal>
                            <Select.Positioner>
                              <Select.Content zIndex={1500}>
                                {relationTypeCollection.items.map((relationType) => (
                                  <Select.Item
                                    item={relationType}
                                    key={relationType.value}
                                  >
                                    {relationType.label}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      )}
                    />

                    <Field.ErrorText>{errors.relationType?.message}</Field.ErrorText>
                  </Field.Root>

                  {selectedRelationType
                    ? (
                      <>
                        <RelationPersonField
                          control={control}
                          errorMessages={[errors.persons?.message, errors.persons?.personId1?.message]}
                          invalid={Boolean(errors.persons) || Boolean(errors.persons?.personId1)}
                          label={selectedRelationType.person1Label}
                          name="persons.personId1"
                          personCollection={personCollection}
                        />

                        <RelationPersonField
                          control={control}
                          errorMessages={[errors.persons?.message, errors.persons?.personId2?.message]}
                          invalid={Boolean(errors.persons) || Boolean(errors.persons?.personId2)}
                          label={selectedRelationType.person2Label}
                          name="persons.personId2"
                          personCollection={personCollection}
                        />

                        {isMarriageRelation
                          ? (
                            <Field.Root invalid={Boolean(errors.divorced)}>
                              {/*
                                * 非婚姻リレーションに切り替えたとき divorced を unregister し、
                                * スキーマの superRefine に違反する値が残らないようにする。
                                */}
                              <Controller
                                control={control}
                                name="divorced"
                                render={({ field }) => (
                                  <Checkbox.Root
                                    checked={field.value === true}
                                    name={field.name}
                                    onCheckedChange={(e): void => {
                                      field.onChange(e.checked === true);
                                    }}
                                    variant="outline"
                                  >
                                    <Checkbox.HiddenInput onBlur={field.onBlur} />

                                    {/* 未チェック時も枠が見えるよう明示的に border を指定する */}
                                    <Checkbox.Control
                                      borderColor="border.emphasized"
                                      borderWidth="1px"
                                    />

                                    <Checkbox.Label>離婚済み</Checkbox.Label>
                                  </Checkbox.Root>
                                )}
                                shouldUnregister
                              />

                              <Field.ErrorText>{errors.divorced?.message}</Field.ErrorText>
                            </Field.Root>
                          )
                          : null}

                        {isMarriageRelation
                          ? (
                            <Field.Root invalid={Boolean(errors.householdSide)}>
                              <Field.Label>家系を継ぐ側 (任意)</Field.Label>

                              {/*
                                * 非婚姻リレーションに切り替えたら値を残さない (superRefine 違反防止)。
                                * 「指定なし」は空文字で表現し、保存時に undefined へ変換する。
                                */}
                              <Controller
                                control={control}
                                name="householdSide"
                                render={({ field }) => (
                                  <RadioGroup.Root
                                    name={field.name}
                                    onValueChange={({ value }): void => {
                                      field.onChange(value === '' ? undefined : value);
                                    }}
                                    value={field.value ?? ''}
                                  >
                                    <Flex gap={2}>
                                      <RadioGroup.Item value="">
                                        <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                        <RadioGroup.ItemIndicator />
                                        <RadioGroup.ItemText>指定なし</RadioGroup.ItemText>
                                      </RadioGroup.Item>

                                      <RadioGroup.Item value={HouseholdSide.PERSON1}>
                                        <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                        <RadioGroup.ItemIndicator />

                                        <RadioGroup.ItemText>
                                          {`${selectedRelationType.person1Label}側`}
                                        </RadioGroup.ItemText>
                                      </RadioGroup.Item>

                                      <RadioGroup.Item value={HouseholdSide.PERSON2}>
                                        <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                        <RadioGroup.ItemIndicator />

                                        <RadioGroup.ItemText>
                                          {`${selectedRelationType.person2Label}側`}
                                        </RadioGroup.ItemText>
                                      </RadioGroup.Item>
                                    </Flex>
                                  </RadioGroup.Root>
                                )}
                                shouldUnregister
                              />

                              <Field.ErrorText>{errors.householdSide?.message}</Field.ErrorText>
                            </Field.Root>
                          )
                          : null}
                      </>
                    )
                    : null}
                </Flex>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">キャンセル</Button>
                </Dialog.ActionTrigger>

                <PrimaryButton type="submit">保存</PrimaryButton>
              </Dialog.Footer>
            </form>

            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>

    </Dialog.Root>
  );
}
