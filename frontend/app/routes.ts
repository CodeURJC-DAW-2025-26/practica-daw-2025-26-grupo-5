import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

/**
 * Stilnovo SPA Routes Configuration
 * 
 * Route structure:
 * - ProtectedLayout wraps all authenticated routes and enforces ban status
 * - home.tsx serves as the main layout (Navbar, Outlet, Footer)
 * - Product routes are indexed and nested under home layout
 * - admin.tsx serves as the admin layout (Sidebar, Outlet)
 * - Admin routes are nested under admin layout
 */
export default [
  // Protected routes - wrapped with ban status check 
  layout("routes/protected-layout.tsx", [
    layout("routes/home.tsx", [
      //products
      index("routes/product/product-list.tsx"),
      route("product/:id", "routes/product/product-detail.tsx"), 
      route("product/contact/:id", "routes/product/product-contact.tsx"),

      //transactions
      route("transactions/payment/:id", "routes/transactions/payment-page.$id.tsx"),

      //seller
      route("seller/:id", "routes/user/seller-profile.tsx"),
    ]),

    //Private user routes
    layout("routes/user.tsx", [
      route("user/page", "routes/user/user-page.tsx"),
      route("user/products", "routes/user/user-products.tsx"),
      route("user/sales-orders", "routes/user/user-sales-orders.tsx"),
      route("user/valorations", "routes/user/user-valorations.tsx"),
      route("user/statistics", "routes/user/user-statistics.tsx"),
      route("user/settings", "routes/user/user-settings.tsx"),
      route("user/help", "routes/user/user-help-center.tsx"),

      route("product/new", "routes/product/product-new.tsx"),
      route("product/:id/edit", "routes/product/product-edit.tsx"),
    ]),

    // Admin routes with separate layout
    layout("routes/admin.tsx", [
      route("admin", "routes/admin/admin-dashboard.tsx", { index: true }),
      route("admin/users", "routes/admin/admin-users.tsx"),
      route("admin/inventory", "routes/admin/admin-inventory.tsx"),
      route("admin/transactions", "routes/admin/admin-transactions.tsx"),
      route("admin/valorations", "routes/admin/admin-valorations.tsx"),
    ]),
  ]),

  // Public routes - NOT protected (All users)
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("banned", "routes/banned.tsx"),
  route("about", "routes/about-us.tsx"),

  route("*", "routes/error-page.tsx"),
] satisfies RouteConfig;