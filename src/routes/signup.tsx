import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signupSearchSchema = z.object({
  redirect: z.string().optional(),
  email: z.email().optional(),
})

export const Route = createFileRoute('/signup')({
  validateSearch: signupSearchSchema,
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { redirect, email: invitedEmail } = Route.useSearch()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(invitedEmail ?? '')
  const [password, setPassword] = useState('')

  const signupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signUp.email({ name, email, password })
      if (error) throw new Error(error.message ?? 'Unable to create account')
      return data
    },
    onSuccess: () => {
      navigate({ to: redirect ?? '/' })
    },
  })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">imperiobeds</h1>
      <form
        className="flex w-full max-w-sm flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          signupMutation.mutate()
        }}
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {signupMutation.isError && (
          <p className="text-sm text-destructive">{signupMutation.error.message}</p>
        )}
        <Button type="submit" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" search={{ redirect }} className="underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}
