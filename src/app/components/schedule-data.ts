// ── Category System ────────────────────────────────────────────────
// Every time block belongs to exactly one category.
// Color is resolved automatically from the category — never set manually.

export const EVENT_CATEGORIES = [
  "MEAL",
  "PRODUCTION",
  "MEETING",
  "TEAM BUILDING",
  "BREAK",
  "DRINKS",
  "END",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

// Palette tokens — unchanged from the original Figma design
export type EventColor = "teal" | "purple" | "gold" | "green" | "slate";

export const COLOR_HEX: Record<EventColor, string> = {
  teal:   "#346a71",
  purple: "#45365c",
  gold:   "#8f784e",
  green:  "#3f8465",
  slate:  "#4b535c",
};

/** Accessible category label colors — solid, ≥3:1 contrast on each card bg */
export const LABEL_COLOR: Record<EventColor, string> = {
  teal:   "#a2c8cc",
  purple: "#8d7ea6",
  gold:   "#352a18",
  green:  "#173024",
  slate:  "#9da6af",
};

/** Accessible titleDark colors — ≥3:1 contrast on each card bg for 14px bold */
export const TITLE_DARK_COLOR: Record<EventColor, string> = {
  teal:   "#c8c7c6",
  purple: "#c8c7c6",
  gold:   "#1e1e1d",
  green:  "#242423",
  slate:  "#c8c7c6",
};

// Authoritative category → color binding.
// Changing a mapping here recolors every block in that category.
export const CATEGORY_COLOR: Record<EventCategory, EventColor> = {
  MEAL:           "teal",
  DRINKS:         "teal",
  PRODUCTION:     "purple",
  MEETING:        "gold",
  "TEAM BUILDING":"green",
  BREAK:          "slate",
  END:            "slate",
};

/** Resolve the hex background for any category */
export function categoryHex(cat: EventCategory): string {
  return COLOR_HEX[CATEGORY_COLOR[cat]];
}

/** Resolve the palette token for any category */
export function categoryColor(cat: EventCategory): EventColor {
  return CATEGORY_COLOR[cat];
}

// ── Types ──────────────────────────────────────────────────────────
export type BadgeType = "logo" | "DES" | "AM" | "DEV" | null;

export interface ScheduleEvent {
  id: string;
  day: number; // 0=Monday … 4=Friday
  startHour: number; // decimal hours from midnight, e.g. 9.5 = 9:30AM
  endHour: number;
  category: EventCategory;
  badge: BadgeType;
  title?: string;
  titleDark?: string; // part of title rendered in dark/muted color
  titleLight?: string; // part rendered in white/light
  description?: string;
  locationLabel?: string;
  locationAddress?: string;
  locationNote?: string;
  hideTypeLabel?: boolean;
  hideTitle?: boolean;
  customContent?: "teamBuilding";
}

// ── Layout Constants ───────────────────────────────────────────────
export const HOUR_HEIGHT = 150;
export const START_HOUR = 9;
export const END_HOUR = 21;
export const TOTAL_HOURS = END_HOUR - START_HOUR;
export const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday"];

/** Full date labels for mobile (April 20–23, 2026) */
export const DAY_DATE_LABELS = [
  "Monday, April 20",
  "Tuesday, April 21",
  "Wednesday, April 22",
  "Thursday, April 23",
];

/** Short date labels for compact mobile tabs */
export const DAY_SHORT_DATE_LABELS = [
  "Mon 4/20",
  "Tue 4/21",
  "Wed 4/22",
  "Thu 4/23",
];

export const TIME_COLUMN_WIDTH = 152;
export const DAY_COLUMN_WIDTH = 300;
export const COLUMN_HEADER_HEIGHT = 48;
export const CARD_GAP = 4;
export const CARD_HORIZONTAL_GAP = 5;

export const TIME_LABELS = [
  "9AM", "10AM", "11AM", "12PM", "1PM", "2PM",
  "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM",
];

// ── Event Data ─────────────────────────────────────────────────────
export const events: ScheduleEvent[] = [

  // ─── Monday 4/20 ───────────────────────────────────────────────────
  {
    id: "mon-1",
    day: 0,
    startHour: 9,
    endHour: 10,
    category: "MEAL",
    badge: null,
    titleLight: "Breakfast + Welcome",
    description: "Brought into Loading Docks",
  },
  {
    id: "mon-2",
    day: 0,
    startHour: 10,
    endHour: 12,
    category: "PRODUCTION",
    badge: null,
    titleLight: "Production",
    description: "2 hours",
  },
  {
    id: "mon-3",
    day: 0,
    startHour: 12,
    endHour: 13,
    category: "MEAL",
    badge: null,
    titleLight: "Lunch",
    description: "Brought into Loading Docks",
  },
  {
    id: "mon-4",
    day: 0,
    startHour: 13,
    endHour: 14,
    category: "BREAK",
    badge: null,
    titleLight: "Break",
    description: "30–45 Minutes",
  },
  {
    id: "mon-5",
    day: 0,
    startHour: 14,
    endHour: 15.5,
    category: "MEETING",
    badge: null,
    titleLight: "Team Block / Meetings",
    description: "1.5 hours  •  Implementing AI",
  },
  {
    id: "mon-6",
    day: 0,
    startHour: 15.5,
    endHour: 17,
    category: "PRODUCTION",
    badge: null,
    titleLight: "Production",
    description: "1.5 hours",
  },
  {
    id: "mon-7",
    day: 0,
    startHour: 17,
    endHour: 18,
    category: "BREAK",
    badge: null,
    titleLight: "Break",
    description: "1 Hour",
  },
  {
    id: "mon-8",
    day: 0,
    startHour: 18,
    endHour: 21,
    category: "MEAL",
    badge: null,
    titleLight: "Dinner at Airbnb (Townhouse)",
    locationLabel: "Location:",
    locationAddress: "409 Rally Point Place\nWake Forest, NC 27587",
    description: "Salt + Lime",
  },

  // ─── Tuesday 4/21 ──────────────────────────────────────────────────
  {
    id: "tue-1",
    day: 1,
    startHour: 9,
    endHour: 10,
    category: "MEAL",
    badge: null,
    titleLight: "Breakfast",
    description: "Brought into Loading Docks",
  },
  {
    id: "tue-2",
    day: 1,
    startHour: 10,
    endHour: 11,
    category: "PRODUCTION",
    badge: null,
    titleLight: "Production",
    description: "1 hour",
  },
  {
    id: "tue-3a",
    day: 1,
    startHour: 11,
    endHour: 12.5,
    category: "MEETING",
    badge: "DES",
    titleLight: "Team Block / Meetings",
    description: "Design + Dev  •  Boilerplate",
  },
  {
    id: "tue-3b",
    day: 1,
    startHour: 11,
    endHour: 12.5,
    category: "MEETING",
    badge: "AM",
    titleLight: "Team Block / Meetings",
    description: "AM  •  Boilerplate",
  },
  {
    id: "tue-4",
    day: 1,
    startHour: 12.5,
    endHour: 13.5,
    category: "MEAL",
    badge: null,
    titleLight: "Lunch",
    description: "Brought into Loading Docks",
  },
  {
    id: "tue-5",
    day: 1,
    startHour: 13.5,
    endHour: 14,
    category: "BREAK",
    badge: null,
    titleLight: "Break",
    description: "30–45 Minutes",
  },
  {
    id: "tue-6",
    day: 1,
    startHour: 14,
    endHour: 15.5,
    category: "MEETING",
    badge: null,
    titleLight: "Team Block / Meetings",
    description: "1.5 hours  •  All Together | TBD",
  },
  {
    id: "tue-7",
    day: 1,
    startHour: 15.5,
    endHour: 17,
    category: "PRODUCTION",
    badge: null,
    titleLight: "Production",
    description: "1.5 hours",
  },
  {
    id: "tue-8",
    day: 1,
    startHour: 17,
    endHour: 18,
    category: "BREAK",
    badge: null,
    titleLight: "Break",
    description: "1 Hour",
  },
  {
    id: "tue-9",
    day: 1,
    startHour: 18,
    endHour: 21,
    category: "MEAL",
    badge: null,
    titleLight: "Dinner at Airbnb (Townhouse)",
    locationLabel: "Location:",
    locationAddress: "409 Rally Point Place\nWake Forest, NC 27587",
    description: "Charcuterie",
  },

  // ─── Wednesday 4/22 ────────────────────────────────────────────────
  {
    id: "wed-1",
    day: 2,
    startHour: 10,
    endHour: 12,
    category: "TEAM BUILDING",
    badge: null,
    titleLight: "Team Pictures",
    locationLabel: "Location:",
    locationAddress: "Three Oaks Studio\n745 Merritt Capital Dr #102\nWake Forest, NC 27587",
  },
  {
    id: "wed-2",
    day: 2,
    startHour: 12,
    endHour: 13,
    category: "MEAL",
    badge: null,
    titleLight: "Lunch",
    description: "Brought into studio",
  },
  {
    id: "wed-3",
    day: 2,
    startHour: 13,
    endHour: 15,
    category: "TEAM BUILDING",
    badge: null,
    titleLight: "Team Pictures",
    locationLabel: "Location:",
    locationAddress: "Three Oaks Studio\n745 Merritt Capital Dr #102\nWake Forest, NC 27587",
  },
  {
    id: "wed-4",
    day: 2,
    startHour: 15,
    endHour: 17,
    category: "TEAM BUILDING",
    badge: null,
    titleLight: "Team Outing: Bowling",
    locationLabel: "Location:",
    locationAddress: "Strike and Barrel\n413 S Brooks St\nWake Forest, NC 27587",
  },
  {
    id: "wed-5",
    day: 2,
    startHour: 17,
    endHour: 18,
    category: "BREAK",
    badge: null,
    titleLight: "Break",
    description: "1 Hour",
  },
  {
    id: "wed-6",
    day: 2,
    startHour: 18,
    endHour: 21,
    category: "MEAL",
    badge: null,
    titleLight: "Dinner Out",
    locationLabel: "Location:",
    locationAddress: "Franko's Italian Steakhouse\n27 S Main St\nFranklinton, NC 27525",
  },

  // ─── Thursday 4/23 ─────────────────────────────────────────────────
  {
    id: "thu-1",
    day: 3,
    startHour: 9,
    endHour: 10,
    category: "MEAL",
    badge: null,
    titleLight: "Breakfast",
    description: "Brought into Loading Docks",
  },
  {
    id: "thu-2a",
    day: 3,
    startHour: 10,
    endHour: 11.5,
    category: "MEETING",
    badge: "DES",
    titleLight: "Team Block / Meetings",
    description: "Design + Dev  •  Split Teams",
  },
  {
    id: "thu-2b",
    day: 3,
    startHour: 10,
    endHour: 11.5,
    category: "MEETING",
    badge: "AM",
    titleLight: "Team Block / Meetings",
    description: "AM  •  Split Teams",
  },
  {
    id: "thu-3",
    day: 3,
    startHour: 11.5,
    endHour: 12.5,
    category: "PRODUCTION",
    badge: null,
    titleLight: "Production",
    description: "1 hour",
  },
  {
    id: "thu-4",
    day: 3,
    startHour: 12.5,
    endHour: 21,
    category: "END",
    badge: null,
    title: "Team Week Ends",
    hideTypeLabel: true,
  },

];

// ── Overlap Detection & Positioning ────────────────────────────────
export interface PositionedEvent extends ScheduleEvent {
  /** Resolved palette token for this event's category */
  color: EventColor;
  top: number;
  height: number;
  columnIndex: number;
  totalColumns: number;
}

function eventsOverlap(a: ScheduleEvent, b: ScheduleEvent): boolean {
  return a.startHour < b.endHour && b.startHour < a.endHour;
}

export function computePositionedEvents(dayEvents: ScheduleEvent[]): PositionedEvent[] {
  if (dayEvents.length === 0) return [];

  const sorted = [...dayEvents].sort(
    (a, b) => a.startHour - b.startHour || a.endHour - b.endHour,
  );

  // Build overlap groups
  const groups: ScheduleEvent[][] = [];
  let currentGroup: ScheduleEvent[] = [sorted[0]];
  let groupEnd = sorted[0].endHour;

  for (let i = 1; i < sorted.length; i++) {
    const evt = sorted[i];
    if (evt.startHour < groupEnd) {
      currentGroup.push(evt);
      groupEnd = Math.max(groupEnd, evt.endHour);
    } else {
      groups.push(currentGroup);
      currentGroup = [evt];
      groupEnd = evt.endHour;
    }
  }
  groups.push(currentGroup);

  // Assign columns within each overlap group
  const result: PositionedEvent[] = [];

  for (const group of groups) {
    const columns: ScheduleEvent[][] = [];

    for (const evt of group) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        if (!eventsOverlap(lastInCol, evt)) {
          columns[col].push(evt);
          result.push({
            ...evt,
            color: categoryColor(evt.category),
            top: (evt.startHour - START_HOUR) * HOUR_HEIGHT + CARD_GAP,
            height: (evt.endHour - evt.startHour) * HOUR_HEIGHT - CARD_GAP * 2,
            columnIndex: col,
            totalColumns: 0, // patched below
          });
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([evt]);
        result.push({
          ...evt,
          color: categoryColor(evt.category),
          top: (evt.startHour - START_HOUR) * HOUR_HEIGHT + CARD_GAP,
          height: (evt.endHour - evt.startHour) * HOUR_HEIGHT - CARD_GAP * 2,
          columnIndex: columns.length - 1,
          totalColumns: 0,
        });
      }
    }

    // Patch totalColumns to the actual column count for this group
    const actualColumns = columns.length;
    const resultMap = new Map<string, PositionedEvent>();
    for (const pe of result) resultMap.set(pe.id, pe);
    for (const evt of group) {
      resultMap.get(evt.id)!.totalColumns = actualColumns;
    }
  }

  return result;
}
