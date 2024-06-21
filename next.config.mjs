/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },

  // async redirects() {
  //   return [
  //     // Temporary redirect
  //     {
  //       source: '/',
  //       destination: '/hold',
  //       permanent: false,
  //     },
  //   ];
  // },
};

export default nextConfig;
