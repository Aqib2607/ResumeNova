import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Pencil, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/resumes/new")({
  component: BuilderSelectionPage,
});

const modes = [
  {
    icon: Pencil,
    title: "Manual builder",
    desc: "Type or paste your content into a live, split-pane editor with instant preview.",
    cta: "Start building",
    to: "/dashboard/resumes/new/manual",
    badge: "Most control",
  },
  {
    icon: Bot,
    title: "AI interview builder",
    desc: "Answer 12 conversational prompts. We turn your story into a polished resume.",
    cta: "Begin interview",
    to: "/dashboard/resumes/new/manual",
    badge: "Fastest",
  },
];

function BuilderSelectionPage() {
  return (
    <div>
      <SEO title="New resume" />
      <PageHeader
        title="Start a new resume"
        description="Pick the workflow that fits how you like to write."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {modes.map((m) => (
          <Link
            key={m.title}
            to={m.to}
            className="group relative flex flex-col rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
          >
            <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {m.badge}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <m.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{m.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{m.desc}</p>
            <Button variant="ghost" className="mt-5 self-start text-primary hover:bg-primary/10">
              {m.cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
