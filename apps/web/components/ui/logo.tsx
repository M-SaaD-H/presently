import Image from "next/image";

function Logo({ size = "small" }: { size?: "small" | "medium" | "large" }) {``
  const width = size === "small" ? 32 : size === "medium" ? 48 : 64;
  const height = size === "small" ? 32 : size === "medium" ? 48 : 64;
  return (
    <Image
      src="/logo_light.png"
      alt="Logo"
      width={width}
      height={height}
      className="object-cover"
    />
  )
}

export { Logo }
