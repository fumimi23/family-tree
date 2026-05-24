import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import React from 'react';

import { Provider } from '@/components/ui/provider';

function Wrapper({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <Provider forcedTheme="light">
      {children}
    </Provider>
  );
}

export function renderWithProvider(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, {
    wrapper: Wrapper,
    ...options,
  });
}
