import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { toaster } from '@/components/ui/toaster';
import { type Person, personSchema, sex, Sex } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { Button, CloseButton, Dialog, Field, Flex, Input, Portal, RadioGroup } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface AddPersonDialogProps {
  isOpen: boolean;
  onOpenChange: (e: { open: boolean }) => void;
}

export function AddPersonDialog({ isOpen, onOpenChange }: AddPersonDialogProps): React.ReactNode {
  const addPerson = usePeopleStore((state) => state.addPerson);
  const onSubmit = (person: Person): void => {
    console.log(person);
    addPerson(person);
    onOpenChange({ open: false });
    toaster.create({
      title: '人物を追加しました。',
      description: `${person.familyName} ${person.givenName}さんを追加しました。`,
      type: 'success',
    });
  };

  const defaultValues: Person = {
    id: uuidv4(),
    familyName: '',
    givenName: '',
    familyNameKana: '',
    givenNameKana: '',
    sex: Sex.UNKNOWN,
    birth: '',
    death: '',
    posthumousName: '',
  };
  const { control, register, handleSubmit, formState: { errors } } = useForm<Person>({
    defaultValues,
    resolver: zodResolver(personSchema),
  });

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
              人物追加
            </Dialog.Header>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Body>
                <Flex
                  direction="column"
                  gap={4}
                >
                  <Field.Root invalid={Boolean(errors.familyName)}>
                    <Field.Label>姓</Field.Label>

                    <Input
                      {...register('familyName')}
                      placeholder="姓"
                    />

                    <Field.ErrorText>{errors.familyName?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.givenName)}>
                    <Field.Label>名</Field.Label>

                    <Input
                      {...register('givenName')}
                      placeholder="名"
                    />

                    <Field.ErrorText>{errors.givenName?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.familyNameKana)}>
                    <Field.Label>姓（カナ）</Field.Label>

                    <Input
                      {...register('familyNameKana')}
                      placeholder="姓（カナ）"
                    />

                    <Field.ErrorText>{errors.familyNameKana?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.givenNameKana)}>
                    <Field.Label>名（カナ）</Field.Label>

                    <Input
                      {...register('givenNameKana')}
                      placeholder="名（カナ）"
                    />

                    <Field.ErrorText>{errors.givenNameKana?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.sex)}>

                    <Field.Label>性別</Field.Label>

                    <Controller
                      control={control}
                      name="sex"
                      render={({ field }) => (
                        <RadioGroup.Root
                          name={field.name}
                          onValueChange={({ value }) => { field.onChange(value); }}
                          value={field.value}
                        >
                          <Flex gap={2}>
                            {sex.map((s) => (
                              <RadioGroup.Item
                                key={s.value}
                                value={s.value}
                              >
                                <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                <RadioGroup.ItemIndicator />

                                <RadioGroup.ItemText>
                                  {s.label}
                                </RadioGroup.ItemText>
                              </RadioGroup.Item>
                            ))}
                          </Flex>
                        </RadioGroup.Root>
                      )}
                    />

                    <Field.ErrorText>{errors.sex?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.birth)}>
                    <Field.Label>生年月日</Field.Label>

                    <Input
                      {...register('birth')}
                      placeholder="生年月日"
                      type="date"
                    />

                    <Field.ErrorText>{errors.birth?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.death)}>
                    <Field.Label>没年月日</Field.Label>

                    <Input
                      {...register('death')}
                      placeholder="没年月日"
                      type="date"
                    />

                    <Field.ErrorText>{errors.death?.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={Boolean(errors.posthumousName)}>
                    <Field.Label>戒名</Field.Label>

                    <Input
                      {...register('posthumousName')}
                      placeholder="戒名"
                    />

                    <Field.ErrorText>{errors.posthumousName?.message}</Field.ErrorText>
                  </Field.Root>
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
