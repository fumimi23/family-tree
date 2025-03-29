import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { type Person } from '@/schemas/personSchema';
import { type Relation } from '@/schemas/relationSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';
import { Flex, Heading, Table } from '@chakra-ui/react';
import React from 'react';

export function RelationTable(): React.ReactNode {
  const people: Person[] = usePeopleStore((state) => state.people);
  const relations: Relation[] = useRelationStore((state) => state.relations);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <Heading
          as="h2"
          size="xl"
        >
          関係一覧
        </Heading>

        <PrimaryButton
          onClick={() => { setIsOpen(true); }}
        >
          関係追加
        </PrimaryButton>
      </Flex>

      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>人物1</Table.ColumnHeader>
            <Table.ColumnHeader>人物2</Table.ColumnHeader>
            <Table.ColumnHeader>関係</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {relations.map((relation) => {
            const person1 = people.find((person) => person.id === relation.person1Id);
            const person2 = people.find((person) => person.id === relation.person2Id);

            return (
              <Table.Row key={relation.id}>
                <Table.Cell>
                  {person1?.familyName}
                  {' '}
                  {person1?.givenName}
                </Table.Cell>

                <Table.Cell>
                  {person2?.familyName}
                  {' '}
                  {person2?.givenName}
                </Table.Cell>

                <Table.Cell>{relation.relation}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
}
