import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { toaster } from '@/components/ui/toaster';
import { type Person, personSchema, Sex, sexList } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { Button, CloseButton, Dialog, Field, Flex, Input, Portal, RadioGroup } from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

interface PersonDialogProps {
  isOpen: boolean;
  onOpenChange: (e: { open: boolean }) => void;
  person?: Person;
}

function buildDefaultValues(person: Person | undefined): Person {
  if (person !== undefined) {
    return person;
  }
  return {
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
}

export function PersonDialog({ isOpen, onOpenChange, person }: PersonDialogProps): React.ReactNode {
  const addPerson = usePeopleStore((state) => state.addPerson);
  const updatePerson = usePeopleStore((state) => state.updatePerson);
  const deletePerson = usePeopleStore((state) => state.deletePerson);
  const isEdit = person !== undefined;
  const defaultValues = buildDefaultValues(person);
  const { control, register, handleSubmit, formState: { errors } } = useForm<Person>({
    defaultValues,
    resolver: zodResolver(personSchema),
  });
  const onSubmit = (data: Person): void => {
    if (isEdit) {
      updatePerson(data);
      toaster.create({
        title: '人物を更新しました。',
        description: `${data.familyName} ${data.givenName}さんを更新しました。`,
        type: 'success',
      });
    } else {
      addPerson(data);
      toaster.create({
        title: '人物を追加しました。',
        description: `${data.familyName} ${data.givenName}さんを追加しました。`,
        type: 'success',
      });
    }
    onOpenChange({ open: false });
  };
  const handleDelete = (): void => {
    if (person === undefined) {
      return;
    }
    const fullName = `${person.familyName} ${person.givenName}`;
    if (!window.confirm(`${fullName}さんを削除しますか?`)) {
      return;
    }
    deletePerson(person.id);
    onOpenChange({ open: false });
    toaster.create({
      title: '人物を削除しました。',
      description: `${fullName}さんを削除しました。`,
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
              {isEdit ? '人物編集' : '人物追加'}
            </Dialog.Header>

            <form
              onSubmit={(e): void => {
                void handleSubmit(onSubmit)(e);
              }}
            >
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
                            {sexList.map((sex) => (
                              <RadioGroup.Item
                                key={sex.value}
                                value={sex.value}
                              >
                                <RadioGroup.ItemHiddenInput onBlur={field.onBlur} />
                                <RadioGroup.ItemIndicator />

                                <RadioGroup.ItemText>
                                  {sex.label}
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
                {isEdit
                  ? (
                    <Button
                      colorPalette="red"
                      onClick={handleDelete}
                      type="button"
                      variant="outline"
                    >
                      削除
                    </Button>
                  )
                  : null}

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
