import Image from "next/image";

/** SVG coin stamp mark — M inside a circular dashed ring */
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <Image
      src="/mintmark-logo.png"
      alt="Mintmark logo"
      width={size}
      height={size}
      loading="eager"
    />
  )
}
