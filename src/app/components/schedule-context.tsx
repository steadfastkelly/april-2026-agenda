import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  events as initialEvents,
  type ScheduleEvent,
} from "./schedule-data";
import { type EventDetail } from "./event-details";

// ── Mutable detail store ───────────────────────────────────────────
// We keep a runtime copy so new events can register detail metadata.
const runtimeDetails: Record<string, EventDetail> = {};

export function getEventDetail(id: string): EventDetail | undefined {
  return runtimeDetails[id];
}

export function registerEventDetail(id: string, detail: EventDetail) {
  runtimeDetails[id] = detail;
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
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [loading] = useState(false); // No loading needed for local data
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [prefill, setPrefillState] = useState<{ day: number; startHour: number } | null>(null);

  const addEvent = useCallback((evt: ScheduleEvent, detail?: EventDetail) => {
    setEvents((prev) => [...prev, evt]);
    if (detail) {
      registerEventDetail(evt.id, detail);
    }
  }, []);

  const updateEvent = useCallback(
    (id: string, patch: Partial<Pick<ScheduleEvent, "day" | "startHour" | "endHour">>) => {
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    },
    [],
  );

  const editFullEvent = useCallback((id: string, evt: ScheduleEvent, detail?: EventDetail) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? evt : e)));
    if (detail) {
      registerEventDetail(id, detail);
    }
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    delete runtimeDetails[id];
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

  return (
    <ScheduleContext.Provider value={{
      events, loading, addEvent, updateEvent, editFullEvent, deleteEvent,
      requestEdit, editingEventId, clearEditing,
      prefill, setPrefill,
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