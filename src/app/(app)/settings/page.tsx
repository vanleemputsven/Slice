import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = {
  title: "Settings",
  description:
    "Account preferences including the display currency used on your dashboard.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
