/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pgqopytnbkjovvnwtvun.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/cabin-images/**",
      },
    ],
  },

  // experimental: {
  //   serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  // },
};

export default nextConfig;
