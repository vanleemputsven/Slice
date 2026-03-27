import { Suspense } from "react";
import { SubscriptionsClient } from "@/components/subscriptions/subscriptions-client";
import { SubscriptionsSkeleton } from "@/components/subscriptions/subscriptions-skeleton";

export const metadata = {
  title: "Subscriptions",
  description:
    "Add and edit subscriptions: price, sharing, billing cycle, and next payment.",
};

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsSkeleton />}>
      <SubscriptionsClient />
    </Suspense>
  );
}
