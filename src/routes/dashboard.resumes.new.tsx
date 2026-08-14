import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/resumes/new")({
  component: ResumesNewLayout,
});

function ResumesNewLayout() {
  return <Outlet />;
}
