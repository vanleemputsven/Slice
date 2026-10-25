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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
    </SliceBootScreen>
  );
}
