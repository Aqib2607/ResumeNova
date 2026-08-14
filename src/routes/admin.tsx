import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  FileText,
  Layers,
  ScrollText,
  Settings as SettingsIcon,
  Shield,
  Terminal,
  Users,
} from "lucide-react";
import { Topbar } from "@/components/layouts/Topbar";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { getAuthToken, isAdmin } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    if (!isAdmin()) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: AdminLayout,
});

const items = [
  { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
  { to: "/admin/templates", label: "Templates", icon: Layers },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/system-logs", label: "System Logs", icon: Terminal },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition lg:hidden",
            open ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
            <Link to="/admin" className="flex items-center gap-2">
              <Logo showWordmark={false} />
              <span className="text-sm font-semibold">Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Admin
            </p>
            <ul className="space-y-0.5">
              {items.map((i) => {
                const active = i.exact ? pathname === i.to : pathname.startsWith(i.to);
                return (
                  <li key={i.to}>
                    <Link
                      to={i.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-sidebar-accent hover:text-foreground",
                      )}
                    >
                      <i.icon className="h-4 w-4" /> {i.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 border-t border-sidebar-border pt-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-foreground/70 hover:bg-sidebar-accent hover:text-foreground"
              >
                <FileText className="h-4 w-4" /> Back to app
              </Link>
            </div>
          </nav>
          <div className="border-t border-sidebar-border p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Admin console v1.0
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setOpen(true)} />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
