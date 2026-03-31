import { Routes, Route } from 'react-router-dom';
// Bootstrap CSS import (can also be moved to main.tsx)
import 'bootstrap/dist/css/bootstrap.min.css';

// Layout and Page components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';

/**
 * Temporary placeholders to help teammates understand 
 * how to create new pages and link them to the Router.
 */
const LoginPlaceholder = () => (
  <div className="container mt-5">
    <h1>Login Page</h1>
    <p>Coming soon: React-Bootstrap forms and Zustand authentication.</p>
  </div>
);

const ProductsPlaceholder = () => (
  <div className="container mt-5">
    <h1>Product Catalog</h1>
    <p>Coming soon: API REST integration with clientLoaders and pagination.</p>
  </div>
);

/**
 * Main Application Component.
 * It manages the global layout (Navbar/Footer) and defines the routing table.
 */
function App() {
  return (
    // Flexbox wrapper to ensure a sticky footer (min-vh-100)
    <div className="d-flex flex-column min-vh-100">
      {/* Navigation bar is visible on all routes */}
      <Navbar />

      {/* Dynamic content area that changes based on the URL */}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPlaceholder />} />
          <Route path="/products" element={<ProductsPlaceholder />} />
          
          {/* Default 404 route for unknown paths */}
          <Route path="*" element={
            <div className="container mt-5">
              <h1>404 - Page Not Found</h1>
            </div>
          } />
        </Routes>
      </main>

      {/* Footer is visible on all routes */}
      <Footer />
    </div>
  );
}

export default App;
