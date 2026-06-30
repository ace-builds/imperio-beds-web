import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
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
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import {
  CHECK_OUT_TIME_OPTIONS,
  CURRENCY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PRESET_ROOM_TYPES,
  STAR_RATING_OPTIONS,
  TOTAL_ROOMS_OPTIONS,
} from "@/components/onboarding/constants";
import { createHotel, updateHotel } from "@/lib/api/hotels";
import { createRoomType } from "@/lib/api/room-types";
import type {
  Currency,
  Hotel,
  PaymentMethod,
  TotalRoomsRange,
} from "@/lib/schemas/hotel";

// `hotel` is only set when the user has navigated back from the invite step
// to edit what they already created — in that case we PATCH the existing
// hotel instead of POSTing a duplicate, and leave room types alone (they
// were already created on the first submit).
export function HotelSetupStep({
  hotel,
  onCreated,
}: {
  hotel?: Hotel;
  onCreated: (hotel: Hotel) => void;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!hotel;

  const [name, setName] = useState(hotel?.name ?? "");
  const [totalRoomsRange, setTotalRoomsRange] = useState<TotalRoomsRange | "">(
    hotel?.totalRoomsRange ?? "",
  );
  const [address, setAddress] = useState(hotel?.address ?? "");
  const [city, setCity] = useState(hotel?.city ?? "");
  const [state, setState] = useState(hotel?.state ?? "");
  const [starRating, setStarRating] = useState(
    hotel?.starRating ? String(hotel.starRating) : "",
  );
  const [checkOutTime, setCheckOutTime] = useState(hotel?.checkOutTime ?? "");
  const [description, setDescription] = useState(hotel?.description ?? "");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [customRoomTypes, setCustomRoomTypes] = useState<string[]>([]);
  const [customDraft, setCustomDraft] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currency, setCurrency] = useState<Currency | "">(
    hotel?.currency ?? "",
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    hotel?.paymentMethods ?? [],
  );

  const setupMutation = useMutation({
    mutationFn: async () => {
      const input = {
        name,
        totalRoomsRange: totalRoomsRange || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        starRating: starRating ? Number(starRating) : undefined,
        checkOutTime: checkOutTime || undefined,
        description: description || undefined,
        currency: currency || undefined,
        paymentMethods: paymentMethods.length ? paymentMethods : undefined,
      };

      if (isEditing) {
        return updateHotel(hotel.id, input);
      }

      const created = await createHotel(input);
      await Promise.all(
        roomTypes.map((roomTypeName) =>
          createRoomType(created.id, { name: roomTypeName }),
        ),
      );
      return created;
    },
    onSuccess: (savedHotel) => {
      void queryClient.invalidateQueries({ queryKey: ["hotel-access"] });
      void queryClient.invalidateQueries({ queryKey: ["hotels"] });
      onCreated(savedHotel);
    },
  });

  function addCustomRoomType() {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    setCustomRoomTypes((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
    setRoomTypes((prev) =>
      prev.includes(trimmed) ? prev : [...prev, trimmed],
    );
    setCustomDraft("");
    setShowCustomInput(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <OnboardingHeader
        stepNumber={2}
        totalSteps={3}
        sectionLabel="Hotel Setup"
        title={
          isEditing ? "Update your hotel details" : "Tell us about your hotel"
        }
        description={
          isEditing
            ? "Make changes and save — your room types stay as you set them."
            : "Set up your first hotel. You can add more hotels anytime from your dashboard."
        }
      />

      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          setupMutation.mutate();
        }}
      >
        <FieldSet>
          <FieldLegend variant="label" className="text-lg font-semibold">
            Hotel Basics
          </FieldLegend>
          <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-x-4">
            <Field>
              <FieldLabel htmlFor="hotel-name">Hotel Name</FieldLabel>
              <Input
                id="hotel-name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Grand Iroko Hotel"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="total-rooms">Total Rooms</FieldLabel>
              <Select
                value={totalRoomsRange}
                onValueChange={(value) =>
                  setTotalRoomsRange(value as TotalRoomsRange)
                }
              >
                <SelectTrigger id="total-rooms" className="w-full">
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {TOTAL_ROOMS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="address">Hotel Address</FieldLabel>
              <Input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="14 Awolowo Road, Ikoyi, Lagos"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input
                id="city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Lagos"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="state">State / Province</FieldLabel>
              <Input
                id="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                placeholder="Lagos State"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="star-rating">Star Rating</FieldLabel>
              <Select value={starRating} onValueChange={setStarRating}>
                <SelectTrigger id="star-rating" className="w-full">
                  <SelectValue placeholder="Select a rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STAR_RATING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="checkout-time">Check-out Time</FieldLabel>
              <Select value={checkOutTime} onValueChange={setCheckOutTime}>
                <SelectTrigger id="checkout-time" className="w-full">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CHECK_OUT_TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="description">
                Hotel Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A well-appointed hotel offering premium hospitality for business and leisure guests."
                rows={3}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        {!isEditing && (
          <FieldSet>
            <FieldLegend variant="label">Room Types Available</FieldLegend>
            <FieldDescription>
              Select all room types this hotel offers. You'll configure
              individual rooms next.
            </FieldDescription>
            <div className="flex flex-wrap items-center gap-2">
              <ToggleGroup
                type="multiple"
                variant="outline"
                value={roomTypes}
                onValueChange={setRoomTypes}
                className="flex-wrap"
              >
                {[...PRESET_ROOM_TYPES, ...customRoomTypes].map((type) => (
                  <ToggleGroupItem
                    key={type}
                    value={type}
                    className="h-auto px-4 py-2"
                  >
                    {type}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {showCustomInput ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    autoFocus
                    value={customDraft}
                    onChange={(event) => setCustomDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomRoomType();
                      }
                    }}
                    placeholder="Custom type"
                    className="h-9 w-36"
                  />
                  <Button type="button" size="sm" onClick={addCustomRoomType}>
                    Add
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus data-icon="inline-start" />
                  Add Custom
                </Button>
              )}
            </div>
          </FieldSet>
        )}

        <FieldSet>
          <FieldLegend variant="label">Currency & Payments</FieldLegend>
          <Field>
            <FieldLabel className="sr-only">Currency</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={currency}
              onValueChange={(value) => setCurrency(value as Currency)}
            >
              {CURRENCY_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-auto flex-col gap-1 px-6 py-3"
                >
                  <span className="text-lg font-semibold">{option.symbol}</span>
                  <span className="text-xs text-muted-foreground group-data-[state=on]/toggle:text-primary-foreground/80">
                    {option.value}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
          <Field>
            <FieldLabel>Accepted Payment Methods</FieldLabel>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={paymentMethods}
              onValueChange={(value) =>
                setPaymentMethods(value as PaymentMethod[])
              }
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </FieldSet>

        {setupMutation.isError && (
          <p className="text-sm text-destructive">
            {setupMutation.error.message}
          </p>
        )}

        <div className="flex items-center justify-end">
          <Button type="submit" disabled={setupMutation.isPending}>
            {setupMutation.isPending
              ? "Saving…"
              : isEditing
                ? "Save Changes"
                : "Save & Continue"}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>
      </form>
    </div>
  );
}
