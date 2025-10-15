/** @type {import('next').NextConfig} */
const nextConfig = {
    // Ignore TypeScript errors during build
    typescript: {
        ignoreBuildErrors: true,
    },

    // Ignore ESLint errors during build
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Other Next.js config
    reactStrictMode: true,
}

export default nextConfig
