import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CURRENCY_OPTIONS } from '@/components/onboarding/constants'
import { useUpdateHotel } from '@/hooks/use-hotels'
import type { Currency, Hotel, Timezone } from '@/lib/schemas/hotel'

const TIMEZONE_OPTIONS: { value: Timezone; label: string }[] = [
  { value: 'Africa/Lagos', label: 'West Africa Time — Lagos (GMT+1)' },
  { value: 'Africa/Accra', label: 'Greenwich Mean Time — Accra (GMT+0)' },
  { value: 'Africa/Nairobi', label: 'East Africa Time — Nairobi (GMT+3)' },
  { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
]

export function GeneralTab({ hotel, canManage }: { hotel: Hotel; canManage: boolean }) {
  const [name, setName] = useState(hotel.name)
  const [address, setAddress] = useState(hotel.address ?? '')
  const [phone, setPhone] = useState(hotel.phone ?? '')
  const [email, setEmail] = useState(hotel.email ?? '')
  const [website, setWebsite] = useState(hotel.website ?? '')
  const [currency, setCurrency] = useState<Currency | ''>(hotel.currency ?? '')
  const [timezone, setTimezone] = useState<Timezone | ''>(hotel.timezone ?? '')

  const updateHotel = useUpdateHotel(hotel.id)

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        updateHotel.mutate({
          name,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          currency: currency || undefined,
          timezone: timezone || undefined,
        })
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Hotel Profile</CardTitle>
          <CardDescription>Basic information about your property used in receipts and reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="hotel-name">Hotel Name</FieldLabel>
              <Input
                id="hotel-name"
                required
                disabled={!canManage}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="hotel-address">Address</FieldLabel>
              <Input
                id="hotel-address"
                disabled={!canManage}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="hotel-phone">Phone Number</FieldLabel>
                <Input
                  id="hotel-phone"
                  type="tel"
                  disabled={!canManage}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="hotel-email">Email Address</FieldLabel>
                <Input
                  id="hotel-email"
                  type="email"
                  disabled={!canManage}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="hotel-website">
                Website <span className="font-normal text-muted-foreground">(Optional)</span>
              </FieldLabel>
              <Input
                id="hotel-website"
                disabled={!canManage}
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="www.example.com"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Preferences</CardTitle>
          <CardDescription>Configure global settings for your daily operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="hotel-currency">Default Currency</FieldLabel>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as Currency)}
                disabled={!canManage}
              >
                <SelectTrigger id="hotel-currency" className="w-full">
                  <SelectValue placeholder="Select a currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value} · {option.symbol}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="hotel-timezone">Timezone</FieldLabel>
              <Select
                value={timezone}
                onValueChange={(value) => setTimezone(value as Timezone)}
                disabled={!canManage}
              >
                <SelectTrigger id="hotel-timezone" className="w-full">
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TIMEZONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </CardContent>
      </Card>

      {updateHotel.isError && <p className="text-sm text-destructive">{updateHotel.error.message}</p>}

      {canManage && (
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={updateHotel.isPending}>
            {updateHotel.isPending ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  )
}
