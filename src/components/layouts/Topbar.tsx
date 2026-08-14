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
import { AuthService } from "@/services/endpoints";
import { useTheme } from "@/hooks/use-theme";
import { useQueryClient } from "@tanstack/react-query";
import type { Notification as AppNotification } from "@/types";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
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

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resumes, jobs, questions…"
          className="h-9 pl-9"
          aria-label="Search"
        />
      </div>

      <div className="flex-1 md:hidden" />

      <div className="flex items-center gap-1.5">
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
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unread > 0 && <Badge variant="secondary">{unread} new</Badge>}
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
                      className="flex flex-col items-start gap-0.5 py-2.5"
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
                No new notifications.
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
              <span>Light</span>
              {theme === "light" && (
                <span className="ml-auto text-xs text-primary font-bold">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
              {theme === "dark" && (
                <span className="ml-auto text-xs text-primary font-bold">✓</span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="flex items-center gap-2"
            >
              <Laptop className="h-4 w-4" />
              <span>System</span>
              {theme === "system" && (
                <span className="ml-auto text-xs text-primary font-bold">✓</span>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-medium">
              🌐 English / বাংলা
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => {
                localStorage.setItem("resumenova_lang", "en");
                window.dispatchEvent(new Event("languagechange"));
              }}
            >
              🇺🇸 English (EN)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                localStorage.setItem("resumenova_lang", "bn");
                window.dispatchEvent(new Event("languagechange"));
              }}
            >
              🇧🇩 বাংলা (BN)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
              <Link to="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
