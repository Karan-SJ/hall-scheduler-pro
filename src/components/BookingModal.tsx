import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { minutesToTime, type Booking } from "@/lib/bookingData";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hallName: string;
  date: string;
  startTime: number;
  endTime: number;
  onConfirm: (title: string, organizer: string) => void;
}

export function BookingModal({
  open,
  onOpenChange,
  hallName,
  date,
  startTime,
  endTime,
  onConfirm,
}: BookingModalProps) {
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");

  const handleConfirm = () => {
    if (!title.trim() || !organizer.trim()) return;
    onConfirm(title.trim(), organizer.trim());
    setTitle("");
    setOrganizer("");
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setTitle("");
      setOrganizer("");
    }
    onOpenChange(val);
  };

  const duration = endTime - startTime;
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Confirm Booking</DialogTitle>
          <DialogDescription>Fill in the details to reserve this time slot.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Details summary */}
          <div className="rounded-lg border bg-muted/50 p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{hallName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {minutesToTime(startTime)} — {minutesToTime(endTime)}{" "}
                <span className="text-xs">({duration} min)</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g. Sprint Planning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizer">Organizer</Label>
            <Input
              id="organizer"
              placeholder="e.g. Jane Doe"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!title.trim() || !organizer.trim()}>
            Book Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
