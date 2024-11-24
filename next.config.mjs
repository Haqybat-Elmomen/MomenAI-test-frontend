// import BuilderDevTools from "@builder.io/dev-tools/next";
// import type { NextConfig } from "next";

// const nextConfig = BuilderDevTools()({});

 
/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@react-aria', '@react-stately', '@adobe/react-spectrum'],
    typescript: {
        ignoreBuildErrors: true,  // Ignore TypeScript errors on build
      },
      eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors on build
      },
}
 
export default nextConfig;
