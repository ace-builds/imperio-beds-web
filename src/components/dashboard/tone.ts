export type Tone = 'success' | 'warning' | 'destructive' | 'info' | 'muted'

export const TONE_DOT_CLASS: Record<Tone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-primary',
  muted: 'bg-muted-foreground',
}

export const TONE_ICON_CLASS: Record<Tone, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
}

export const TONE_TEXT_CLASS: Record<Tone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  info: 'text-primary',
  muted: 'text-muted-foreground',
}

export const TONE_BADGE_VARIANT: Record<Tone, 'success' | 'warning' | 'destructive' | 'info' | 'secondary'> = {
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
  info: 'info',
  muted: 'secondary',
}
