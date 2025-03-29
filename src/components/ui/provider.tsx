import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from '@/components/ui/color-mode';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';

export function Provider(props: ColorModeProviderProps): React.ReactNode {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
