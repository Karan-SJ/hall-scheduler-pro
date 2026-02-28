export interface Hall {
  id: string;
  name: string;
  capacity: number;
  color: string;
}

export interface Booking {
  id: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  title: string;
  organizer: string;
}

export const HALLS: Hall[] = [
  { id: "h1", name: "Grand Ballroom", capacity: 200, color: "bg-blue-100 text-blue-700" },
  { id: "h2", name: "Boardroom A", capacity: 20, color: "bg-emerald-100 text-emerald-700" },
  { id: "h3", name: "Boardroom B", capacity: 20, color: "bg-amber-100 text-amber-700" },
  { id: "h4", name: "Innovation Lab", capacity: 40, color: "bg-violet-100 text-violet-700" },
  { id: "h5", name: "Sky Lounge", capacity: 60, color: "bg-rose-100 text-rose-700" },
  { id: "h6", name: "Summit Room", capacity: 30, color: "bg-cyan-100 text-cyan-700" },
  { id: "h7", name: "Training Center", capacity: 80, color: "bg-orange-100 text-orange-700" },
  { id: "h8", name: "Executive Suite", capacity: 12, color: "bg-indigo-100 text-indigo-700" },
];

const today = new Date().toISOString().split("T")[0];

export const MOCK_BOOKINGS: Booking[] = [
  { id: "b1", hallId: "h1", date: today, startTime: 570, endTime: 660, title: "All-Hands Meeting", organizer: "Sarah Chen" },
  { id: "b2", hallId: "h1", date: today, startTime: 780, endTime: 900, title: "Product Launch Prep", organizer: "Mike Ross" },
  { id: "b3", hallId: "h2", date: today, startTime: 600, endTime: 690, title: "Sprint Planning", organizer: "Alex Kumar" },
  { id: "b4", hallId: "h3", date: today, startTime: 540, endTime: 630, title: "Design Review", organizer: "Lisa Park" },
  { id: "b5", hallId: "h4", date: today, startTime: 660, endTime: 780, title: "Hackathon Kickoff", organizer: "Tom Davis" },
  { id: "b6", hallId: "h5", date: today, startTime: 720, endTime: 810, title: "Client Lunch", organizer: "Emma White" },
  { id: "b7", hallId: "h6", date: today, startTime: 900, endTime: 990, title: "Strategy Session", organizer: "James Lee" },
  { id: "b8", hallId: "h7", date: today, startTime: 540, endTime: 720, title: "Onboarding Workshop", organizer: "Rachel Green" },
  { id: "b9", hallId: "h8", date: today, startTime: 600, endTime: 660, title: "Board Call", organizer: "David Kim" },
  { id: "b10", hallId: "h8", date: today, startTime: 840, endTime: 960, title: "Investor Meeting", organizer: "Julia Scott" },
];

// Timeline constants
export const TIMELINE_START = 540; // 9:00 AM in minutes
export const TIMELINE_END = 1020; // 5:00 PM in minutes
export const SLOT_DURATION = 15; // minutes
export const TOTAL_SLOTS = (TIMELINE_END - TIMELINE_START) / SLOT_DURATION; // 32 slots

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function snapToSlot(minutes: number): number {
  return Math.round((minutes - TIMELINE_START) / SLOT_DURATION) * SLOT_DURATION + TIMELINE_START;
}
