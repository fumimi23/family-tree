import '@/App.css';
import { PeopleTable } from '@/components/person/PeopleTable';
import { Grid, GridItem, Heading } from '@chakra-ui/react';

function App(): React.ReactNode {
  return (
    <>
      <Grid
        gap={4}
        templateColumns="repeat(2, 1fr)"
      >
        <GridItem colSpan={2}>
          <Heading
            as="h1"
            size="2xl"
          >
            家系図作成ツール
          </Heading>
        </GridItem>

        <GridItem colSpan={1}>
          <PeopleTable />
        </GridItem>

        <GridItem colSpan={1}>
          <PeopleTable />
        </GridItem>

      </Grid>
    </>
  );
}

export default App;
