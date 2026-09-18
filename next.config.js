/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // aligné sur la limite d'upload (10 Mo fichier + marge)
    },
  },
};

module.exports = nextConfig;
