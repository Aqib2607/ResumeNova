import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  ScanSearch,
  Mail,
  Mic,
  KeyRound,
  Download,
  User,
  Settings,
  Shield,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuthMe } from "@/hooks/useDashboard";
import { useLanguage, type TranslationKey } from "@/hooks/use-language";

interface NavItem {
  to: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  group?: "main" | "account" | "admin";
}

const items: NavItem[] = [
  { to: "/dashboard", labelKey: "nav_dashboard", icon: LayoutDashboard, group: "main" },
  { to: "/dashboard/resumes", labelKey: "nav_resumes", icon: FileText, group: "main" },
  { to: "/dashboard/ats", labelKey: "nav_ats", icon: ScanSearch, group: "main" },
  { to: "/dashboard/cover-letters", labelKey: "nav_cover_letters", icon: Mail, group: "main" },
  { to: "/dashboard/interview", labelKey: "nav_interview", icon: Mic, group: "main" },
  { to: "/dashboard/api-keys", labelKey: "nav_api_keys", icon: KeyRound, group: "main" },
  { to: "/dashboard/exports", labelKey: "nav_exports", icon: Download, group: "main" },
  { to: "/dashboard/profile", labelKey: "nav_profile", icon: User, group: "account" },
  { to: "/dashboard/settings", labelKey: "nav_settings", icon: Settings, group: "account" },
  { to: "/admin", labelKey: "nav_admin", icon: Shield, group: "admin" },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: user } = useAuthMe();
  const { t } = useLanguage();

  const isActive = (to: string) => {
    if (to === "/dashboard") return pathname === "/dashboard";
    return pathname === to || pathname.startsWith(to + "/");
  };

  const renderGroup = (group: NavItem["group"], groupKey: TranslationKey) => (
    <div className="px-3">
      <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        {t(groupKey)}
      </p>
      <ul className="space-y-0.5">
        {items
          .filter((i) => i.group === group)
          .map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span className="truncate">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Logo to="/dashboard" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {renderGroup("main", "group_workspace")}
          <div className="my-3 border-t border-sidebar-border" />
          {renderGroup("account", "group_account")}
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <>
              <div className="my-3 border-t border-sidebar-border" />
              {renderGroup("admin", "group_system")}
            </>
          )}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-xs font-semibold text-foreground">{t("plan_free")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("plan_usage")}</p>
            <Button size="sm" className="mt-2 w-full">
              {t("btn_upgrade")}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
