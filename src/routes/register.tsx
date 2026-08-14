import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useForm, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthService } from "@/services/endpoints";
import { ApiError } from "@/services/api-client";
import { isAuthenticated, setAuthToken, setStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    if (isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterPage,
});

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  });

type FormValues = z.infer<typeof schema>;

// Password strength rules
const pwdRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function PasswordStrengthMeter({ control }: { control: Control<FormValues> }) {
  const password = useWatch({ control, name: "password" }) ?? "";
  const passed = useMemo(() => pwdRules.filter((r) => r.test(password)).length, [password]);

  if (!password) return null;

  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][Math.min(passed - 1, 3)] ?? "Weak";
  const strengthColor = ["bg-destructive", "bg-warning", "bg-yellow-400", "bg-success"][
    Math.min(passed - 1, 3)
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? strengthColor : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength:{" "}
        <span
          className={`font-medium ${
            passed <= 1
              ? "text-destructive"
              : passed === 2
                ? "text-warning"
                : passed === 3
                  ? "text-yellow-500"
                  : "text-success"
          }`}
        >
          {strengthLabel}
        </span>
      </p>
      {/* Checklist */}
      <ul className="space-y-1">
        {pwdRules.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              {ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-border" />
              )}
              <span className={ok ? "text-success" : "text-muted-foreground"}>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const termsValue = watch("terms");

  const onSubmit = async (values: FormValues) => {
    try {
      const session = await AuthService.register({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirm,
      });
      // FIX P2: Guard against a missing token — don't silently redirect unauthenticated.
      if (!session?.token) {
        toast.error("Registration succeeded but no auth token was returned. Contact support.");
        return;
      }
      setAuthToken(session.token);
      if (session.user) {
        setStoredUser(session.user);
      }
      toast.success("Account created! Welcome to ResumeNova.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { url } = await AuthService.googleAuthUrl();
      window.location.href = url;
    } catch {
      toast.error("Could not initiate Google sign-up. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever for your first 5 resumes. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SEO
        title="Create account"
        description="Sign up for ResumeNova to start building AI-powered resumes."
      />

      {/* Google OAuth */}
      <Button variant="outline" className="w-full gap-2" type="button" onClick={handleGoogleSignUp}>
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Aarav Mehta"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
          <PasswordStrengthMeter control={control} />
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={!!errors.confirm}
              {...register("confirm")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm && (
            <p className="text-xs text-destructive" role="alert">
              {errors.confirm.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="terms"
            checked={termsValue === true}
            onCheckedChange={(checked) => {
              setValue("terms", checked === true ? true : (false as unknown as true), {
                shouldValidate: true,
              });
            }}
            aria-invalid={!!errors.terms}
          />
          <Label
            htmlFor="terms"
            className="text-xs font-normal leading-relaxed text-muted-foreground"
          >
            I agree to the{" "}
            <a href="/terms" className="font-medium text-foreground hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="font-medium text-foreground hover:underline">
              Privacy Policy
            </a>
            .
          </Label>
        </div>
        {errors.terms && (
          <p className="text-xs text-destructive" role="alert">
            {errors.terms.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.64-2.55C16.93 3.3 14.7 2.4 12 2.4 6.86 2.4 2.7 6.56 2.7 11.7s4.16 9.3 9.3 9.3c5.36 0 8.92-3.77 8.92-9.08 0-.61-.07-1.08-.15-1.55H12z"
      />
    </svg>
  );
}
