import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { HotelSetupStep } from "@/components/onboarding/hotel-setup-step";
import { InviteStaffStep } from "@/components/onboarding/invite-staff-step";
import { LiveStep } from "@/components/onboarding/live-step";
import {
  OnboardingRail,
  type OnboardingStepInfo,
} from "@/components/onboarding/onboarding-rail";
import { useMyHotelAccess } from "@/hooks/use-hotel-access";
import { authClient } from "@/lib/auth-client";
import type { Hotel } from "@/lib/schemas/hotel";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Setup — ImperioBed" }] }),
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session };
  },
  component: OnboardingPage,
});

const RAIL_STEPS: OnboardingStepInfo[] = [
  {
    key: "account",
    title: "Account created",
    description: "Your login and profile are set.",
  },
  {
    key: "hotel",
    title: "Hotel configured",
    description: "Room types, capacity, and currency.",
  },
  {
    key: "invite",
    title: "Invite your staff",
    description: "Add managers, front desk, and more.",
  },
  {
    key: "live",
    title: "You're live",
    description: "Start managing rooms and operations.",
  },
];

const RAIL_COPY: Record<
  "hotel" | "invite" | "live",
  { headline: string; description: string }
> = {
  hotel: {
    headline: "You're almost ready to go live.",
    description:
      "Complete these steps to fully set up your hotel operations. You can always come back and update later.",
  },
  invite: {
    headline: "Build your team structure.",
    description:
      "Add the people who will run your hotel day-to-day. Each role has limited, controlled access to match their responsibility.",
  },
  live: {
    headline: "You're all set!",
    description: "Your hotel is live and ready for daily operations.",
  },
};

function OnboardingPage() {
  const navigate = useNavigate();
  const { data: hotelAccess, isLoading } = useMyHotelAccess();
  const [step, setStep] = useState<"hotel" | "invite" | "live">("hotel");
  const [hotel, setHotel] = useState<Hotel | null>(null);

  // Already has a hotel from a previous visit (revisited this URL directly)
  // — nothing to onboard. Once `hotel` is set in this session, the access
  // query resolving non-empty is expected, not a reason to bounce out.
  useEffect(() => {
    if (!isLoading && hotelAccess && hotelAccess.length > 0 && !hotel) {
      navigate({ to: "/" });
    }
  }, [isLoading, hotelAccess, hotel, navigate]);

  return (
    <div className="flex h-svh overflow-hidden">
      <OnboardingRail
        steps={RAIL_STEPS}
        activeKey={step}
        {...RAIL_COPY[step]}
      />
      <div className="flex flex-1 justify-center overflow-y-auto px-6 py-10 lg:px-12 lg:py-16">
        <div className="w-full max-w-2xl">
          {step === "hotel" && (
            <HotelSetupStep
              hotel={hotel ?? undefined}
              onCreated={(savedHotel) => {
                setHotel(savedHotel);
                setStep("invite");
              }}
            />
          )}
          {step === "invite" && hotel && (
            <InviteStaffStep
              hotel={hotel}
              onBack={() => setStep("hotel")}
              onDone={() => setStep("live")}
            />
          )}
          {step === "live" && hotel && <LiveStep hotel={hotel} />}
        </div>
      </div>
    </div>
  );
}
