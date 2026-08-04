import { forwardRef, type ReactNode } from 'react'
import { createLink, type LinkComponent } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'

// Shared shell for the "create/edit one entity" pages that replaced the old
// form dialogs. A page gives these flows what a modal couldn't: a real URL to
// deep-link and refresh, browser back/forward, room for grouped sections and a
// live summary column, and no popover-inside-a-modal focus traps.

type BackLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

const BackLinkAnchor = forwardRef<HTMLAnchorElement, BackLinkProps>(
  ({ className, children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        'inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
        className,
      )}
      {...props}
    >
      <ArrowLeft className="size-4" />
      {children}
    </a>
  ),
)
BackLinkAnchor.displayName = 'BackLinkAnchor'

// createLink keeps the typed `to`/`params`/`search` props of the router's own
// Link, which a plain props-spread wrapper would erase.
const CreatedBackLink = createLink(BackLinkAnchor)

export const FormPageBackLink: LinkComponent<typeof BackLinkAnchor> = (props) => (
  <CreatedBackLink {...props} />
)

// `aside` renders a sticky companion column on wide screens (e.g. the booking
// summary next to the reservation form) and drops below the form on narrow
// ones. Omit it for a single centered column.
export function FormPage({
  title,
  description,
  backLink,
  aside,
  actions,
  onSubmit,
  children,
}: {
  title: string
  description?: string
  backLink: ReactNode
  aside?: ReactNode
  actions: ReactNode
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: ReactNode
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'mx-auto flex w-full flex-col gap-5 p-4 lg:p-6',
        aside ? 'max-w-5xl' : 'max-w-2xl',
      )}
    >
      <div className="flex flex-col gap-2">
        {backLink}
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>

      <div className={cn('grid items-start gap-5', aside && 'lg:grid-cols-[1fr_20rem]')}>
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
        {aside && <div className="lg:sticky lg:top-6">{aside}</div>}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-1 flex justify-end gap-2 border-t bg-background/85 px-4 py-3 backdrop-blur lg:-mx-6 lg:px-6">
        {actions}
      </div>
    </form>
  )
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// An edit page is addressable, so its id can be stale (deleted record, wrong
// hotel, hand-typed URL) in a way a dialog opened from a row never could be.
export function FormPageNotFound({
  title,
  description,
  backLink,
}: {
  title: string
  description: string
  backLink: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 lg:p-6">
      {backLink}
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export function FormPageError({ error }: { error?: string | null }) {
  if (!error) return null
  return (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  )
}
