import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryMovements } from "@/hooks/use-inventory";
import type { InventoryItem } from "@/lib/schemas/inventory";

export function MovementHistorySheet({
  open,
  onOpenChange,
  hotelId,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  item: InventoryItem | null;
}) {
  const { data: movements, isLoading } = useInventoryMovements(
    hotelId,
    item?.id ?? "",
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Movement History</SheetTitle>
          <SheetDescription>
            {item
              ? `${item.name} · ${item.currentStock} ${item.unit} current stock`
              : ""}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
          {isLoading ? (
            <div className="flex flex-col gap-3 px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : movements?.length === 0 ? (
            <p className="px-4 text-sm text-muted-foreground">
              No movements recorded yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2 px-4">
              {movements?.map((m) => (
                <div
                  key={m.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  {m.type === "in" ? (
                    <ArrowUpCircle className="mt-0.5 size-5 shrink-0 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  )}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={m.type === "in" ? "default" : "destructive"}
                      >
                        {m.type === "in" ? "+" : "−"}
                        {m.quantity} {item?.unit}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{m.reason}</p>
                    {m.cost != null && (
                      <p className="text-xs text-muted-foreground">
                        Cost: {m.cost}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
