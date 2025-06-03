import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Canvas 라이브러리 외부화 (서버사이드에서만)
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    
    // Tesseract.js worker 파일 처리
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // 파일 로더 규칙 추가
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });
    
    return config;
  },
  serverExternalPackages: ['tesseract.js', 'canvas', 'sharp'],
};

export default nextConfig;
