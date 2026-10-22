import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Next.js App Router emits inline bootstrap scripts, so script-src keeps 'unsafe-inline' until a
// nonce-based CSP (middleware + dynamic rendering) is adopted. Everything else is locked down.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@node-rs/argon2", "@prisma/client"],
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
        ],
      },
      { source: "/(tai-khoan|thanh-toan|gio-hang|admin|seller|studio|bao-gia|don-hang)(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default config;
