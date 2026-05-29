import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { applyFilter, type FilterCriteria } from '@/components/familyTree/applyFilter';
import { FamilyTreeFilter } from '@/components/familyTree/FamilyTreeFilter';
import { FamilyTreeToolbar } from '@/components/familyTree/FamilyTreeToolbar';
import { LABELS_WIDTH } from '@/components/familyTree/layout/internalTypes';
import { layoutFamilyTree } from '@/components/familyTree/layoutFamilyTree';
import { MarriageEdge } from '@/components/familyTree/MarriageEdge';
import { Minimap } from '@/components/familyTree/Minimap';
import { ParentChildEdge } from '@/components/familyTree/ParentChildEdge';
import { PersonNode } from '@/components/familyTree/PersonNode';
import { SecondaryMarriageEdge } from '@/components/familyTree/SecondaryMarriageEdge';
import { SecondaryParentEdge } from '@/components/familyTree/SecondaryParentEdge';
import { useFamilyTreeExport } from '@/components/familyTree/useFamilyTreeExport';
import { useWheelZoom } from '@/components/familyTree/useWheelZoom';
import { PersonDialog } from '@/components/person/PersonDialog';
import { H2 } from '@/components/ui/H2';
import { type Person } from '@/schemas/personSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';

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
  const [filterCriteria, setFilterCriteria] = React.useState<FilterCriteria | null>(null);

  /*
   * 起点人物が削除された場合は、その criteria を実効的に無視する。
   * effect で state を書き換えるとカスケード再レンダリングが発生するため、
   * 派生値として「現在有効な criteria」を計算して以降の処理で使う。
   */
  const effectiveCriteria = filterCriteria !== null
    && personMap.has(filterCriteria.focusPersonId)
    ? filterCriteria
    : null;

  const filtered = React.useMemo(
    () => applyFilter(people, relations, effectiveCriteria),
    [people, relations, effectiveCriteria],
  );
  const result = React.useMemo<LayoutResult>(() => {
    try {
      return {
        ok: true,
        layout: layoutFamilyTree(filtered.people, filtered.relations),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        error: message,
      };
    }
  }, [filtered]);
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
  const { svgRef, handleExportSvg, handleExportPng } = useFamilyTreeExport(
    result.ok
      ? { width: result.layout.width,
        height: result.layout.height }
      : null,
  );
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

  const containerRef = React.useRef<HTMLDivElement>(null);
  useWheelZoom({
    containerRef,
    enabled: showTree,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  return (
    <Flex
      direction="column"
      position="relative"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
      >
        <H2>
          家系図
        </H2>

        {showTree
          ? (
            <FamilyTreeToolbar
              onExportPng={handleExportPng}
              onExportSvg={handleExportSvg}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              zoomPercent={zoomPercent}
            />
          )
          : null}
      </Flex>

      {people.length > 0
        ? (
          <FamilyTreeFilter
            criteria={effectiveCriteria}
            onChange={setFilterCriteria}
            people={people}
          />
        )
        : null}

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
            height="70vh"
            overflowX="auto"
            overflowY="auto"
            ref={containerRef}
          >
            <Flex>
              <Box
                bg="bg"
                flexShrink={0}
                height={`${(result.layout.height * zoom).toString()}px`}
                left={0}
                position="sticky"
                width={`${LABELS_WIDTH.toString()}px`}
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
                  ref={svgRef}
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

                  {result.layout.secondaryMarriageEdges.map((edge) => (
                    <SecondaryMarriageEdge
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

      {showTree
        ? (
          <Box
            bottom={4}
            position="absolute"
            right={4}
            zIndex={2}
          >
            <Minimap
              containerRef={containerRef}
              layout={result.layout}
              zoom={zoom}
            />
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
