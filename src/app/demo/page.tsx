import { DemoMarketingPage } from "@/components/marketing/demo-marketing-page";
import { createClient } from "@/lib/supabase/server";

export default async function DemoPage() {
  let isSignedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = Boolean(user);
  } catch {
    /* Supabase env unset: page still renders. */
  }

  return <DemoMarketingPage isSignedIn={isSignedIn} />;
}
