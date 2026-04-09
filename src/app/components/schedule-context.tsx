import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
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

  return (
    <ScheduleContext.Provider value={{
      events, loading, addEvent, updateEvent, editFullEvent, deleteEvent,
      requestEdit, editingEventId, clearEditing,
      prefill, setPrefill,
      resetToDefaults,
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
