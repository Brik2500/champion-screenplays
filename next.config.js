/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "pdf-to-png-converter",
    "pdf-parse",
    "tesseract.js",
    "@napi-rs/canvas",
    "pdfkit",
  ],
};

module.exports = nextConfig;
