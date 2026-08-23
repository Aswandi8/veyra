import Image, { type ImageProps } from "next/image";

interface AppImageProps extends ImageProps {
  alt: string;
}

export function AppImage({ alt, ...props }: AppImageProps) {
  return <Image alt={alt} {...props} />;
}
