import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  events as initialEvents,
  type ScheduleEvent,
} from "./schedule-data";
import { type EventDetail, eventDetails } from "./event-details";

// ── localStorage keys ──────────────────────────────────────────────
const LS_EVENTS = "agenda-events";
const LS_DETAILS = "agenda-details";

// ── Mutable detail store ───────────────────────────────────────────
// Pre-populated with static event details; extended at runtime when
// events are added or edited via the modal.
const runtimeDetails: Record<string, EventDetail> = { ...eventDetails };

// Merge any previously saved details on top (saved details win over
// static defaults, so edits made through the UI survive page reloads)
try {
  const raw = localStorage.getItem(LS_DETAILS);
  if (raw) {
    const saved = JSON.parse(raw) as Record<string, EventDetail>;
    Object.assign(runtimeDetails, saved);
  }
} catch { /* ignore parse/storage errors */ }

export function getEventDetail(id: string): EventDetail | undefined {
  return runtimeDetails[id];
}

export function registerEventDetail(id: string, detail: EventDetail) {
  runtimeDetails[id] = detail;
}

/** Returns a snapshot of all currently-live event details */
export function getAllDetails(): Record<string, EventDetail> {
  return { ...runtimeDetails };
}

// ── Persistence helpers ────────────────────────────────────────────
function loadEvents(): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(LS_EVENTS);
    if (raw) return JSON.parse(raw) as ScheduleEvent[];
  } catch { /* ignore */ }
  return initialEvents;
}

function persistEvents(evts: ScheduleEvent[]) {
  try { localStorage.setItem(LS_EVENTS, JSON.stringify(evts)); } catch { /* ignore */ }
}

function persistDetails() {
  try { localStorage.setItem(LS_DETAILS, JSON.stringify(runtimeDetails)); } catch { /* ignore */ }
}

// ── Context ────────────────────────────────────────────────────────
interface ScheduleContextValue {
  events: ScheduleEvent[];
  loading: boolean;
  addEvent: (evt: ScheduleEvent, detail?: EventDetail) => void;
  updateEvent: (id: string, patch: Partial<Pick<ScheduleEvent, "day" | "startHour" | "endHour">>) => void;
  editFullEvent: (id: string, evt: ScheduleEvent, detail?: EventDetail) => void;
  deleteEvent: (id: string) => void;
  requestEdit: (eventId: string) => void;
  editingEventId: string | null;
  clearEditing: () => void;
  /** Pre-fill data for creating a new event from a grid cell click */
  prefill: { day: number; startHour: number } | null;
  setPrefill: (data: { day: number; startHour: number } | null) => void;
  /** Wipe localStorage and restore hardcoded defaults */
  resetToDefaults: () => void;
  /** Replace all state with a previously-exported snapshot */
  importState: (data: { events: ScheduleEvent[]; details?: Record<string, EventDetail> }) => void;
  /** Push current state to GitHub so everyone sees updates on next refresh */
  publish: () => Promise<{ ok: boolean; error?: string }>;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: use saved events if present, else hardcoded defaults
  const [events, setEvents] = useState<ScheduleEvent[]>(() => loadEvents());
  const [loading] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [prefill, setPrefillState] = useState<{ day: number; startHour: number } | null>(null);

  const addEvent = useCallback((evt: ScheduleEvent, detail?: EventDetail) => {
    setEvents((prev) => {
      const next = [...prev, evt];
      persistEvents(next);
      return next;
    });
    if (detail) {
      registerEventDetail(evt.id, detail);
      persistDetails();
    }
  }, []);

  const updateEvent = useCallback(
    (id: string, patch: Partial<Pick<ScheduleEvent, "day" | "startHour" | "endHour">>) => {
      setEvents((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        persistEvents(next);
        return next;
      });
    },
    [],
  );

  const editFullEvent = useCallback((id: string, evt: ScheduleEvent, detail?: EventDetail) => {
    setEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? evt : e));
      persistEvents(next);
      return next;
    });
    if (detail) {
      registerEventDetail(id, detail);
      persistDetails();
    }
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      persistEvents(next);
      return next;
    });
    delete runtimeDetails[id];
    persistDetails();
  }, []);

  const requestEdit = useCallback((eventId: string) => {
    setEditingEventId(eventId);
  }, []);

  const clearEditing = useCallback(() => {
    setEditingEventId(null);
  }, []);

  const setPrefill = useCallback((data: { day: number; startHour: number } | null) => {
    setPrefillState(data);
  }, []);

  const resetToDefaults = useCallback(() => {
    try {
      localStorage.removeItem(LS_EVENTS);
      localStorage.removeItem(LS_DETAILS);
    } catch { /* ignore */ }
    // Reset runtimeDetails back to static defaults
    Object.keys(runtimeDetails).forEach((k) => delete runtimeDetails[k]);
    Object.assign(runtimeDetails, eventDetails);
    setEvents(initialEvents);
  }, []);

  const importState = useCallback((data: { events: ScheduleEvent[]; details?: Record<string, EventDetail> }) => {
    if (!Array.isArray(data.events)) return;
    persistEvents(data.events);
    setEvents(data.events);
    if (data.details && typeof data.details === "object") {
      Object.keys(runtimeDetails).forEach((k) => delete runtimeDetails[k]);
      Object.assign(runtimeDetails, eventDetails); // start from static defaults
      Object.assign(runtimeDetails, data.details); // layer imported details on top
      persistDetails();
    }
  }, []);

  // ── Startup: load the last published schedule from the server ──────
  // /schedule-data.json is updated by the Publish button (via /api/publish).
  // Fetching it on mount means everyone always loads the most-recently-
  // published version, even without a page-cache reload.
  useEffect(() => {
    fetch(`/schedule-data.json?v=${Date.now()}`, { cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then((data: { events?: ScheduleEvent[]; details?: Record<string, EventDetail> }) => {
        if (!Array.isArray(data.events) || data.events.length === 0) return;
        persistEvents(data.events);
        setEvents(data.events);
        if (data.details && typeof data.details === "object") {
          Object.keys(runtimeDetails).forEach((k) => delete runtimeDetails[k]);
          Object.assign(runtimeDetails, eventDetails);
          Object.assign(runtimeDetails, data.details);
          persistDetails();
        }
      })
      .catch(() => { /* no published data yet — use localStorage/defaults */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Publish: write current state to GitHub via serverless function ─
  const publish = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    const details = getAllDetails();
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events, details }),
      });
      const body = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) return { ok: false, error: body.error ?? "Publish failed" };
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error — check your connection" };
    }
  }, [events]);

  return (
    <ScheduleContext.Provider value={{
      events, loading, addEvent, updateEvent, editFullEvent, deleteEvent,
      requestEdit, editingEventId, clearEditing,
      prefill, setPrefill,
      resetToDefaults, importState, publish,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error("useSchedule must be inside ScheduleProvider");
  return ctx;
}
