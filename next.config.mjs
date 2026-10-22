/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // AVIF first, WebP fallback — both are dramatically smaller than the
    // 2MB source PNGs in /public/images. Next serves the best format the
    // browser accepts.
    formats: ["image/avif", "image/webp"],
    // Dev: 0 so replacing a source file under /public shows up on next
    // request without manually clearing .next/cache/images. Prod: 30 days
    // — repeat visits hit the CDN/browser cache instead of re-decoding.
    minimumCacheTTL: process.env.NODE_ENV === "development" ? 0 : 60 * 60 * 24 * 30,
    // Only picsum is allowed — the SafeImage fallback when a local file is
    // missing. Unsplash and Pexels are deliberately excluded so no stock
    // imagery can slip into the site.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
  },
  experimental: {
    optimizePackageImports: ["framer-motion"]
  }
};

export default nextConfig;
