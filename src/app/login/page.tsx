import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";
import { LoginPageSkeleton } from "@/components/skeleton/auth-skeleton";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
