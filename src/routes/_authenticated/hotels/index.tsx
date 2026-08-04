import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useMyHotels } from "@/hooks/use-hotels";

export const Route = createFileRoute("/_authenticated/hotels/")({
  head: () => ({ meta: [{ title: "Hotels — ImperioBed" }] }),
  component: HotelsPage,
});

function HotelsPage() {
  const { data: hotels, isLoading } = useMyHotels();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-semibold">Hotels</h1>
        <Button asChild>
          <Link to="/hotels/new">
            <Plus data-icon="inline-start" />
            Create Hotel
          </Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {hotels?.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No hotels yet</EmptyTitle>
            <EmptyDescription>
              Create your first hotel to start taking bookings.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/hotels/new">
                <Plus data-icon="inline-start" />
                Create Hotel
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
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
