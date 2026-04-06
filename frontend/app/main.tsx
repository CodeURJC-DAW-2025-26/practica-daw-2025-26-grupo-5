import { HydratedRouter } from 'react-router/dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * React Application Entry Point
 * 
 * Uses React Router v7 with HydratedRouter
 * IMPORTANT: basename="/new" is configured in react-router.config.ts
 * because Spring Boot serves the SPA from the /new/ context path
 */
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);
