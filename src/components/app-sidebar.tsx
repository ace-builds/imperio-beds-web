import { Link, useRouterState } from "@tanstack/react-router";
import { Building } from "lucide-react";
import { HotelSwitcher } from "@/components/hotel-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useActiveHotelRole } from "@/hooks/use-active-hotel-role";
import { canAccess, NAV_ITEMS, type NavSection } from "@/lib/roles";

const SECTION_LABELS: Record<NavSection, string> = {
  main: "Main",
  operations: "Operations",
  admin: "Admin",
};

const SECTIONS: NavSection[] = ["main", "operations", "admin"];

export function AppSidebar() {
  const { role } = useActiveHotelRole();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  console.log(role, pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-1 font-heading text-sm font-semibold"
        >
          <Building className="size-5 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">
            imperiobeds
          </span>
        </Link>
        <div className="group-data-[collapsible=icon]:hidden">
          <HotelSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {SECTIONS.map((section) => {
          const items = NAV_ITEMS.filter(
            (item) => item.section === section && canAccess(role, item.roles),
          );
          if (items.length === 0) return null;

          return (
            <SidebarGroup key={section}>
              <SidebarGroupLabel>{SECTION_LABELS[section]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.to}
                        tooltip={item.label}
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
