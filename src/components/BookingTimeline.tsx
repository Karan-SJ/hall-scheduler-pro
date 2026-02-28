import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  HALLS,
  MOCK_BOOKINGS,
  TIMELINE_START,
  TIMELINE_END,
  SLOT_DURATION,
  TOTAL_SLOTS,
  minutesToTime,
  type Booking,
} from "@/lib/bookingData";
import { BookingModal } from "./BookingModal";
import { toast } from "sonner";

const SLOT_WIDTH = 60; // px per 15-min slot

interface Selection {
  hallId: string;
  startSlot: number;
  endSlot: number;
}

export function BookingTimeline({ selectedDate }: { selectedDate: Date }) {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHallId, setDragHallId] = useState<string | null>(null);
  const [dragStartSlot, setDragStartSlot] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    hallId: string;
    startTime: number;
    endTime: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const dateStr = selectedDate.toISOString().split("T")[0];
  const isToday = dateStr === new Date().toISOString().split("T")[0];

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === dateStr),
    [bookings, dateStr]
  );

  // Current time indicator position
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, [isToday]);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowSlotPos =
    isToday && nowMinutes >= TIMELINE_START && nowMinutes <= TIMELINE_END
      ? ((nowMinutes - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100
      : null;

  // Check overlap
  const hasOverlap = useCallback(
    (hallId: string, start: number, end: number) => {
      return dayBookings.some(
        (b) => b.hallId === hallId && start < b.endTime && end > b.startTime
      );
    },
    [dayBookings]
  );

  // Clamp selection to avoid booked slots
  const clampSelection = useCallback(
    (hallId: string, anchorSlot: number, currentSlot: number) => {
      const minSlot = Math.min(anchorSlot, currentSlot);
      const maxSlot = Math.max(anchorSlot, currentSlot);
      const startTime = TIMELINE_START + minSlot * SLOT_DURATION;
      const endTime = TIMELINE_START + (maxSlot + 1) * SLOT_DURATION;

      // Check if any booked slot overlaps
      const hallBookings = dayBookings
        .filter((b) => b.hallId === hallId)
        .sort((a, b) => a.startTime - b.startTime);

      let clampedStart = startTime;
      let clampedEnd = endTime;

      for (const b of hallBookings) {
        if (b.startTime < clampedEnd && b.endTime > clampedStart) {
          // Overlap detected — clamp
          if (anchorSlot <= currentSlot) {
            clampedEnd = Math.min(clampedEnd, b.startTime);
          } else {
            clampedStart = Math.max(clampedStart, b.endTime);
          }
        }
      }

      if (clampedStart >= clampedEnd) return null;

      return {
        hallId,
        startSlot: (clampedStart - TIMELINE_START) / SLOT_DURATION,
        endSlot: (clampedEnd - TIMELINE_START) / SLOT_DURATION - 1,
      };
    },
    [dayBookings]
  );

  const getSlotFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const scrollLeft = gridRef.current.scrollLeft;
    const x = clientX - rect.left + scrollLeft;
    const slot = Math.floor(x / SLOT_WIDTH);
    return Math.max(0, Math.min(TOTAL_SLOTS - 1, slot));
  };

  const getHallFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    const y = clientY - rect.top + gridRef.current.scrollTop;
    const headerHeight = 40; // time header height
    const rowHeight = 64;
    const hallIndex = Math.floor((y - headerHeight) / rowHeight);
    if (hallIndex < 0 || hallIndex >= HALLS.length) return null;
    return HALLS[hallIndex].id;
  };

  const handlePointerDown = (hallId: string, slot: number) => {
    const time = TIMELINE_START + slot * SLOT_DURATION;
    if (
      dayBookings.some(
        (b) => b.hallId === hallId && time >= b.startTime && time < b.endTime
      )
    )
      return;

    setIsDragging(true);
    setDragHallId(hallId);
    setDragStartSlot(slot);
    setSelection({ hallId, startSlot: slot, endSlot: slot });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || dragHallId === null || dragStartSlot === null) return;
    const slot = getSlotFromEvent(e);
    if (slot === null) return;

    const newSel = clampSelection(dragHallId, dragStartSlot, slot);
    if (newSel) setSelection(newSel);
  };

  const handlePointerUp = () => {
    if (!isDragging || !selection) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    const startTime = TIMELINE_START + selection.startSlot * SLOT_DURATION;
    const endTime = TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION;

    setPendingBooking({ hallId: selection.hallId, startTime, endTime });
    setModalOpen(true);
  };

  const handleConfirmBooking = (title: string, organizer: string) => {
    if (!pendingBooking) return;
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      hallId: pendingBooking.hallId,
      date: dateStr,
      startTime: pendingBooking.startTime,
      endTime: pendingBooking.endTime,
      title,
      organizer,
    };
    setBookings((prev) => [...prev, newBooking]);
    setModalOpen(false);
    setSelection(null);
    setPendingBooking(null);
    toast.success("Booking confirmed!", {
      description: `${title} in ${HALLS.find((h) => h.id === pendingBooking.hallId)?.name}`,
    });
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setSelection(null);
      setPendingBooking(null);
    }
  };

  // Generate time labels
  const timeLabels: { slot: number; label: string }[] = [];
  for (let i = 0; i <= TOTAL_SLOTS; i++) {
    if (i % 4 === 0) {
      timeLabels.push({ slot: i, label: minutesToTime(TIMELINE_START + i * SLOT_DURATION) });
    }
  }

  const totalWidth = TOTAL_SLOTS * SLOT_WIDTH;

  return (
    <>
      <div className="flex border rounded-xl overflow-hidden bg-card shadow-sm">
        {/* Hall names — sticky left */}
        <div className="flex-shrink-0 border-r bg-card z-10">
          {/* Header spacer */}
          <div className="h-10 border-b bg-muted/30 flex items-center px-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Halls
            </span>
          </div>
          {HALLS.map((hall) => (
            <div
              key={hall.id}
              className="h-16 border-b flex items-center px-3 min-w-[140px] lg:min-w-[180px]"
            >
              <div>
                <div className="text-sm font-medium text-foreground leading-tight">
                  {hall.name}
                </div>
                <div className="text-xs text-muted-foreground">{hall.capacity} seats</div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline grid — scrollable */}
        <div
          ref={gridRef}
          className="flex-1 overflow-x-auto select-none"
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div style={{ width: totalWidth, minWidth: "100%" }} className="relative">
            {/* Time header */}
            <div className="h-10 border-b bg-muted/30 relative">
              {timeLabels.map(({ slot, label }) => (
                <div
                  key={slot}
                  className="absolute top-0 h-full flex items-center text-xs text-muted-foreground font-medium"
                  style={{ left: slot * SLOT_WIDTH }}
                >
                  <span className="pl-1">{label}</span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {HALLS.map((hall) => {
              const hallBookings = dayBookings.filter((b) => b.hallId === hall.id);

              return (
                <div key={hall.id} className="h-16 border-b relative group">
                  {/* Grid lines */}
                  {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
                    <div
                      key={i}
                      className={`absolute top-0 h-full cursor-pointer transition-colors hover:bg-primary/5 ${
                        i % 4 === 0 ? "border-l border-timeline-grid-line" : "border-l border-timeline-grid-line/40"
                      }`}
                      style={{ left: i * SLOT_WIDTH, width: SLOT_WIDTH }}
                      onMouseDown={() => handlePointerDown(hall.id, i)}
                      onTouchStart={() => handlePointerDown(hall.id, i)}
                    />
                  ))}

                  {/* Booked slots */}
                  {hallBookings.map((booking) => {
                    const startSlot = (booking.startTime - TIMELINE_START) / SLOT_DURATION;
                    const endSlot = (booking.endTime - TIMELINE_START) / SLOT_DURATION;
                    const width = (endSlot - startSlot) * SLOT_WIDTH;
                    const left = startSlot * SLOT_WIDTH;

                    return (
                      <div
                        key={booking.id}
                        className="absolute top-1 bottom-1 rounded-md bg-timeline-booked timeline-hash-pattern border border-timeline-grid-line flex items-center px-2 overflow-hidden pointer-events-none"
                        style={{ left, width }}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground/70 truncate">
                            {booking.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {booking.organizer}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Selection highlight */}
                  {selection && selection.hallId === hall.id && (
                    <div
                      className="absolute top-1 bottom-1 rounded-md bg-primary/20 border-2 border-primary/50 pointer-events-none z-10"
                      style={{
                        left: selection.startSlot * SLOT_WIDTH,
                        width: (selection.endSlot - selection.startSlot + 1) * SLOT_WIDTH,
                      }}
                    >
                      <div className="flex items-center justify-center h-full text-xs font-medium text-primary">
                        {minutesToTime(TIMELINE_START + selection.startSlot * SLOT_DURATION)} –{" "}
                        {minutesToTime(
                          TIMELINE_START + (selection.endSlot + 1) * SLOT_DURATION
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current time indicator */}
            {nowSlotPos !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-timeline-current-time z-20 pointer-events-none"
                style={{ left: `${nowSlotPos}%` }}
              >
                <div className="absolute -top-0 -left-1.5 w-3.5 h-3.5 rounded-full bg-timeline-current-time" />
              </div>
            )}
          </div>
        </div>
      </div>

      <BookingModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        hallName={HALLS.find((h) => h.id === pendingBooking?.hallId)?.name ?? ""}
        date={dateStr}
        startTime={pendingBooking?.startTime ?? 0}
        endTime={pendingBooking?.endTime ?? 0}
        onConfirm={handleConfirmBooking}
      />
    </>
  );
}
