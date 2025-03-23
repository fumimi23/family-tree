import App from '@/App';
import '@/index.css';
import { Provider } from '@/components/ui/provider.tsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root') as Element).render(
  <StrictMode>
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
