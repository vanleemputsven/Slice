import Image from "next/image";

export function SliceMark({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <Image
        src="/logo.svg"
        alt="Slice"
        width={200}
        height={70}
        className="h-8 w-auto max-w-[min(100%,12.5rem)] object-contain object-left sm:h-9"
        priority
        unoptimized
      />
    </span>
  );
}
