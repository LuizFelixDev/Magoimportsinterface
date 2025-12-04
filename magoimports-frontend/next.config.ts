const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com', port: '', pathname: '/**' },
      { protocol: 'http', hostname: 'seusite.com', port: '', pathname: '/img/**' },
      { protocol: 'https', hostname: 'media.istockphoto.com', port: '', pathname: '/**' }, 
    ],
  },
};

export default nextConfig;