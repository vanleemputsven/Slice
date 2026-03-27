export function SubscriptionsSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-10 w-64 rounded-2xl bg-white/[0.06]" />
      <div className="h-24 rounded-2xl bg-white/[0.04]" />
      <div className="slice-card h-96" />
    </div>
  );
}
