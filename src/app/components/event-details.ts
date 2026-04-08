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

const leadershipTeam = ["taylor", "tori", "jake", "kelly"];
const designTeam = ["kelly", "kayla", "joy", "jen", "rachel", "miranda", "carson", "jack"];
const amTeam = ["jake", "brittney", "rebecca"];
const devTeam = ["jake", "ben"];

export const eventDetails: Record<string, EventDetail> = {
  // ─── Monday ──────────────────────────────────────────────────────
  "mon-1": {
    fullDescription: "Team breakfast to kick off the week. Catered spread with coffee, pastries, and hot items.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(9, 10),
    location: "The Loading Dock",
  },
  "mon-2": {
    fullDescription: "Company-wide kickoff presentation followed by dedicated production time. Review Q1 goals, celebrate wins, and align on priorities for the week.",
    requiredAttendees: everyone,
    presenters: ["taylor"],
    timeLabel: formatTimeRange(10, 12.5),
    location: "The Loading Dock – Main Room",
  },
  "mon-3": {
    fullDescription: "Lunch catered by Over the Falls. Grab a plate and find a spot to relax.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12.5, 13),
    location: "The Loading Dock",
  },
  "mon-4": {
    fullDescription: "Free time — take a walk, grab coffee, or decompress before the afternoon sessions.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(13, 14),
  },
  "mon-5": {
    fullDescription: "Discussion to reinforce and adjust file naming conventions across the design team. Bring examples of what's working and pain points you've encountered.",
    requiredAttendees: designTeam,
    optionalAttendees: ["jen"],
    presenters: ["tori", "kayla"],
    timeLabel: formatTimeRange(14, 15.5),
    location: "The Loading Dock – Conference Room A",
  },
  "mon-6": {
    fullDescription: "Open-format meeting for the Account Management team. Jake leads the discussion on client priorities and cross-team alignment topics.",
    requiredAttendees: amTeam,
    optionalAttendees: ["taylor"],
    presenters: ["jake"],
    timeLabel: formatTimeRange(14, 15.5),
    location: "The Loading Dock – Conference Room B",
  },
  "mon-7": {
    fullDescription: "Dedicated heads-down production time. Work on active project deliverables with your team.",
    requiredAttendees: [...designTeam, ...devTeam, ...amTeam],
    timeLabel: formatTimeRange(15.5, 17),
    location: "The Loading Dock",
  },
  "mon-8": {
    fullDescription: "Wrap up for the day. Head to the townhouse to freshen up before dinner.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(17, 18.5),
  },
  "mon-9": {
    fullDescription: "Dinner catered by Salt and Lime, followed by game night at the Airbnb townhouse. Board games and card games provided.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(18.5, 21),
    location: "Airbnb Townhouse\n409 Rally Point Place\nWake Forest, NC 27587",
    locationNote: "Steadfast will bring a meal to the townhouse",
  },

  // ─── Tuesday ─────────────────────────────────────────────────────
  "tue-1": {
    fullDescription: "Breakfast at the office before the day's sessions begin.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(9, 9.5),
    location: "The Loading Dock",
  },
  "tue-2": {
    fullDescription: "Morning production block. Focus on active deliverables and project work.",
    requiredAttendees: [...designTeam, ...devTeam, ...amTeam],
    timeLabel: formatTimeRange(9.5, 10.5),
    location: "The Loading Dock",
  },
  "tue-3": {
    fullDescription: "Workshop on how we can all provide and receive honest and constructive feedback. Interactive exercises and group discussion based on Kim Scott's Radical Candor framework.",
    requiredAttendees: everyone,
    presenters: ["brittney", "rachel"],
    timeLabel: formatTimeRange(10.5, 12),
    location: "The Loading Dock – Main Room",
  },
  "tue-4": {
    fullDescription: "Lunch from Publix — subs and salads. Quick refuel before the afternoon.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12, 12.5),
    location: "The Loading Dock",
  },
  "tue-5": {
    fullDescription: "Midday break. Step outside, recharge, or catch up on messages.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(12.5, 13.5),
  },
  "tue-6": {
    fullDescription: "Open discussion surrounding process across teams to improve efficiency and harmony. Bring your thoughts on what's working well and where we can do better.",
    requiredAttendees: everyone,
    presenters: ["taylor", "tori"],
    timeLabel: formatTimeRange(13.5, 15),
    location: "The Loading Dock – Main Room",
  },
  "tue-7": {
    fullDescription: "Afternoon production block. Continue working on project deliverables.",
    requiredAttendees: [...designTeam, ...devTeam, ...amTeam],
    timeLabel: formatTimeRange(15, 17),
    location: "The Loading Dock",
  },
  "tue-8": {
    fullDescription: "End-of-day break. Head to the townhouse or explore the area.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(17, 18.5),
  },
  "tue-9": {
    fullDescription: "Mediterranean dinner followed by game night at the Airbnb. Casual evening to unwind together.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(18.5, 21),
    location: "Airbnb Townhouse\n409 Rally Point Place\nWake Forest, NC 27587",
    locationNote: "Steadfast will bring a meal to the townhouse",
  },

  // ─── Wednesday ───────────────────────────────────────────────────
  "wed-1": {
    fullDescription: "Full-day team building: meet at the Steadfast office at 10:15, lunch at Superica at 11, Escape Rooms at 1 PM, then Frankie's of Raleigh at 2:30 PM. Comfortable shoes recommended!",
    requiredAttendees: everyone,
    presenters: ["taylor", "jen"],
    timeLabel: formatTimeRange(10.25, 17),
    location: "Multiple Locations (see itinerary)",
  },
  "wed-2": {
    fullDescription: "Free time after team building activities. Rest up before the evening.",
    requiredAttendees: [],
    optionalAttendees: everyone,
    timeLabel: formatTimeRange(17, 18.25),
  },
  "wed-3": {
    fullDescription: "Drinks at Owl's Roost Brewery in downtown Franklinton. Local craft beer and a relaxed atmosphere.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(18.25, 19.5),
    location: "Owl's Roost Brewery\n20 N Main St.\nFranklinton, NC 27525",
  },
  "wed-4": {
    fullDescription: "Dinner at Franko's Italian Steakhouse. Italian-American steakhouse with a great menu.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(19.5, 21),
    location: "Franko's Italian Steakhouse\n7 S Main St.\nFranklinton, NC 27525",
  },

  // ─── Thursday ────────────────────────────────────────────────────
  "thu-1": {
    fullDescription: "Final breakfast together before the last sessions.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(9, 9.5),
    location: "The Loading Dock",
  },
  "thu-2": {
    fullDescription: "Open Q&A surrounding any technical ClickUp questions about process and dashboards. Bring your laptop and specific questions.",
    requiredAttendees: [...designTeam, ...amTeam],
    optionalAttendees: devTeam,
    presenters: ["tori"],
    timeLabel: formatTimeRange(9.5, 11),
    location: "The Loading Dock – Conference Room A",
  },
  "thu-3": {
    fullDescription: "Final production block of Team Week. Wrap up any outstanding items.",
    requiredAttendees: [...designTeam, ...devTeam, ...amTeam],
    timeLabel: formatTimeRange(11, 12),
    location: "The Loading Dock",
  },
  "thu-4": {
    fullDescription: "That's a wrap! Thanks for an amazing Team Week. Safe travels home, everyone.",
    requiredAttendees: everyone,
    timeLabel: formatTimeRange(12, 12.5),
  },
};