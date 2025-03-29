import { AddPersonDialog } from '@/components/person/AddPersonDialog';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { type Person } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { Flex, Heading, Table } from '@chakra-ui/react';
import React from 'react';

export function PeopleTable(): React.ReactNode {
  const people: Person[] = usePeopleStore((state) => state.people);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <Heading
          as="h2"
          size="xl"
        >
          人物一覧
        </Heading>

        <PrimaryButton
          onClick={() => { setIsOpen(true); }}
        >
          人物追加
        </PrimaryButton>
      </Flex>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>姓</Table.ColumnHeader>
            <Table.ColumnHeader>名</Table.ColumnHeader>
            <Table.ColumnHeader>姓（カナ）</Table.ColumnHeader>
            <Table.ColumnHeader>名（カナ）</Table.ColumnHeader>
            <Table.ColumnHeader>生年月日</Table.ColumnHeader>
            <Table.ColumnHeader>没年月日</Table.ColumnHeader>
            <Table.ColumnHeader>戒名</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {people.map((person) => (
            <Table.Row key={person.id}>
              <Table.Cell>{person.familyName}</Table.Cell>
              <Table.Cell>{person.givenName}</Table.Cell>
              <Table.Cell>{person.familyNameKana}</Table.Cell>
              <Table.Cell>{person.givenNameKana}</Table.Cell>
              <Table.Cell>{person.birth}</Table.Cell>
              <Table.Cell>{person.death}</Table.Cell>
              <Table.Cell>{person.posthumousName}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <AddPersonDialog
        isOpen={isOpen}
        key={isOpen}
        onOpenChange={(e) => { setIsOpen(e.open); }}
      />
    </Flex>
  );
}
