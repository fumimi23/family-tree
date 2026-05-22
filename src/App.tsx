import '@/App.css';
import { FamilyTree } from '@/components/familyTree/FamilyTree';
import { PeopleTable } from '@/components/person/PeopleTable';
import { RelationTable } from '@/components/relation/RelationTable';
import { H1 } from '@/components/ui/H1';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { PrimaryLink } from '@/components/ui/PrimaryLink';
import { toaster, Toaster } from '@/components/ui/toaster';
import { importJsonSchema } from '@/schemas/importJsonSchema';
import { usePeopleStore } from '@/store/personStore';
import { useRelationStore } from '@/store/relationStore';
import { Flex, Grid, GridItem, Input } from '@chakra-ui/react';
import React from 'react';

function App(): React.ReactNode {
  const people = usePeopleStore((state) => state.people);
  const relations = useRelationStore((state) => state.relations);
  const url = React.useMemo(() => {
    const json = JSON.stringify({ people,
      relations });
    const blob = new Blob([json], { type: 'application/json' });
    return URL.createObjectURL(blob);
  },
  [people, relations]);

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      try {
        if (!event.target) {
          console.error('ファイルの読み込みに失敗しました。');
          toaster.create({
            title: 'インポートに失敗しました。',
            description: 'ファイルの読み込みに失敗しました。',
            type: 'error',
          });
          return;
        }
        if (event.target.result === null || event.target.result === '') {
          console.error('ファイルが空です。');
          toaster.create({
            title: 'インポートに失敗しました。',
            description: 'ファイルが空です。',
            type: 'error',
          });
          return;
        }
        const jsonString = event.target.result as string;
        const jsonData = importJsonSchema.parse(JSON.parse(jsonString));
        const { people: newPeople, relations: newRelations } = jsonData;
        usePeopleStore.setState({ people: newPeople });
        useRelationStore.setState({ relations: newRelations });
        toaster.create({
          title: 'インポートに成功しました。',
          description: 'データの読み込みに成功しました。',
          type: 'success',
        });
      } catch (error) {
        console.error('データの読み込みに失敗しました。', error);
        toaster.create({
          title: 'インポートに失敗しました。',
          description: 'データの読み込みに失敗しました。',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
  }, []);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleImportClick = React.useCallback((): void => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  },
  []);

  return (
    <>
      <Grid
        gap={4}
        templateColumns="repeat(2, 1fr)"
      >
        <GridItem colSpan={2}>
          <Flex justifyContent="space-between">
            <H1>
              家系図作成ツール
            </H1>

            <Flex gap={2}>
              <PrimaryLink
                download="family-tree.json"
                href={url}
              >
                エクスポート
              </PrimaryLink>

              <PrimaryButton onClick={handleImportClick}>
                インポート
              </PrimaryButton>
            </Flex>
          </Flex>
        </GridItem>

        <GridItem colSpan={1}>
          <PeopleTable />
        </GridItem>

        <GridItem colSpan={1}>
          <RelationTable />
        </GridItem>

        <GridItem colSpan={2}>
          <FamilyTree />
        </GridItem>

      </Grid>

      <Input
        accept=".json"
        display="none"
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
      />

      <Toaster />
    </>
  );
}

export default App;
