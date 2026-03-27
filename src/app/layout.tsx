import type { Metadata } from "next";
import { Figtree, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { SubscriptionsProvider } from "@/components/providers/subscriptions-provider";

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
    default: "Slice — Subscription clarity",
    template: "%s · Slice",
  },
  description:
    "Track recurring spend, shared splits, and the work time your subscriptions consume.",
  applicationName: "Slice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${sliceDisplay.variable} ${sliceSans.variable} ${sliceMono.variable} min-h-full font-sans text-fg antialiased`}
      >
        <SubscriptionsProvider>{children}</SubscriptionsProvider>
      </body>
    </html>
  );
}
