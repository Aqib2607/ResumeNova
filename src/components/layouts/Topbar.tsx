import { Bell, Menu, Search, Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthMe, useNotifications } from "@/hooks/useDashboard";
import { AuthService, NotificationsService } from "@/services/endpoints";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { useQueryClient } from "@tanstack/react-query";
import type { Notification as AppNotification } from "@/types";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { data: user } = useAuthMe();
  const { data: notifications } = useNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const unread =
    notifications?.filter((n: AppNotification & { read_at?: string | null }) => !n.read_at)
      .length || 0;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p: string) => p[0])
        .join("")
        .slice(0, 2)
    : "US";

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      queryClient.clear();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout failed", error);
      navigate({ to: "/login" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationsService.markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handleMarkRead = async (id: string | number) => {
    try {
      await NotificationsService.markRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden w-64 md:block lg:w-80 xl:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search_placeholder")}
            className="h-9 pl-9 text-sm"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between py-2">
              <span className="text-sm font-semibold">{t("notifications_title")}</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <Badge variant="secondary">
                    {unread} {t("notifications_new")}
                  </Badge>
                )}
                {unread > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    {t("notifications_mark_all_read")}
                  </button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications && notifications.length > 0 ? (
              notifications.map(
                (
                  n: AppNotification & {
                    data?: Record<string, unknown> | string;
                    read_at?: string | null;
                  },
                ) => {
                  const data = (typeof n.data === "string" ? JSON.parse(n.data) : n.data) as
                    Record<string, string> | undefined;
                  return (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className="flex cursor-pointer flex-col items-start gap-0.5 py-2.5"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-medium">{data?.title || "Notification"}</span>
                        {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{data?.body}</span>
                    </DropdownMenuItem>
                  );
                },
              )
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {t("notifications_empty")}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4 text-foreground" />
              ) : (
                <Sun className="h-4 w-4 text-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>{t("theme_light")}</span>
              {theme === "light" && (
                <span className="ml-auto text-xs font-bold text-primary">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>{t("theme_dark")}</span>
              {theme === "dark" && (
                <span className="ml-auto text-xs font-bold text-primary">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="flex items-center gap-2"
            >
              <Laptop className="h-4 w-4" />
              <span>{t("theme_system")}</span>
              {theme === "system" && (
                <span className="ml-auto text-xs font-bold text-primary">✓</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5 text-xs font-medium">
              <span className="rounded bg-muted px-1 py-0.5 text-[10px] font-bold text-primary">
                {language === "bn" ? "বাং" : "EN"}
              </span>
              <span className="hidden md:inline">{language === "bn" ? "বাংলা" : "English"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setLanguage("en")}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">EN</span>
                <span>English</span>
              </div>
              {language === "en" && <span className="text-xs font-bold text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage("bn")}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">বাং</span>
                <span>বাংলা</span>
              </div>
              {language === "bn" && <span className="text-xs font-bold text-primary">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Account Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-md p-1 pr-2 transition hover:bg-accent"
              aria-label="Account menu"
            >
              <Avatar className="h-7 w-7">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">
                {user?.name?.split(" ")[0] || "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || "User"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email || ""}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">{t("nav_profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">{t("nav_settings")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>{t("log_out")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
