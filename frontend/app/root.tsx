import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import "bootstrap/dist/css/bootstrap.min.css";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import type { Route } from "./+types/root";
import "./app.css";
import ErrorPage from "./routes/error-page";
import Loader from '~/components/Loader';

/**
 * Adds the HTML content displayed during the loading phase
 * of the SPA web interface.
 * Only for building phase. 
 * cmd => npm run build
 * /build/client
 * important! npx http-serve -p 8081 build/client 
 * Important API_URL have to be absolute route to avoid errors
 */
export function HydrateFallback(){
  return <p>Loading...</p>
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Stilnovo</title>
        <link rel="icon" type="image/svg+xml" href="/logo.png"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function App() {
  const navigation = useNavigation();
  
  const isLoading = navigation.state === "loading";

  return (
    <>
      {isLoading && <Loader />}
      <Outlet />
    </>
  );
}