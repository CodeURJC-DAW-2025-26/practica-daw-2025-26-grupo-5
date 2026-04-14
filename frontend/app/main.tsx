import { HydratedRouter } from 'react-router/dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register AG Grid community modules
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * React Application Entry Point
 * Executes the app like main()
 * Uses React Router v7 with HydratedRouter to enable client-side routing and hydration
 * because Spring Boot serves the SPA from the /new/ context path
 */
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <HydratedRouter />
  </StrictMode>
);
