import { type PositionedEvent, COLOR_HEX } from "./schedule-data";
import { type EventDetail } from "./event-details";
import { getEventDetail, useSchedule } from "./schedule-context";
import { people, DEPARTMENT_LABELS, DEPARTMENT_COLORS, type Department } from "./people-data";
import { Clock, MapPin, Users, User, Mic, Pencil, X } from "lucide-react";
import { Avatar, AvatarGroup } from "./avatar";

// ── Name List (for small groups / optional attendees) ──────────────
function NameList({ personIds }: { personIds: string[] }) {
  const resolved = personIds.map((id) => people[id]).filter(Boolean);
  if (resolved.length === 0) return null;
  return (
    <span style={{ color: "#b0afae" }}>
      {resolved.map((p) => p.name).join(", ")}
    </span>
  );
}

// ── Department Badge ──────────────────────────────────────────────
function DeptBadge({ dept }: { dept: Department }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-[8px] py-[2px]"
      style={{
        backgroundColor: DEPARTMENT_COLORS[dept] + "22",
        border: `1px solid ${DEPARTMENT_COLORS[dept]}44`,
        fontFamily: "'Inter', sans-serif",
        fontSize: "10px",
        fontWeight: 700,
        color: DEPARTMENT_COLORS[dept],
        letterSpacing: "0.4px",
      }}
    >
      {DEPARTMENT_LABELS[dept]}
    </span>
  );
}

// ── Section Label ──────────────────────────────────────────────────
function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-[6px] mb-[6px]">
      <Icon size={12} className="text-[#838281] shrink-0" />
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 700,
          color: "#838281",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────
function PanelDivider() {
  return <div className="w-full h-px bg-[#3a3a39]" />;
}

// ── Main Detail Panel ──────────────────────────────────────────────
export function DetailPanel({ event, onClose }: { event: PositionedEvent; onClose?: () => void }) {
  const detail: EventDetail | undefined = getEventDetail(event.id);
  const { requestEdit } = useSchedule();
  if (!detail) return null;

  const colorToken = event.color;
  const accentHex = COLOR_HEX[colorToken];

  // Collect unique departments from required attendees
  const departments = new Set<Department>();
  detail.requiredAttendees.forEach((id) => {
    const p = people[id];
    if (p) departments.add(p.department);
  });
  if (detail.presenters) {
    detail.presenters.forEach((id) => {
      const p = people[id];
      if (p) departments.add(p.department);
    });
  }

  return (
    <div
      className="rounded-[8px] overflow-hidden"
      style={{
        width: 320,
        backgroundColor: "#1e1e1d",
        border: `1px solid #3a3a39`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 3, backgroundColor: accentHex }} />

      <div className="p-[20px] flex flex-col gap-[16px]">
        {/* Category + Title row with close button */}
        <div className="flex items-start justify-between gap-[8px]">
          <div className="flex-1 min-w-0">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              color: accentHex,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {event.category}
          </span>
          {(event.titleDark || event.titleLight || event.title) && (
            <p
              className="mt-[4px]"
              style={{
                fontFamily: "'Libre Baskerville', 'Cambria', serif",
                fontSize: "14px",
                lineHeight: 1.4,
                letterSpacing: "0.3px",
                fontWeight: 700,
                color: "#f4f4f4",
              }}
            >
              {event.title || ""}
              {event.titleDark || ""}
              {event.titleLight ? ` ${event.titleLight.trim()}` : ""}
            </p>
          )}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex items-center justify-center rounded-[6px] shrink-0 transition-colors"
              style={{ width: 28, height: 28, backgroundColor: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a39"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              aria-label="Close"
            >
              <X size={14} color="#838281" />
            </button>
          )}
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#b0afae",
            wordBreak: "break-word" as const,
            overflowWrap: "break-word" as const,
          }}
        >
          {detail.fullDescription}
        </p>

        {/* Edit button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); requestEdit(event.id); }}
          className="flex items-center gap-[6px] rounded-[6px] px-[12px] py-[6px] transition-colors self-start"
          style={{
            backgroundColor: "#2a2a29",
            border: "1px solid #3a3a39",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            color: "#c2ab74",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a39"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a29"; }}
        >
          <Pencil size={12} />
          Edit
        </button>

        <PanelDivider />

        {/* Time Range */}
        <div>
          <SectionLabel icon={Clock} label="Time" />
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#f4f4f4",
            }}
          >
            {detail.timeLabel}
          </p>
        </div>

        {/* Location */}
        {detail.location && (
          <div>
            <SectionLabel icon={MapPin} label="Location" />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#f4f4f4",
              }}
            >
              {detail.location.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
            {detail.locationNote && (
              <p
                className="mt-[4px]"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  lineHeight: 1.4,
                  color: "#838281",
                  fontStyle: "italic",
                }}
              >
                {detail.locationNote}
              </p>
            )}
          </div>
        )}

        {/* Department badges */}
        {departments.size > 0 && (
          <>
            <PanelDivider />
            <div>
              <SectionLabel icon={Users} label="Departments" />
              <div className="flex flex-wrap gap-[6px]">
                {Array.from(departments).map((dept) => (
                  <DeptBadge key={dept} dept={dept} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Presenters */}
        {detail.presenters && detail.presenters.length > 0 && (
          <>
            <PanelDivider />
            <div>
              <SectionLabel icon={Mic} label={detail.presenters.length > 1 ? "Presenters" : "Presenter"} />
              <div className="flex items-center gap-[8px]">
                <AvatarGroup personIds={detail.presenters} max={4} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "12px",
                    color: "#f4f4f4",
                  }}
                >
                  {detail.presenters
                    .map((id) => people[id]?.name)
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Required Attendees */}
        {detail.requiredAttendees.length > 0 && (
          <>
            <PanelDivider />
            <div>
              <SectionLabel icon={Users} label={`Required (${detail.requiredAttendees.length})`} />
              <AvatarGroup personIds={detail.requiredAttendees} max={8} />
            </div>
          </>
        )}

        {/* Optional Attendees */}
        {detail.optionalAttendees && detail.optionalAttendees.length > 0 && (
          <div>
            <SectionLabel icon={User} label={`Optional (${detail.optionalAttendees.length})`} />
            {detail.optionalAttendees.length <= 5 ? (
              <AvatarGroup personIds={detail.optionalAttendees} max={5} />
            ) : (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#b0afae",
                }}
              >
                <NameList personIds={detail.optionalAttendees} />
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}