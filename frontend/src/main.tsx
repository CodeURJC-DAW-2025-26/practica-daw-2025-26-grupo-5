import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

/**
 * React Application Entry Point.
 * 
 * IMPORTANT: 'basename="/new"' is required because Spring Boot serves 
 * the SPA from the /new/ context path. Without this, internal links 
 * and browser history will not work correctly when deployed.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/new">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
