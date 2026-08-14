import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/resumes")({
  component: ResumesLayout,
});

function ResumesLayout() {
  return <Outlet />;
}
