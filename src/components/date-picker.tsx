import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  date,
  onDateChange,
  minDate,
  id,
  className,
  size = "sm",
}: {
  date: Date;
  onDateChange: (date: Date) => void;
  /** Dates before this one are unselectable — e.g. a check-out before check-in. */
  minDate?: Date;
  id?: string;
  className?: string;
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size={size}
          className={cn("font-normal", className)}
        >
          <CalendarIcon data-icon="inline-start" />
          {new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          disabled={minDate ? { before: minDate } : undefined}
          onSelect={(selected) => {
            if (!selected) return;
            onDateChange(selected);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
