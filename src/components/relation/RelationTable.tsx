import { Flex, Table } from '@chakra-ui/react';
import React from 'react';

import { AddRelationDialog } from '@/components/relation/AddRelationDialog';
import { H2 } from '@/components/ui/H2';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { type Person } from '@/schemas/personSchema';
import { type Relation, type RelationType, relationTypeList } from '@/schemas/relationSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';

export function RelationTable(): React.ReactNode {
  const people: Person[] = usePeopleStore((state) => state.people);
  const relations: Relation[] = useRelationStore((state) => state.relations);
  const [isOpen, setIsOpen] = React.useState(false);
  const relationTypeLabelMap = new Map(relationTypeList.map((relationType) => [relationType.value, relationType.label]));
  const personLabelMap = new Map(people.map((person) => [person.id, `${person.familyName} ${person.givenName}`]));

  return (
    <Flex direction="column">
      <Flex justifyContent="space-between">
        <H2>
          関係一覧
        </H2>

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
            return (
              <Table.Row key={relation.id}>
                <Table.Cell>{personLabelMap.get(relation.persons.personId1[0])}</Table.Cell>
                <Table.Cell>{personLabelMap.get(relation.persons.personId2[0])}</Table.Cell>
                <Table.Cell>{relationTypeLabelMap.get(relation.relationType[0] as RelationType)}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>

      <AddRelationDialog
        isOpen={isOpen}
        key={isOpen.toString()}
        onOpenChange={(e) => { setIsOpen(e.open); }}
      />
    </Flex>
  );
}
