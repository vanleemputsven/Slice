import { HomeLanding } from "@/components/marketing/home-landing";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  let isSignedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = Boolean(user);
  } catch {
    /* Supabase env unset: marketing page still renders; protected routes handle config. */
  }

  return <HomeLanding isSignedIn={isSignedIn} />;
}
