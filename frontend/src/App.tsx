import { Routes, Route } from 'react-router-dom';
// Standard Bootstrap CSS import
import 'bootstrap/dist/css/bootstrap.min.css';

// Layout and Global components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalSpinner } from './components/GlobalSpinner'; 

// Page components
import { Home } from './pages/Home';
import { Login } from './pages/Login';

/**
 * Temporary placeholder for the Products page.
 * To be replaced by a dedicated component once API integration starts.
 */
const ProductsPlaceholder = () => (
  <div className="container mt-5">
    <h1>Product Catalog</h1>
    <p className="text-muted">
      Status: Under development.
      Next steps: Implement REST API calls using Axios and handle pagination.
    </p>
  </div>
);

/**
 * Main Application Shell.
 * This component defines the global structure of the SPA, 
 * including navigation, routing, and the shared Global Spinner.
 */
function App() {
  return (
    // Flexbox wrapper for sticky footer and full-page layout (min-vh-100)
    <div className="d-flex flex-column min-vh-100">

      {/* 
        Global Spinner: Automatically triggered by Axios interceptors 
        defined in src/services/api.ts whenever an API call is made.
      */}
      <GlobalSpinner />

      {/* Persistent Navigation Bar */}
      <Navbar />

      {/* Dynamic Content Area: Components switch based on the URL path */}
      <main className="flex-grow-1">
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Authentication Page (React-Bootstrap + Zustand) */}
          <Route path="/login" element={<Login />} />

          {/* Catalog View (Currently under development) */}
          <Route path="/products" element={<ProductsPlaceholder />} />

          {/* Catch-all 404 Route for non-existent paths */}
          <Route path="*" element={
            <div className="container mt-5">
              <h1 className="display-4 text-danger">404 - Not Found</h1>
              <hr />
              <p className="lead">The requested page does not exist in the Stilnovo SPA.</p>
            </div>
          } />
        </Routes>
      </main>

      {/* Persistent Page Footer */}
      <Footer />
    </div>
  );
}

export default App;
