import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

/**
 * Stilnovo SPA Routes Configuration
 * 
 * Route structure:
 * - home.tsx serves as the main layout (Navbar, Outlet, Footer)
 * - Product routes are indexed and nested under home layout
 * - admin.tsx serves as the admin layout (Sidebar, Outlet)
 * - Admin routes are nested under admin layout
 */
export default [
  layout("routes/home.tsx", [
    index("routes/product/product-list.tsx"),
    route("product/:id", "routes/product/product-detail.tsx"),
    route("product/:id/edit", "routes/product/product-edit.tsx"),
    route("product/new", "routes/product/product-new.tsx"),
    
    // Possible future routes (commented out - not yet implemented):
    // route("user/:id", "routes/user-profile.tsx"),
    // route("user/settings", "routes/user-settings.tsx"),
    // route("user/products", "routes/user-products.tsx"),
    // route("search", "routes/search.tsx"),
    // route("checkout", "routes/checkout.tsx"),
    // route("orders", "routes/orders.tsx"),
    // route("help", "routes/help-center.tsx"),
    
    route("*", "routes/not-found.tsx"),
  ]),

  // Public routes
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),

  // Admin routes with separate layout
  layout("routes/admin.tsx", [
    route("admin", "routes/admin/dashboard.tsx", { index: true }),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/inventory", "routes/admin/inventory.tsx"),
    route("admin/transactions", "routes/admin/transactions.tsx"),
    route("admin/valorations", "routes/admin/valorations.tsx"),
  ]),
] satisfies RouteConfig;