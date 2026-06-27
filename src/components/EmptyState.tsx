import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; element?: ReactNode };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action &&
        (action.element ?? (
          <Button onClick={action.onClick} className="mt-5">
            {action.label}
          </Button>
        ))}
    </div>
  );
}
