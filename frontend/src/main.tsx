import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@fontsource-variable/vazirmatn';
import './styles/index.css';
import { App } from './App';
import { theme } from './theme';
import { DemoStoreProvider } from './data/DemoStoreContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <DirectionProvider initialDirection="rtl" detectDirection>
      <MantineProvider theme={theme} forceColorScheme="light">
        <Notifications position="top-left" limit={4} zIndex={5000} />
        <DemoStoreProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DemoStoreProvider>
      </MantineProvider>
    </DirectionProvider>
  </StrictMode>,
);
