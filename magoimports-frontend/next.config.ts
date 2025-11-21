// Conteúdo esperado em next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**' },
      { protocol: 'http', hostname: 'seusite.com', port: '', pathname: '/img/**' },
    ],
  },
};