import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@components/common/ErrorBoundary';
import App from './App';
import './index.css';

/**
 * TanStack Query client — cấu hình global
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,   // 5 phút
    },
  },
});

/**
 * Root — wrap App với tất cả providers
 * BrowserRouter → QueryClient → Helmet → ErrorBoundary → App
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ErrorBoundary>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                },
                duration: 3000,
              }}
            />
          </ErrorBoundary>
        </HelmetProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
