import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createRootRoute({
  head: () => ({
    meta: [{ title: "ImperioBed" }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <TooltipProvider>
      <HeadContent />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </TooltipProvider>
  );
}
