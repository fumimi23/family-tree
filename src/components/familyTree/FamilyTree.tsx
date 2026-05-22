import { layoutFamilyTree } from '@/components/familyTree/layoutFamilyTree';
import { MarriageEdge } from '@/components/familyTree/MarriageEdge';
import { ParentChildEdge } from '@/components/familyTree/ParentChildEdge';
import { PersonNode } from '@/components/familyTree/PersonNode';
import { SecondaryParentEdge } from '@/components/familyTree/SecondaryParentEdge';
import { H2 } from '@/components/ui/H2';
import { type Person } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';
import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

interface LayoutSuccess {
  ok: true;
  layout: ReturnType<typeof layoutFamilyTree>;
}

interface LayoutFailure {
  ok: false;
  error: string;
}

type LayoutResult = LayoutFailure | LayoutSuccess;

export function FamilyTree(): React.ReactNode {
  const people = usePeopleStore((state) => state.people);
  const relations = useRelationStore((state) => state.relations);
  const personMap = React.useMemo(
    () => new Map<string, Person>(people.map((p) => [p.id, p])),
    [people],
  );
  const result = React.useMemo<LayoutResult>(() => {
    try {
      return {
        ok: true,
        layout: layoutFamilyTree(people, relations),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: message,
      };
    }
  }, [people, relations]);

  return (
    <Flex direction="column">
      <H2>
        家系図
      </H2>

      {people.length === 0
        ? (
          <Text color="gray.500">
            人物を追加すると家系図が表示されます。
          </Text>
        )
        : null}

      {result.ok
        ? null
        : (
          <Text color="red.600">
            家系図の描画に失敗しました:
            {' '}
            {result.error}
          </Text>
        )}

      {result.ok && people.length > 0
        ? (
          <Box overflowX="auto">
            <Flex>
              <Box
                bg="bg"
                flexShrink={0}
                height={`${result.layout.height.toString()}px`}
                left={0}
                position="sticky"
                width="64px"
                zIndex={1}
              >
                {result.layout.generationRows.map((row) => (
                  <Box
                    alignItems="center"
                    display="flex"
                    height={`${row.height.toString()}px`}
                    justifyContent="center"
                    key={row.y}
                    left={0}
                    position="absolute"
                    top={`${row.y.toString()}px`}
                    width="100%"
                  >
                    <Text
                      color="fg.muted"
                      fontSize="xs"
                    >
                      第{(row.generation + 1).toString()}世代
                    </Text>
                  </Box>
                ))}
              </Box>

              <Box flexShrink={0}>
                <svg
                  height={result.layout.height}
                  width={result.layout.width}
                >
                  {result.layout.parentGroups.map((group) => (
                    <ParentChildEdge
                      group={group}
                      key={group.id}
                    />
                  ))}

                  {result.layout.secondaryParentEdges.map((edge) => (
                    <SecondaryParentEdge
                      edge={edge}
                      key={edge.id}
                    />
                  ))}

                  {result.layout.marriageEdges.map((edge) => (
                    <MarriageEdge
                      edge={edge}
                      key={edge.id}
                    />
                  ))}

                  {result.layout.nodes.map((node) => {
                    const person = personMap.get(node.personId);
                    if (person === undefined) {
                      return null;
                    }
                    return (
                      <PersonNode
                        key={node.personId}
                        node={node}
                        person={person}
                      />
                    );
                  })}
                </svg>
              </Box>
            </Flex>
          </Box>
        )
        : null}
    </Flex>
  );
}
