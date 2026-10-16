import Image from "next/image";

/**
 * 智能图片：本地路径（/uploads/...）走 next/image 优化；外链用原生 img（避免域名配置）。
 */
export function SmartImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  if (!src) return null;

  const isExternal = /^https?:\/\//.test(src);
  if (isExternal) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
    />
  );
}
