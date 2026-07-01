import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { acceptInvite, getInvitePreview } from "@/lib/api/hotels";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const acceptInviteSearchSchema = z.object({
  token: z.string(),
});

export const Route = createFileRoute("/accept-invite")({
  validateSearch: acceptInviteSearchSchema,
  head: () => ({ meta: [{ title: "Accept invite — ImperioBed" }] }),
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const { data: session } = authClient.useSession();

  const previewQuery = useQuery({
    queryKey: ["invite-preview", token],
    queryFn: () => getInvitePreview(token),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptInvite(token),
    onSuccess: () => navigate({ to: "/" }),
  });

  if (previewQuery.isLoading) {
    return <CenteredCard>Loading invite…</CenteredCard>;
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <CenteredCard>This invite link is invalid or has expired.</CenteredCard>
    );
  }

  const invite = previewQuery.data;
  const redirect = `/accept-invite?token=${token}`;

  return (
    <CenteredCard>
      <p>
        You've been invited to join <strong>{invite.hotelName}</strong> as{" "}
        <strong>{invite.role}</strong>.
      </p>
      {session ? (
        <Button
          disabled={acceptMutation.isPending}
          onClick={() => acceptMutation.mutate()}
        >
          {acceptMutation.isPending ? "Accepting…" : "Accept invite"}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/login" search={{ redirect }}>
              Sign in to accept
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/signup" search={{ redirect, email: invite.email }}>
              Create an account
            </Link>
          </Button>
        </div>
      )}
      {acceptMutation.isError && (
        <p className="text-sm text-destructive">
          {acceptMutation.error.message}
        </p>
      )}
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>ImperioBed</CardTitle>
          <CardDescription>Hotel invite</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </div>
  );
}
