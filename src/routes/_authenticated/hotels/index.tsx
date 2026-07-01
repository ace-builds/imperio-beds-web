import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateHotel, useMyHotels } from "@/hooks/use-hotels";

export const Route = createFileRoute("/_authenticated/hotels/")({
  head: () => ({ meta: [{ title: "Hotels — ImperioBed" }] }),
  component: HotelsPage,
});

function HotelsPage() {
  const { data: hotels, isLoading } = useMyHotels();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hotels</h1>
        <CreateHotelDialog />
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {hotels?.length === 0 && (
        <p className="text-muted-foreground">
          You don't have any hotels yet. Create your first one to get started.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {hotels?.map((hotel) => (
          <Link
            key={hotel.id}
            to="/hotels/$hotelId"
            params={{ hotelId: hotel.id }}
          >
            <Card className="hover:bg-muted">
              <CardHeader>
                <CardTitle>{hotel.name}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CreateHotelDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createHotel = useCreateHotel();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create hotel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create hotel</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            createHotel.mutate(
              { name },
              {
                onSuccess: () => {
                  setOpen(false);
                  setName("");
                },
              },
            );
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hotel-name">Name</Label>
            <Input
              id="hotel-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {createHotel.isError && (
            <p className="text-sm text-destructive">
              {createHotel.error.message}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={createHotel.isPending}>
              {createHotel.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
