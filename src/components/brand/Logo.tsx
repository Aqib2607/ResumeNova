import { FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2 group", className)}
      aria-label="ResumeNova home"
    >
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-elegant">
        <FileText className="h-4 w-4" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background" />
      </span>
      {showWordmark && (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Resume<span className="text-primary">Nova</span>
        </span>
      )}
    </Link>
  );
}
