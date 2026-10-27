import { AppHeader } from "@/components/layout/app-header";
import { SliceBootScreen } from "@/components/layout/slice-boot-screen";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SliceBootScreen>
    <div className="relative min-h-screen bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at center, rgb(255 255 255 / 0.055) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 75% 70% at 50% 0%, black, transparent)",
        }}
      />
      <div className="relative">
        <AppHeader />
        <main
          id="app-main"
          tabIndex={-1}
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </div>
    </div>
    </SliceBootScreen>
  );
}
