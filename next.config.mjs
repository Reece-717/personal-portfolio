/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 构建时不阻断（类型检查仍然开启），提交前请手动运行 npm run lint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
