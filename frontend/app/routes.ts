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
    route("product/:id", "routes/product/product-detail.tsx"), //no va aqui, pues no queremos header ni footer, solo sidebar
    route("product/:id/edit", "routes/product/product-edit.tsx"),//no va aqui, pues no queremos header ni footer, solo sidebar
    route("product/new", "routes/product/product-new.tsx"),//no va aqui, pues no queremos header ni footer, solo sidebar
    
    // Possible future routes (commented out - not yet implemented):
    // route("user/:id", "routes/user-profile.tsx"),
    // route("user/settings", "routes/user-settings.tsx"),
    // route("user/products", "routes/user-products.tsx"),
    // route("search", "routes/search.tsx"),
    // route("checkout", "routes/checkout.tsx"),
    // route("orders", "routes/orders.tsx"),
    // route("help", "routes/help-center.tsx"),
  
  ]),

  // Public routes
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),

  //Private user routes
  layout("routes/user.tsx", [
    route("user-page", "routes/user/user-page.tsx"),
    route("user-products", "routes/user/user-products.tsx"),
    route("user-sales-orders", "routes/user/user-sales-orders.tsx"),
    route("user-valorations", "routes/user/user-valorations.tsx"),
    route("user-statistics", "routes/user/user-statistics.tsx"),
    route("user-user-settings", "routes/user/user-settings.tsx"),

  ]),

  // Admin routes with separate layout
  layout("routes/admin.tsx", [
    route("admin", "routes/admin/admin-dashboard.tsx", { index: true }),
    route("admin/users", "routes/admin/admin-users.tsx"),
    route("admin/inventory", "routes/admin/admin-inventory.tsx"),
    route("admin/transactions", "routes/admin/admin-transactions.tsx"),
    route("admin/valorations", "routes/admin/admin-valorations.tsx"),
  ]),

  route("*", "routes/error-page.tsx"),
] satisfies RouteConfig;