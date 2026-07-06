import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const benefits = [
  { icon: Sparkles, label: "AI-tailored bullets in seconds" },
  { icon: ShieldCheck, label: "ATS-safe templates by default" },
  { icon: Zap, label: "Bring your own API keys" },
];

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex min-h-screen flex-col px-6 py-8 lg:min-h-0 lg:px-12 lg:py-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm text-muted-foreground transition hover:text-foreground">
            ← Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-sm py-10">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
            )}
          </div>
        </div>
      </div>

      {/* Pitch side */}
      <div className="relative hidden overflow-hidden bg-foreground lg:block">
        <div className="relative flex h-full flex-col justify-between p-12 text-background">
          <div />
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              ResumeNova
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
              The fastest path from
              <br /> "applied" to "interviewing."
            </h2>
            <ul className="mt-8 space-y-3">
              {benefits.map((b) => (
                <li key={b.label} className="flex items-center gap-3 text-sm text-background/80">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-background/10">
                    <b.icon className="h-4 w-4" />
                  </span>
                  {b.label}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-background/50">
            "Got 3 interviews the week I switched to ResumeNova." — Priya S., Senior PM
          </p>
        </div>
      </div>
    </div>
  );
}
