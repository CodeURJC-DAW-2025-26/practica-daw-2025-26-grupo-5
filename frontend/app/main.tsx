import { HydratedRouter } from 'react-router/dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * React Application Entry Point
 * 
 * Uses React Router v7 with HydratedRouter to enable client-side routing and hydration
 * because Spring Boot serves the SPA from the /new/ context path
 */
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);
