import { Button, type ButtonProps } from '@chakra-ui/react';

export function PrimaryButton(props: ButtonProps): React.ReactNode {
  return (
    <Button
      bg={{ base: 'black',
        _dark: 'white' }}
      {...props}
    />
  );
}
