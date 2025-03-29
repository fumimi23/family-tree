import { Heading, type HeadingProps } from '@chakra-ui/react';
import React from 'react';

export function H1(props: HeadingProps): React.ReactNode {
  return (
    <Heading
      as="h1"
      size="2xl"
      {...props}
    />
  );
}
