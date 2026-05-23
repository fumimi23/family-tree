import { layoutFamilyTree } from '@/components/familyTree/layoutFamilyTree';
import { MarriageEdge } from '@/components/familyTree/MarriageEdge';
import { ParentChildEdge } from '@/components/familyTree/ParentChildEdge';
import { PersonNode } from '@/components/familyTree/PersonNode';
import { SecondaryParentEdge } from '@/components/familyTree/SecondaryParentEdge';
import { PersonDialog } from '@/components/person/PersonDialog';
import { H2 } from '@/components/ui/H2';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { type Person } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';
import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];
const DEFAULT_ZOOM_INDEX = 3;

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
  const [editingPersonId, setEditingPersonId] = React.useState<string | null>(null);
  const editingPerson = editingPersonId === null
    ? undefined
    : personMap.get(editingPersonId);
  const handleNodeClick = React.useCallback((personId: string): void => {
    setEditingPersonId(personId);
  }, []);
  const handleDialogOpenChange = React.useCallback((e: { open: boolean }): void => {
    if (!e.open) {
      setEditingPersonId(null);
    }
  }, []);
  const [zoomIndex, setZoomIndex] = React.useState(DEFAULT_ZOOM_INDEX);
  const zoom = ZOOM_LEVELS[zoomIndex];
  const handleZoomIn = React.useCallback((): void => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  }, []);
  const handleZoomOut = React.useCallback((): void => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  }, []);
  const handleZoomReset = React.useCallback((): void => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  }, []);
  const zoomPercent = Math.round(zoom * 100);
  const showTree = result.ok && people.length > 0;

  return (
    <Flex direction="column">
      <Flex
        alignItems="center"
        justifyContent="space-between"
      >
        <H2>
          家系図
        </H2>

        {showTree
          ? (
            <Flex
              alignItems="center"
              gap={2}
            >
              <PrimaryButton
                aria-label="ズームアウト"
                onClick={handleZoomOut}
                size="sm"
                title="ズームアウト"
              >
                −
              </PrimaryButton>

              <Text
                fontSize="sm"
                minWidth="50px"
                textAlign="center"
              >
                {`${zoomPercent.toString()}%`}
              </Text>

              <PrimaryButton
                aria-label="ズームイン"
                onClick={handleZoomIn}
                size="sm"
                title="ズームイン"
              >
                +
              </PrimaryButton>

              <PrimaryButton
                onClick={handleZoomReset}
                size="sm"
              >
                リセット
              </PrimaryButton>
            </Flex>
          )
          : null}
      </Flex>

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

      {showTree
        ? (
          <Box
            maxHeight="70vh"
            overflowX="auto"
            overflowY="auto"
          >
            <Flex>
              <Box
                bg="bg"
                flexShrink={0}
                height={`${(result.layout.height * zoom).toString()}px`}
                left={0}
                position="sticky"
                width="64px"
                zIndex={1}
              >
                {result.layout.generationRows.map((row) => (
                  <Box
                    alignItems="center"
                    display="flex"
                    height={`${(row.height * zoom).toString()}px`}
                    justifyContent="center"
                    key={row.y}
                    left={0}
                    position="absolute"
                    top={`${(row.y * zoom).toString()}px`}
                    width="100%"
                  >
                    <Text
                      color="fg.muted"
                      fontSize="xs"
                    >
                      {`第${(row.generation + 1).toString()}世代`}
                    </Text>
                  </Box>
                ))}
              </Box>

              <Box flexShrink={0}>
                <svg
                  height={result.layout.height * zoom}
                  viewBox={`0 0 ${result.layout.width.toString()} ${result.layout.height.toString()}`}
                  width={result.layout.width * zoom}
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
                        onClick={handleNodeClick}
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

      {editingPerson === undefined
        ? null
        : (
          <PersonDialog
            isOpen
            key={editingPerson.id}
            onOpenChange={handleDialogOpenChange}
            person={editingPerson}
          />
        )}
    </Flex>
  );
}
