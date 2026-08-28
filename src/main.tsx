import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { GameProvider } from '@/context/GameContext';
import { registerSW } from 'virtual:pwa-register';
import './index.css';

// Automatically register and update service worker on new deployments
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload();
  },
});

// Main Application Entrypoint with Theme, Multi-Language & Game Providers
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found in DOM');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <GameProvider>
          <App />
        </GameProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);
