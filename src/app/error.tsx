"use client";

import { useEffect } from "react";
import { useSliceT } from "@/lib/i18n/use-slice-t";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useSliceT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-fg">{t("error.title")}</h1>
      <p className="max-w-md text-center text-sm text-muted">{t("error.hint")}</p>
      <button type="button" className="slice-btn-primary" onClick={() => reset()}>
        {t("error.retry")}
      </button>
    </div>
  );
}
