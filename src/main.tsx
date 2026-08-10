import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrandingProvider } from './context/BrandingContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrandingProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrandingProvider>
  </StrictMode>,
);
