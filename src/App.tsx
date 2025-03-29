import '@/App.css';
import { PeopleTable } from '@/components/person/PeopleTable';
import { RelationTable } from '@/components/relation/RelationTable';
import { H1 } from '@/components/ui/H1';
import { Grid, GridItem } from '@chakra-ui/react';

function App(): React.ReactNode {
  return (
    <>
      <Grid
        gap={4}
        templateColumns="repeat(2, 1fr)"
      >
        <GridItem colSpan={2}>
          <H1>
            家系図作成ツール
          </H1>
        </GridItem>

        <GridItem colSpan={1}>
          <PeopleTable />
        </GridItem>

        <GridItem colSpan={1}>
          <RelationTable />
        </GridItem>

      </Grid>
    </>
  );
}

export default App;
