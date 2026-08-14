import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { Topbar } from "@/components/layouts/Topbar";
import { getAuthToken } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
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
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-surface">
      <div className="flex">
        <AppSidebar open={open} onClose={() => setOpen(false)} />
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
