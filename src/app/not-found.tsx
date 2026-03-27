import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-fg">Page not found</h1>
      <p className="max-w-md text-center text-sm text-muted">
        That route doesn&apos;t exist. Head back to your dashboard.
      </p>
      <Link href="/dashboard" className="slice-btn-primary">
        Open dashboard
      </Link>
    </div>
  );
}
