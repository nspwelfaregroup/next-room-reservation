import Image from "next/image";
import clsx from "clsx";

/** รูปโปรไฟล์ LINE — ถ้าไม่มีรูปแสดงตัวอักษรแรกแทน */
export default function Avatar({ src, name, size = 40, className }: { src?: string | null; name: string; size?: number; className?: string }) {
  if (src) {
    return <Image src={src} alt={name} width={size} height={size} className={clsx("rounded-full object-cover shrink-0", className)} />;
  }
  return (
    <div
      style={{ width: size, height: size }}
      className={clsx("rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold shrink-0", className)}
    >
      {name.slice(0, 1)}
    </div>
  );
}
