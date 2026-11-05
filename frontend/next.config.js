/**
 * Backend connection
 * ------------------
 * Set BACKEND_URL (e.g. https://bevsupply-api.onrender.com) and every request to
 * /api/* on this site is proxied to the backend. The browser only ever talks to
 * this site, so the login cookie is first-party and no CORS setup is needed.
 *
 * Alternatively set NEXT_PUBLIC_API_URL to call the API directly (cross-origin).
 * With neither set, the storefront runs on its built-in demo data.
 */
const backendUrl = (process.env.BACKEND_URL || "").replace(/\/+$/, "").replace(/\/api$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: backendUrl ? "/api" : process.env.NEXT_PUBLIC_API_URL || "",
  },
  async rewrites() {
    return backendUrl ? [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }] : [];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;
