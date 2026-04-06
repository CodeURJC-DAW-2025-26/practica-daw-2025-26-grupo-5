import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

/**
 * Stilnovo SPA Routes Configuration
 * 
 * Route structure:
 * - home.tsx serves as the main layout (Navbar, Outlet, Footer)
 * - Product routes are indexed and nested under home layout
 */
export default [
  layout("routes/home.tsx", [
    index("routes/product-list.tsx"),
    route("product/:id", "routes/product-detail.tsx"),
    route("product/:id/edit", "routes/product-edit.tsx"),
    route("product/new", "routes/product-new.tsx"),
    
    // Possible future routes (commented out - not yet implemented):
    // route("user/:id", "routes/user-profile.tsx"),
    // route("user/settings", "routes/user-settings.tsx"),
    // route("user/products", "routes/user-products.tsx"),
    // route("admin", "routes/admin-panel.tsx"),
    // route("admin/users", "routes/admin-users.tsx"),
    // route("admin/transactions", "routes/admin-transactions.tsx"),
    // route("search", "routes/search.tsx"),
    // route("checkout", "routes/checkout.tsx"),
    // route("orders", "routes/orders.tsx"),
    // route("help", "routes/help-center.tsx"),
    
    route("*", "routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;