import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Pencil, Clock, MapPin, Users, User, Mic, Info } from "lucide-react";
import { type PositionedEvent, COLOR_HEX } from "./schedule-data";
import { type EventDetail } from "./event-details";
import { getEventDetail } from "./schedule-context";
import {
  people,
  DEPARTMENT_LABELS,
  DEPARTMENT_COLORS,
  type Department,
} from "./people-data";
import { AvatarGroup, NamedAvatarList } from "./avatar";

// ── Shared tokens ──────────────────────────────────────────────────
const font = "'Inter', sans-serif";
const fontSerif = "'Libre Baskerville', 'Cambria', serif";

// ── Section Label ──────────────────────────────────────────────────
function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-[6px] mb-[8px]">
      <Icon size={13} className="text-[#838281] shrink-0" />
      <span
        style={{
          fontFamily: font,
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

// ── Department Badge ───────────────────────────────────────────────
function DeptBadge({ dept }: { dept: Department }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-[10px] py-[3px]"
      style={{
        backgroundColor: DEPARTMENT_COLORS[dept] + "22",
        border: `1px solid ${DEPARTMENT_COLORS[dept]}44`,
        fontFamily: font,
        fontSize: "11px",
        fontWeight: 700,
        color: DEPARTMENT_COLORS[dept],
        letterSpacing: "0.4px",
      }}
    >
      {DEPARTMENT_LABELS[dept]}
    </span>
  );
}

// ── Divider ────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-full h-px bg-[#3a3a39]" />;
}

// ════════════════════════════════════════════════════════════════════
// ── MOBILE DETAIL MODAL ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

export function MobileDetailModal({
  event,
  onClose,
  onEdit,
}: {
  event: PositionedEvent;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const detail: EventDetail | undefined = getEventDetail(event.id);
  const accentHex = COLOR_HEX[event.color];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Focus close button on mount + Escape to close + tab trap
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const portal = closeRef.current?.closest('[role="dialog"]');
      if (!portal) return;
      const focusable = portal.querySelectorAll<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"]), a[href]'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Collect departments from attendees
  const departments = new Set<Department>();
  if (detail) {
    detail.requiredAttendees.forEach((id) => {
      const p = people[id];
      if (p) departments.add(p.department);
    });
    detail.presenters?.forEach((id) => {
      const p = people[id];
      if (p) departments.add(p.department);
    });
  }

  const eventTitle =
    event.title ||
    [event.titleDark, event.titleLight?.trim()].filter(Boolean).join(" ");

  return createPortal(
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Centered popup card */}
      <motion.div
        key="card"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${eventTitle}`}
        className="fixed z-[9999] flex flex-col"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "calc(100vw - 60px)",  /* 30px padding each side */
          maxHeight: "calc(100dvh - 60px)",
          backgroundColor: "#1e1e1d",
          border: "1px solid #3a3a39",
          borderRadius: 12,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 3, backgroundColor: accentHex, flexShrink: 0 }} />

        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: "14px 20px", borderBottom: "1px solid #3a3a39" }}
        >
          <span
            style={{
              fontFamily: font,
              fontSize: "11px",
              fontWeight: 700,
              color: accentHex,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {event.category}
          </span>

          <div className="flex items-center gap-[8px]">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-[6px] rounded-full px-[12px]"
                style={{
                  minHeight: 36,
                  backgroundColor: "#2a2a29",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Edit event"
              >
                <Pencil size={13} color="#c2ab74" />
                <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 700, color: "#c2ab74" }}>
                  Edit
                </span>
              </button>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-full transition-colors"
              style={{ width: 36, height: 36, backgroundColor: "#2a2a29", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a39"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#2a2a29"; }}
              aria-label="Close"
            >
              <X size={16} color="#f4f4f4" />
            </button>
          </div>
        </div>

        {/* Scrollable body — 30px padding */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ padding: 30 }}>
          <div className="flex flex-col gap-[20px]">

            {/* Title */}
            {eventTitle && (
              <p
                style={{
                  fontFamily: fontSerif,
                  fontSize: "18px",
                  lineHeight: 1.35,
                  letterSpacing: "0.3px",
                  fontWeight: 700,
                  color: "#f4f4f4",
                }}
              >
                {eventTitle}
              </p>
            )}

            {/* Description */}
            {(detail?.fullDescription || event.description) && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: "13px",
                  lineHeight: 1.6,
                  color: "#b0afae",
                }}
              >
                {detail?.fullDescription ?? event.description}
              </p>
            )}

            <Divider />

            {/* Time */}
            {detail?.timeLabel && (
              <div>
                <SectionLabel icon={Clock} label="Time" />
                <p style={{ fontFamily: font, fontSize: "14px", fontWeight: 600, color: "#f4f4f4" }}>
                  {detail.timeLabel}
                </p>
              </div>
            )}

            {/* Location */}
            {(detail?.location || event.locationAddress) && (
              <div>
                <SectionLabel icon={MapPin} label="Location" />
                <p style={{ fontFamily: font, fontSize: "13px", lineHeight: 1.5, color: "#f4f4f4" }}>
                  {(detail?.location ?? event.locationAddress)!.split("\n").map((line, i, arr) => (
                    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                  ))}
                </p>
                {detail?.locationNote && (
                  <p
                    className="mt-[4px]"
                    style={{ fontFamily: font, fontSize: "12px", lineHeight: 1.4, color: "#838281", fontStyle: "italic" }}
                  >
                    {detail.locationNote}
                  </p>
                )}
              </div>
            )}

            {/* More Details */}
            {detail?.moreDetails && (
              <div>
                <SectionLabel icon={Info} label="More Details" />
                <p
                  style={{
                    fontFamily: font,
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "#b0afae",
                    whiteSpace: "pre-line",
                  }}
                >
                  {detail.moreDetails}
                </p>
              </div>
            )}

            {/* Departments */}
            {departments.size > 0 && (
              <>
                <Divider />
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
            {detail?.presenters && detail.presenters.length > 0 && (
              <>
                <Divider />
                <div>
                  <SectionLabel icon={Mic} label={detail.presenters.length > 1 ? "Presenters" : "Presenter"} />
                  <NamedAvatarList personIds={detail.presenters} />
                </div>
              </>
            )}

            {/* Required attendees */}
            {detail && detail.requiredAttendees.length > 0 && (
              <>
                <Divider />
                <div>
                  <SectionLabel icon={Users} label={`Required (${detail.requiredAttendees.length})`} />
                  <AvatarGroup personIds={detail.requiredAttendees} max={10} size={32} gap="gap-[6px]" />
                </div>
              </>
            )}

            {/* Optional attendees */}
            {detail?.optionalAttendees && detail.optionalAttendees.length > 0 && (
              <div>
                <SectionLabel icon={User} label={`Optional (${detail.optionalAttendees.length})`} />
                <AvatarGroup personIds={detail.optionalAttendees} max={10} size={32} gap="gap-[6px]" />
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
