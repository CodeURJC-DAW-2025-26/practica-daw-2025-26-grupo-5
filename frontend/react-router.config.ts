import type { Config } from "@react-router/dev/config";

/**
 * React Router v7 Configuration
 * SPA mode enabled - no server-side rendering
 */
export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
} satisfies Config;