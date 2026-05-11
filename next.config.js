/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "pdf-to-png-converter",
    "pdf-parse",
    "tesseract.js",
    "@napi-rs/canvas",
  ],
};

module.exports = nextConfig;
