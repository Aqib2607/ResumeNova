import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SEO } from "@/components/SEO";

const searchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/oauth/callback")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: OAuthCallbackPage,
});

function OAuthCallbackPage() {
  const { token, error } = useSearch({ from: "/oauth/callback" });
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error("Google authentication failed. Please try again.");
      navigate({ to: "/login" });
      return;
    }

    if (token) {
      localStorage.setItem("auth_token", token);
      toast.success("Successfully signed in with Google!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("No authentication token received.");
      navigate({ to: "/login" });
    }
  }, [token, error, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SEO title="Authenticating..." />
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Completing sign-in, please wait...</p>
      </div>
    </div>
  );
}
