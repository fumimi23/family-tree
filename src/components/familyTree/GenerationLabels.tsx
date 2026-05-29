import { Box, Text } from '@chakra-ui/react';
import React from 'react';

import { LABELS_WIDTH } from '@/components/familyTree/layout/internalTypes';
import { type GenerationRowLayout } from '@/components/familyTree/types';

interface Props {
  rows: GenerationRowLayout[];
  totalHeight: number;
  zoom: number;
}

/*
 * 世代ラベルの縦帯。左端に sticky で配置され、世代ごとに「第N世代」と表示する。
 */
export function GenerationLabels({ rows, totalHeight, zoom }: Props): React.ReactNode {
  return (
    <Box
      bg="bg"
      flexShrink={0}
      height={`${(totalHeight * zoom).toString()}px`}
      left={0}
      position="sticky"
      width={`${LABELS_WIDTH.toString()}px`}
      zIndex={1}
    >
      {rows.map((row) => (
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
  );
}
