import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Adicione esta configuração para permitir imagens de URLs externas
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;