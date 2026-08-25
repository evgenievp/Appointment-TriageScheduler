import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './i18n';             // инициализира i18next преди първия рендер
import './ds/styles.css';    // дизайн системата — глобално
import './ds/app.css';       // локалните токени отгоре

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Retrying a dead token only delays the sign-out and doubles the toasts.
      retry: (count, error) => error?.status !== 401 && count < 1,
    },
  },
});

// Единственият флаг за превключване към истинския бекенд: VITE_USE_MOCKS=false.
// Вносът е динамичен и зад `import.meta.env.DEV`, за да не влезе MSW в
// продукционния bundle — в прод това е мъртъв код и отпада при билда.
async function startMocks() {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS === 'false') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

// MSW се вдига преди първия рендер, за да няма заявки покрай mock-овете.
startMocks().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
