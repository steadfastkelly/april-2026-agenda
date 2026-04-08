import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { type Department, people } from "./people-data";
import { getEventDetail } from "./schedule-context";

// ── Filter types ───────────────────────────────────────────────────
export type FilterMode = "all" | "department";

export interface FilterState {
  mode: FilterMode;
  department: Department | null;
}

interface FilterContextValue {
  filter: FilterState;
  setDepartmentFilter: (dept: Department | null) => void;
  clearFilter: () => void;
  /** Check whether an event passes the current filter */
  eventPassesFilter: (eventId: string) => boolean;
}

const FilterContext = createContext<FilterContextValue | null>(null);

// ── Helper: get all person IDs associated with an event ────────────
function getEventPeople(eventId: string): string[] {
  const detail = getEventDetail(eventId);
  if (!detail) return [];
  const ids = new Set<string>();
  detail.requiredAttendees.forEach((id) => ids.add(id));
  detail.optionalAttendees?.forEach((id) => ids.add(id));
  detail.presenters?.forEach((id) => ids.add(id));
  return Array.from(ids);
}

// ── Provider ───────────────────────────────────────────────────────
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterState>({
    mode: "all",
    department: null,
  });

  const setDepartmentFilter = useCallback((dept: Department | null) => {
    if (dept === null) {
      setFilter({ mode: "all", department: null });
    } else {
      setFilter((prev) =>
        prev.mode === "department" && prev.department === dept
          ? { mode: "all", department: null } // toggle off
          : { mode: "department", department: dept },
      );
    }
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({ mode: "all", department: null });
  }, []);

  const eventPassesFilter = useCallback(
    (eventId: string): boolean => {
      if (filter.mode === "all") return true;

      // Get event detail
      const detail = getEventDetail(eventId);
      if (!detail) return true; // events without details always show

      const eventPeople = getEventPeople(eventId);

      // If it's a full-team event (everyone), always show
      if (eventPeople.length >= 14) return true;

      if (filter.mode === "department" && filter.department) {
        // Check if any attendee belongs to the filtered department
        return eventPeople.some((pid) => {
          const person = people[pid];
          return person && person.department === filter.department;
        });
      }

      return true;
    },
    [filter],
  );

  const value = useMemo(
    () => ({ filter, setDepartmentFilter, clearFilter, eventPassesFilter }),
    [filter, setDepartmentFilter, clearFilter, eventPassesFilter],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilter must be inside FilterProvider");
  return ctx;
}
