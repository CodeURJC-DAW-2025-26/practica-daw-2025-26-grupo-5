// ============================================================================
// FILE: frontend/app/routes/home.tsx
// UPDATED: Complete JSDoc documentation with English comments
// ============================================================================

/**
 * Home Page Component
 *
 * The Home page serves as the main landing page and marketplace hub for Stilnovo.
 * It displays the hero section with marketplace introduction and product listings.
 *
 * Page Structure:
 * ┌──────────────────────────────────────┐
 * │ Header (Navigation)                  │
 * ├──────────────────────────────────────┤
 * │ Hero Section (Homepage only)         │ ← Intro, features, featured items
 * │                                      │
 * │ <Outlet /> - Route Content           │ ← Product listings, search results
 * ├──────────────────────────────────────┤
 * │ Footer                               │
 * └──────────────────────────────────────┘
 *
 * Router Integration:
 * This component uses React Router 7's nested routing:
 * - <Outlet /> renders the matched child route
 * - Children routes can be:
 *   - Product search results page
 *   - Product detail page
 *   - Category listings
 * - Hero section only shows when pathname === "/"
 *
 * Component Dependencies:
 * - React Router 7 - Outlet, useNavigation, useLocation
 * - Header component - Navigation bar
 * - Footer component - Page footer
 * - HeroSection component - Welcome banner
 * - Loader component - Loading indicators
 *
 * @returns React component for home page layout
 */

import { Outlet, useNavigation, useLocation } from "react-router";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import HeroSection from "~/components/HomeHeroSection";
import Loader from "~/components/Loader";

/**
 * Home Component
 *
 * Renders the main page layout with header, hero section, and nested routes.
 * Manages page-level navigation and loading states.
 */
export default function Home() {
  /**
   * React Router Navigation Hook
   *
   * Provides information about current navigation state:
   * - navigation.state: "idle" | "loading" | "submitting"
   * - navigation.location: Target location of navigation
   * - navigation.formData: Form data if submitting
   *
   * Used to show loading indicators during route transitions
   */
  const navigation = useNavigation();

  /**
   * React Router Location Hook
   *
   * Provides current page location info:
   * - location.pathname: Current URL path
   * - location.search: Query string parameters
   * - location.hash: Fragment identifier (#section)
   *
   * Used to conditionally show hero section (only on homepage)
   */
  const location = useLocation();
  
  /**
   * Loading State Detection
   *
   * Tracks if a route transition is in progress.
   * Used to show full-page loading spinner during navigation.
   *
   * Why check this?
   * - User experience: Shows that something is happening
   * - Prevents layout jank from loading delays
   * - Gives visual feedback for slow connections
   */
  const isLoading = navigation.state === "loading";

  /**
   * Navigation Target Path
   *
   * Determines where user is navigating to.
   * Used to detect if navigating to product detail page.
   *
   * Example: If navigating to /product/123, nextPath = "/product/123"
   */
  const nextPath = navigation.location?.pathname || "";

  /**
   * Detect Product Navigation
   *
   * Checks if navigation target is a product page.
   * Currently set but not used in this component (can be used for 
   * optimized loading states or analytics tracking).
   *
   * Pattern: All product pages start with /product
   */
  const isGoingToProduct = nextPath.startsWith("/product");

  return (
    <>
      {/* Header Navigation: Appears on all pages */}
      <Header />

      {/* Main Page Content */}
      <main>
        {/* Hero Section: Only show on homepage (not on child routes)
            Purpose: Welcome message, featured products, marketplace intro
            Condition: Only displays when pathname === "/"
            This prevents showing hero on product details or search results
        */}
        {location.pathname === "/" && <HeroSection />}

        {/* Nested Routes Outlet
            Purpose: Renders child route components
            Examples:
            - / → index route (product listings)
            - /product/:id → product detail page
            - ?query=... → search results
            
            Each child route is responsible for its own content and data fetching.
            The <Outlet /> acts as a placeholder for these components.
        */}
        <Outlet /> 
      </main>

      {/* Full-Page Loading Spinner
          Shows during route transitions to indicate navigation in progress.
          Provides visual feedback that app is responsive and loading new content.
      */}
      {isLoading && <Loader />}

      {/* Footer: Appears on all pages */}
      <Footer />
    </>
  );
}
