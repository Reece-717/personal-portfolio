/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: {
    // 用户上传的图片无需服务端优化，省去 sharp 依赖，部署更简单
    unoptimized: true,
  },
  eslint: {
    // 构建时不阻断（类型检查仍然开启），提交前请手动运行 npm run lint
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
