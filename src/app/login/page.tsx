import { Suspense } from "react";
import { LoginForm } from "@/app/login/login-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-fg-secondary">
          …
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
