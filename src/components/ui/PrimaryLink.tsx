import { Link, type LinkProps } from '@chakra-ui/react';
import React from 'react';

/**
 * PrimaryButtonと同じデザインのLinkコンポーネント
 * @param props - LinkProps
 * @returns
 */
export function PrimaryLink(props: LinkProps): React.ReactNode {
  return (
    <Link
      {...props}
      _hover={{
        borderColor: '#646cff',
      }}
      bg={{ base: 'black',
        _dark: 'white' }}
      border="1px solid transparent"
      borderRadius={8}
      color={{ base: 'white',
        _dark: 'black' }}
      fontSize="1em"
      fontWeight={500}
      height={10}
      padding="0.6em 1.2em"
      transition="border-color 0.25s"
    />
  );
}
