import type { Metadata, Viewport } from "next";
import { Figtree, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { SubscriptionsProvider } from "@/components/providers/subscriptions-provider";
import { loadAuthenticatedSlice } from "@/lib/supabase/load-authenticated-slice";

const sliceDisplay = Syne({
  variable: "--font-slice-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const sliceSans = Figtree({
  variable: "--font-slice-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sliceMono = JetBrains_Mono({
  variable: "--font-slice-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Slice · Subscription clarity",
    template: "%s · Slice",
  },
  description:
    "Track recurring spend, shared splits, and the work time your subscriptions consume.",
  applicationName: "Slice",
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Slice",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0c0f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSlice = await loadAuthenticatedSlice();
  const htmlLang = initialSlice?.preferences.locale === "nl" ? "nl" : "en";

  return (
    <html lang={htmlLang} className="h-full">
      <body
        className={`${sliceDisplay.variable} ${sliceSans.variable} ${sliceMono.variable} min-h-full font-sans text-fg antialiased`}
      >
        <SubscriptionsProvider initialAuthenticatedSlice={initialSlice}>
          {children}
        </SubscriptionsProvider>
      </body>
    </html>
  );
}
