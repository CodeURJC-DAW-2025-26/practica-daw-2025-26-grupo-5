import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css'

/**
 * React Entry Point.
 * Note the 'basename="/new"'. This is mandatory for Spring Boot 
 * to correctly serve the SPA from the /new/ context path.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/new">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
