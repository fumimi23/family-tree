import { Button, type ButtonProps } from '@chakra-ui/react';
import React from 'react';

export function PrimaryButton(props: ButtonProps): React.ReactNode {
  return (
    <Button
      bg={{ base: 'black',
        _dark: 'white' }}
      {...props}
    />
  );
}
