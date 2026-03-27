"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-fg">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-muted">
        An unexpected error occurred. You can try again.
      </p>
      <button type="button" className="slice-btn-primary" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
