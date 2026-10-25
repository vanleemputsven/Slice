import { AppHeader } from "@/components/layout/app-header";
import { SliceBootScreen } from "@/components/layout/slice-boot-screen";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SliceBootScreen>
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main
        id="app-main"
        tabIndex={-1}
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] outline-none sm:px-6 lg:px-8"
      >
        {children}
      </main>
    </div>
    </SliceBootScreen>
  );
}
