import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'local-origin.dev', 
    '*.local-origin.dev',
    '192.168.120.21',
    '192.168.120.*', // Permite cualquier dispositivo en esta subred
  ],
};

export default nextConfig;
