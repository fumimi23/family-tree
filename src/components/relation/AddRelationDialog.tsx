import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { toaster } from '@/components/ui/toaster';
import { type Person } from '@/schemas/personSchema';
import { type Relation, relationSchema, relationTypes } from '@/schemas/relationSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';
import { Button, CloseButton, createListCollection, Dialog, Field, Flex, Portal, Select } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

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

  const relationTypeCollection = createListCollection({ items: relationTypes });

  const personCollection = createListCollection({
    items: people.map((person) => ({
      label: `${person.familyName} ${person.givenName}`,
      value: person.id,
    })),
  });

  const selectedRelationType = relationTypes.find((relationType) => Boolean(watch('relationType').find((value) => value === relationType.value)));

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

            <form onSubmit={handleSubmit(onSubmit)}>
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
                        <Field.Root invalid={Boolean(errors.persons) || Boolean(errors.persons?.personId1)}>

                          <Field.Label>{selectedRelationType.person1Label}</Field.Label>

                          <Controller
                            control={control}
                            name="persons.personId1"
                            render={({ field }) => (
                              <Select.Root
                                collection={personCollection}
                                defaultValue={field.value}
                                name={field.name}
                                onInteractOutside={field.onBlur}
                                onValueChange={({ value }) => { field.onChange(value); }}
                                value={field.value}
                              >
                                <Select.HiddenSelect />

                                <Select.Control>
                                  <Select.Trigger>
                                    <Select.ValueText placeholder={selectedRelationType.person1Label} />
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

                          <Field.ErrorText>{errors.persons?.message}</Field.ErrorText>
                          <Field.ErrorText>{errors.persons?.personId1?.message}</Field.ErrorText>
                        </Field.Root>

                        <Field.Root invalid={Boolean(errors.persons) || Boolean(errors.persons?.personId2)}>

                          <Field.Label>{selectedRelationType.person2Label}</Field.Label>

                          <Controller
                            control={control}
                            name="persons.personId2"
                            render={({ field }) => (
                              <Select.Root
                                collection={personCollection}
                                defaultValue={field.value}
                                name={field.name}
                                onInteractOutside={field.onBlur}
                                onValueChange={({ value }) => { field.onChange(value); }}
                                value={field.value}
                              >
                                <Select.HiddenSelect />

                                <Select.Control>
                                  <Select.Trigger>
                                    <Select.ValueText placeholder={selectedRelationType.person2Label} />
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

                          <Field.ErrorText>{errors.persons?.message}</Field.ErrorText>
                          <Field.ErrorText>{errors.persons?.personId2?.message}</Field.ErrorText>
                        </Field.Root>
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
