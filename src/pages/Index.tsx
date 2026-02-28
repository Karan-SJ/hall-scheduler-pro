import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookingTimeline } from "@/components/BookingTimeline";

const Index = () => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              Room Scheduler
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal gap-2",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {date ? format(date, "EEEE, MMM d, yyyy") : "Pick a date"}
                  </span>
                  <span className="sm:hidden">
                    {date ? format(date, "MMM d") : "Date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Book</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {date ? format(date, "EEEE, MMMM d") : "Select a date"}
            </h2>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Click and drag on empty slots to book a room
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-timeline-booked timeline-hash-pattern border border-timeline-grid-line" />
              Reserved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary/20 border-2 border-primary/50" />
              Selection
            </span>
          </div>
        </div>

        <BookingTimeline selectedDate={date} />
      </main>
    </div>
  );
};

export default Index;
