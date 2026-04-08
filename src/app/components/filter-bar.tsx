import { useFilter } from "./filter-context";
import {
  type Department,
  DEPARTMENT_COLORS,
} from "./people-data";

// ── Tokens ─────────────────────────────────────────────────────────
const font = "'Inter', sans-serif";

// ── Filter departments ─────────────────────────────────────────────
const FILTER_DEPARTMENTS: { key: Department | "ALL"; label: string }[] = [
  { key: "ALL", label: "Full Team" },
  { key: "LEAD", label: "Leadership" },
  { key: "DES", label: "Design" },
  { key: "AM", label: "AM" },
  { key: "DEV", label: "Dev" },
];

// ── Department Pill ────────────────────────────────────────────────
function DeptPill({
  deptKey,
  label,
  isActive,
  onClick,
}: {
  deptKey: Department | "ALL";
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const color =
    deptKey === "ALL"
      ? "#c2ab74"
      : DEPARTMENT_COLORS[deptKey as Department] || "#c2ab74";

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full shrink-0 transition-all duration-200 active:scale-95"
      style={{
        minHeight: 32,
        padding: "0 14px",
        fontFamily: font,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        border: `1.5px solid ${isActive ? color : "#464544"}`,
        backgroundColor: isActive ? color + "22" : "transparent",
        color: isActive ? color : "#838281",
        cursor: "pointer",
      }}
      aria-label={`Filter by ${label}`}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── DESKTOP FILTER BAR ─────────────────────────────────────────────
// Department pills only — clean and dependable.
// ════════════════════════════════════════════════════════════════════

export function DesktopFilterBar() {
  const { filter, setDepartmentFilter, clearFilter } = useFilter();

  return (
    <div
      className="flex items-center gap-[8px] py-[12px] flex-wrap"
      style={{ borderBottom: "1px solid #333332" }}
    >
      {/* Department pills */}
      {FILTER_DEPARTMENTS.map(({ key, label }) => (
        <DeptPill
          key={key}
          deptKey={key}
          label={label}
          isActive={
            key === "ALL"
              ? filter.mode === "all"
              : filter.mode === "department" && filter.department === key
          }
          onClick={() =>
            key === "ALL" ? clearFilter() : setDepartmentFilter(key as Department)
          }
        />
      ))}

      {/* Active filter clear button */}
      {filter.mode !== "all" && (
        <button
          type="button"
          onClick={clearFilter}
          className="ml-auto flex items-center gap-[6px] rounded-full px-[12px] py-[4px] transition-all active:scale-95"
          style={{
            backgroundColor: "#2a2a29",
            border: "1px solid #464544",
            cursor: "pointer",
            fontFamily: font,
            fontSize: "11px",
            fontWeight: 600,
            color: "#c2ab74",
            letterSpacing: "0.3px",
          }}
          aria-label="Clear filter"
        >
          <span>&times;</span>
          <span>Clear Filter</span>
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── MOBILE FILTER BAR ──────────────────────────────────────────────
// Compact scrollable row of department pills.
// ════════════════════════════════════════════════════════════════════

export function MobileFilterBar() {
  const { filter, setDepartmentFilter, clearFilter } = useFilter();

  return (
    <div className="shrink-0" style={{ borderBottom: "1px solid #333332" }}>
      {/* Department pills — scrollable */}
      <div
        className="flex items-center gap-[6px] px-[12px] py-[10px] overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {FILTER_DEPARTMENTS.map(({ key, label }) => (
          <DeptPill
            key={key}
            deptKey={key}
            label={label}
            isActive={
              key === "ALL"
                ? filter.mode === "all"
                : filter.mode === "department" && filter.department === key
            }
            onClick={() =>
              key === "ALL" ? clearFilter() : setDepartmentFilter(key as Department)
            }
          />
        ))}

        {filter.mode !== "all" && (
          <button
            type="button"
            onClick={clearFilter}
            className="rounded-full shrink-0 transition-all active:scale-95"
            style={{
              minHeight: 32,
              padding: "0 12px",
              fontFamily: font,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.4px",
              border: "1.5px solid #c2ab74",
              backgroundColor: "transparent",
              color: "#c2ab74",
              cursor: "pointer",
            }}
            aria-label="Clear filter"
          >
            &times; Clear
          </button>
        )}
      </div>
    </div>
  );
}
