import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  ArrowRight,
  Building2,
  FileText,
  Lock,
  LayoutDashboard,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

const features = [
  {
    icon: LayoutDashboard,
    title: "Owner-first visibility",
    description:
      "See occupancy, revenue, attendance, and inventory risk without waiting for updates.",
  },
  {
    icon: ShieldCheck,
    title: "Controlled staff access",
    description:
      "Managers, front desk, storekeepers, and accountants only see what matches their role.",
  },
  {
    icon: FileText,
    title: "Reports over guesswork",
    description:
      "Daily operational reports keep each hotel accountable and easier to run.",
  },
];

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  head: () => ({ meta: [{ title: "Sign in — ImperioBed" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });
      if (error) throw new Error(error.message ?? "Unable to sign in");
      return data;
    },
    onSuccess: () => {
      navigate({ to: redirect ?? "/" });
    },
  });

  return (
    <div className="grid min-h-svh lg:grid-cols-[35%_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-24 top-16 size-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-40 size-56 rounded-full border border-white/10" />

        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <Building2 className="size-5" />
          </div>
          <span className="text-lg font-bold">ImperioBed</span>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold leading-tight">
              Pick up today&apos;s hotel operations in one place.
            </h1>
            <p className="max-w-sm text-primary-foreground/75">
              Sign in to review rooms, guests, staff activity, and daily reports
              across your hotel business.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold">{title}</span>
                  <span className="text-sm text-primary-foreground/70">
                    {description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">
          © 2025 ImperioBed. All rights reserved.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Welcome back
            </span>
            <h2 className="text-2xl font-bold">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground">
              Access your hotels, staff records, and daily operations from where
              you left off.
            </p>
          </div>

          <Card>
            <CardContent>
              <form
                className="flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  loginMutation.mutate();
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Mail />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </InputGroup>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <span className="cursor-pointer text-sm font-medium text-primary underline">
                      Forgot password?
                    </span>
                  </div>
                  <InputGroup>
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </InputGroup>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  Keep me signed in on this device
                </label>

                {loginMutation.isError && (
                  <p className="text-sm text-destructive">
                    {loginMutation.error.message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  {loginMutation.isPending ? (
                    "Signing in…"
                  ) : (
                    <>
                      Sign in
                      <ArrowRight />
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Having trouble signing in? Contact your hotel owner or manager
                  to confirm your account access.
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New to ImperioBed?{" "}
            <Link
              to="/signup"
              search={{ redirect }}
              className="font-semibold text-foreground underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
