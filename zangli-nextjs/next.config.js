/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      const WorkboxPlugin = require('workbox-webpack-plugin');
      config.plugins.push(
        new WorkboxPlugin.GenerateSW({
          swDest: 'static/sw.js',
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https?.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'offlineCache',
                expiration: {
                  maxEntries: 200,
                },
              },
            },
          ],
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig; 