/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      // Cloudinary — uncomment when you switch to cloud storage
      // { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};
module.exports = nextConfig;
