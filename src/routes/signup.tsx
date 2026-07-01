import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  ArrowRight,
  Building2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const signupSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.email().optional(),
});

const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Rwanda",
  "Uganda",
  "Tanzania",
] as const;

const features = [
  {
    icon: Building2,
    title: "Multi-hotel, one login",
    description: "Manage up to 10 hotels without switching accounts.",
  },
  {
    icon: ShieldCheck,
    title: "Full accountability trail",
    description: "Every action is logged with staff name and timestamp.",
  },
  {
    icon: BarChart3,
    title: "Daily operations reports",
    description: "Know your revenue, occupancy, and staff status every day.",
  },
];

export const Route = createFileRoute("/signup")({
  validateSearch: signupSearchSchema,
  head: () => ({ meta: [{ title: "Create account — ImperioBed" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { redirect, email: invitedEmail } = Route.useSearch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(invitedEmail ?? "");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>("Nigeria");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      const { data, error } = await authClient.signUp.email({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });
      if (error) throw new Error(error.message ?? "Unable to create account");
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
          <span className="text-lg font-bold">imperiobeds</span>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold leading-tight">
              Run your hotels.
              <br />
              Not your spreadsheets.
            </h1>
            <p className="max-w-sm text-primary-foreground/75">
              One system for rooms, staff, inventory, and payroll — built for
              African hotel owners.
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
          © 2025 imperiobeds. All rights reserved.
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold">Create your account</h2>
            <p className="text-sm text-muted-foreground">
              Start with your basic details. You&apos;ll add your hotel
              information in the next step.
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              signupMutation.mutate();
            }}
          >
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Your details
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Phone />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </InputGroup>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger id="country" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t pt-5">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Security
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </InputGroup>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                    />
                  </InputGroup>
                </div>
              </div>
            </div>

            {signupMutation.isError && (
              <p className="text-sm text-destructive">
                {signupMutation.error.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full"
            >
              {signupMutation.isPending ? (
                "Creating account…"
              ) : (
                <>
                  Create Account &amp; Continue
                  <ArrowRight />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              By signing up, you agree to our{" "}
              <span className="font-medium text-foreground underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="font-medium text-foreground underline">
                Privacy Policy
              </span>
              .
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                search={{ redirect }}
                className="font-semibold text-foreground underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
