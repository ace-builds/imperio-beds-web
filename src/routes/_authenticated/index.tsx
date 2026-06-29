import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { session } = Route.useRouteContext()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">imperiobeds</h1>
      <p className="text-muted-foreground">Signed in as {session.user.email}</p>
      <Button
        variant="outline"
        onClick={() =>
          authClient.signOut({
            fetchOptions: { onSuccess: () => navigate({ to: '/login' }) },
          })
        }
      >
        Sign out
      </Button>
    </div>
  )
}
