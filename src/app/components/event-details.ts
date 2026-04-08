// ── Extended Event Detail Metadata ─────────────────────────────────
// Rich detail data keyed by event ID, shown in the hover detail panel.
// Attendees reference people IDs from people-data.ts.

export interface EventDetail {
  fullDescription: string;
  requiredAttendees: string[]; // people IDs
  optionalAttendees?: string[];
  presenters?: string[];
  timeLabel: string; // e.g. "9:00 AM – 10:00 AM"
  location?: string;
  locationNote?: string;
  /** Extra notes shown below location in the detail panel */
  moreDetails?: string;
}

/** Convert decimal hour to display string, e.g. 13.5 → "1:30 PM" */
export function formatHour(h: number): string {
  const totalMinutes = Math.round(h * 60);
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return minutes === 0 ? `${hours}:00 ${ampm}` : `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export function formatTimeRange(start: number, end: number): string {
  return `${formatHour(start)} – ${formatHour(end)}`;
}

// All 14 team members
const everyone = [
  "taylor", "tori", "jake", "rebecca", "brittney", "ben",
  "kayla", "jen", "rachel", "carson", "miranda", "jack", "joy", "kelly",
];

export const eventDetails: Record<string, EventDetail> = {

  // ─── Monday 4/20 ─────────────────────────────────────────────────
  "mon-1": {
    fullDescription: "Breakfast + Welcome to kick off Team Week. Catered spread brought into the Loading Docks.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(9, 10),
    location: "The Loading Dock",
  },
  "mon-2": {
    fullDescription: "Dedicated production block. Work on active project deliverables.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(10, 12),
    location: "The Loading Dock",
  },
  "mon-3": {
    fullDescription: "Lunch catered and brought into the Loading Docks.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12, 13),
    location: "The Loading Dock",
  },
  "mon-4": {
    fullDescription: "Short break — 30 to 45 minutes. Step outside, grab a coffee, or recharge.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(13, 14),
  },
  "mon-5": {
    fullDescription: "Team block and meetings focused on Implementing AI across projects and workflows.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(14, 15.5),
    location: "The Loading Dock",
  },
  "mon-6": {
    fullDescription: "Afternoon production block. Continue working on active deliverables.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(15.5, 17),
    location: "The Loading Dock",
  },
  "mon-7": {
    fullDescription: "One-hour break before dinner. Head to the Airbnb to freshen up.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(17, 18),
  },
  "mon-8": {
    fullDescription: "Dinner catered by Salt + Lime at the Airbnb Townhouse.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(18, 21),
    location: "Airbnb Townhouse",
    locationNote: "409 Rally Point Place, Wake Forest, NC 27587",
  },

  // ─── Tuesday 4/21 ────────────────────────────────────────────────
  "tue-1": {
    fullDescription: "Breakfast catered and brought into the Loading Docks.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(9, 10),
    location: "The Loading Dock",
  },
  "tue-2": {
    fullDescription: "Morning production block. Focus on active project work.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(10, 11),
    location: "The Loading Dock",
  },
  "tue-3a": {
    fullDescription: "Design + Dev team meeting — Boilerplate.",
    requiredAttendees: ["kelly", "kayla", "joy", "jen", "rachel", "miranda", "carson", "jack", "ben"],
    timeLabel: formatTimeRange(11, 12.5),
    location: "The Loading Dock",
  },
  "tue-3b": {
    fullDescription: "AM team meeting — Boilerplate.",
    requiredAttendees: ["jake", "brittney", "rebecca"],
    timeLabel: formatTimeRange(11, 12.5),
    location: "The Loading Dock",
  },
  "tue-4": {
    fullDescription: "Lunch catered and brought into the Loading Docks.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12.5, 13.5),
    location: "The Loading Dock",
  },
  "tue-5": {
    fullDescription: "Short break — 30 to 45 minutes. Step away and recharge.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(13.5, 14),
  },
  "tue-6": {
    fullDescription: "All-team meeting block — agenda TBD.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(14, 15.5),
    location: "The Loading Dock",
  },
  "tue-7": {
    fullDescription: "Afternoon production block. Wrap up deliverables for the day.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(15.5, 17),
    location: "The Loading Dock",
  },
  "tue-8": {
    fullDescription: "One-hour break before dinner.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(17, 18),
  },
  "tue-9": {
    fullDescription: "Dinner at the Airbnb Townhouse with charcuterie.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(18, 21),
    location: "Airbnb Townhouse",
    locationNote: "409 Rally Point Place, Wake Forest, NC 27587",
  },

  // ─── Wednesday 4/22 ──────────────────────────────────────────────
  "wed-1": {
    fullDescription: "Morning team photo session at Three Oaks Studio.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(10, 12),
    location: "Three Oaks Studio",
    locationNote: "745 Merritt Capital Dr #102, Wake Forest, NC 27587",
  },
  "wed-2": {
    fullDescription: "Lunch brought into the studio.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12, 13),
    location: "Three Oaks Studio",
  },
  "wed-3": {
    fullDescription: "Afternoon team photo session at Three Oaks Studio.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(13, 15),
    location: "Three Oaks Studio",
    locationNote: "745 Merritt Capital Dr #102, Wake Forest, NC 27587",
  },
  "wed-4": {
    fullDescription: "Team outing — bowling at Strike and Barrel!",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(15, 17),
    location: "Strike and Barrel",
    locationNote: "413 S Brooks St, Wake Forest, NC 27587",
  },
  "wed-5": {
    fullDescription: "One-hour break before dinner.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(17, 18),
  },
  "wed-6": {
    fullDescription: "Dinner out at Franko's Italian Steakhouse.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(18, 21),
    location: "Franko's Italian Steakhouse",
    locationNote: "27 S Main St, Franklinton, NC 27525",
  },

  // ─── Thursday 4/23 ───────────────────────────────────────────────
  "thu-1": {
    fullDescription: "Final Team Week breakfast brought into the Loading Docks.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(9, 10),
    location: "The Loading Dock",
  },
  "thu-2a": {
    fullDescription: "Design + Dev team meeting — Split Teams.",
    requiredAttendees: ["kelly", "kayla", "joy", "jen", "rachel", "miranda", "carson", "jack", "ben"],
    timeLabel: formatTimeRange(10, 11.5),
    location: "The Loading Dock",
  },
  "thu-2b": {
    fullDescription: "AM team meeting — Split Teams.",
    requiredAttendees: ["jake", "brittney", "rebecca"],
    timeLabel: formatTimeRange(10, 11.5),
    location: "The Loading Dock",
  },
  "thu-3": {
    fullDescription: "Final production block of Team Week. Wrap up any outstanding items.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(11.5, 12.5),
    location: "The Loading Dock",
  },
  "thu-4": {
    fullDescription: "That's a wrap on Team Week! Safe travels home, everyone.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12.5, 21),
  },

};
