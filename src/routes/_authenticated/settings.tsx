import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { AppTopbar } from "@/components/app-topbar";
import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — ImperioBed" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppTopbar title="Settings" />
      <ComingSoon
        icon={Settings}
        title="Settings"
        description="Hotel and account settings aren't built yet."
      />
    </div>
  );
}
