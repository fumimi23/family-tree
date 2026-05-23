import { StrictMode } from 'react';

import '@/index.css';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { Provider } from '@/components/ui/provider';

createRoot(document.getElementById('root') as Element).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
