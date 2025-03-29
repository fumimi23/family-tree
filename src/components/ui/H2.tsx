import { Heading, type HeadingProps } from '@chakra-ui/react';
import React from 'react';

export function H2(props: HeadingProps): React.ReactNode {
  return (
    <Heading
      as="h2"
      size="xl"
      {...props}
    />
  );
}
