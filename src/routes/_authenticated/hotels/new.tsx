import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormPage,
  FormPageBackLink,
  FormPageError,
  FormSection,
} from "@/components/form-page";
import { CURRENCY_OPTIONS } from "@/components/onboarding/constants";
import { useCreateHotel } from "@/hooks/use-hotels";
import { useCurrentHotelStore } from "@/stores/current-hotel";
import { TIMEZONES, type Currency, type Timezone } from "@/lib/schemas/hotel";

export const Route = createFileRoute("/_authenticated/hotels/new")({
  head: () => ({ meta: [{ title: "Create Hotel — ImperioBed" }] }),
  component: NewHotelPage,
});

function NewHotelPage() {
  const navigate = useNavigate();
  const setActiveHotelId = useCurrentHotelStore(
    (state) => state.setActiveHotelId,
  );
  const createHotel = useCreateHotel();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [timezone, setTimezone] = useState<Timezone>("Africa/Lagos");

  function goBack() {
    void navigate({ to: "/hotels" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createHotel.mutate(
      { name: name.trim(), currency, timezone },
      {
        onSuccess: (hotel) => {
          // Switch the app over to the hotel that was just created, so the
          // next thing the owner does lands in the right tenant.
          setActiveHotelId(hotel.id);
          void navigate({ to: "/hotels" });
        },
      },
    );
  }

  return (
    <FormPage
      title="Create Hotel"
      description="Each hotel keeps its own rooms, guests, staff and books, fully separate from the others on your account."
      backLink={<FormPageBackLink to="/hotels">Hotels</FormPageBackLink>}
      onSubmit={handleSubmit}
      actions={
        <>
          <Button variant="outline" type="button" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={createHotel.isPending || !name.trim()}>
            {createHotel.isPending ? "Creating…" : "Create Hotel"}
          </Button>
        </>
      }
    >
      <FormSection
        title="Hotel Details"
        description="The basics needed to open the property — everything else lives in Settings."
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="hotel-name">Hotel Name</FieldLabel>
            <Input
              id="hotel-name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Imperio Suites, Enugu"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="hotel-currency">Currency</FieldLabel>
              <Select
                value={currency}
                onValueChange={(value) => setCurrency(value as Currency)}
              >
                <SelectTrigger id="hotel-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CURRENCY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.symbol} {option.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                Used for every rate, payment and report at this hotel.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="hotel-timezone">Timezone</FieldLabel>
              <Select
                value={timezone}
                onValueChange={(value) => setTimezone(value as Timezone)}
              >
                <SelectTrigger id="hotel-timezone" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TIMEZONES.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldDescription>
                Decides where the day boundary falls in daily reports.
              </FieldDescription>
            </Field>
          </div>
        </FieldGroup>
      </FormSection>

      <Alert variant="info">
        <Info />
        <AlertDescription>
          Address, star rating, check-out time and payment methods can be filled
          in from Settings once the hotel exists.
        </AlertDescription>
      </Alert>

      <FormPageError error={createHotel.error?.message} />
    </FormPage>
  );
}
