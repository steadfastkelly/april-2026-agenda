import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useTransform } from "motion/react";
import { X, Pencil, Clock, MapPin, Users, User, Mic } from "lucide-react";
import { type PositionedEvent, COLOR_HEX } from "./schedule-data";
import { type EventDetail } from "./event-details";
import { getEventDetail } from "./schedule-context";
import {
  people,
  DEPARTMENT_LABELS,
  DEPARTMENT_COLORS,
  type Department,
} from "./people-data";
import { Avatar, AvatarGroup, NamedAvatarList } from "./avatar";

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
      <Icon size={14} className="text-[#838281] shrink-0" />
      <span
        style={{
          fontFamily: font,
          fontSize: "11px",
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
  const [isDismissing, setIsDismissing] = useState(false);

  // Swipe-to-dismiss state
  const dragY = useMotionValue(0);
  const modalOpacity = useTransform(dragY, [0, 300], [1, 0.3]);
  const modalScale = useTransform(dragY, [0, 300], [1, 0.92]);
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);

  const DISMISS_THRESHOLD = 120;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Focus close button on mount
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Back button / Escape + Tab trap
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const tabTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // Find the portal container (the motion.div)
      const portal = closeRef.current?.closest('[role="dialog"]');
      if (!portal) return;
      const focusable = portal.querySelectorAll<HTMLElement>(
        'button, [tabindex]:not([tabindex="-1"]), a[href]'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    document.addEventListener("keydown", tabTrap);
    return () => {
      document.removeEventListener("keydown", handler);
      document.removeEventListener("keydown", tabTrap);
    };
  }, [onClose]);

  // Collect departments
  const departments = new Set<Department>();
  if (detail) {
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
  }

  const eventTitle =
    event.title ||
    [event.titleDark, event.titleLight?.trim()].filter(Boolean).join(" ");

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ opacity: backdropOpacity }}
        className="fixed inset-0 z-[9998] bg-black/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: isDismissing ? 0 : 1, y: isDismissing ? "100%" : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col"
        style={{
          backgroundColor: "#1e1e1d",
          y: dragY,
          opacity: modalOpacity,
          scale: modalScale,
          borderRadius: dragY.get() > 0 ? 16 : 0,
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
            setIsDismissing(true);
            setTimeout(onClose, 250);
          } else {
            dragY.set(0);
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${eventTitle}`}
      >
        {/* Swipe handle indicator */}
        <div className="flex justify-center pt-[8px] pb-[4px] shrink-0 cursor-grab active:cursor-grabbing">
          <div
            className="rounded-full"
            style={{ width: 36, height: 4, backgroundColor: "#464544" }}
          />
        </div>

        {/* Accent bar */}
        <div style={{ height: 4, backgroundColor: accentHex, flexShrink: 0 }} />

        {/* Header bar */}
        <div
          className="flex items-center justify-between px-[16px] py-[12px] shrink-0"
          style={{ borderBottom: "1px solid #3a3a39" }}
        >
          {/* Category label — left-aligned */}
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

          {/* Right side: Edit + Close */}
          <div className="flex items-center gap-[8px]">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-[6px] rounded-full px-[14px]"
                style={{
                  minHeight: 44,
                  backgroundColor: "#2a2a29",
                  border: "none",
                  cursor: "pointer",
                }}
                aria-label="Edit event"
              >
                <Pencil size={14} color="#c2ab74" />
                <span
                  style={{
                    fontFamily: font,
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#c2ab74",
                  }}
                >
                  Edit
                </span>
              </button>
            )}

            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                backgroundColor: "#2a2a29",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              <X size={18} color="#f4f4f4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-[20px] py-[24px] flex flex-col gap-[20px]">
            {/* Title */}
            <div>
              {eventTitle && (
                <p
                  style={{
                    fontFamily: fontSerif,
                    fontSize: "20px",
                    lineHeight: 1.3,
                    letterSpacing: "0.3px",
                    fontWeight: 700,
                    color: "#f4f4f4",
                  }}
                >
                  {eventTitle}
                </p>
              )}
            </div>

            {/* Description */}
            {detail && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#b0afae",
                }}
              >
                {detail.fullDescription}
              </p>
            )}

            {/* Fallback for events without detail */}
            {!detail && event.description && (
              <p
                style={{
                  fontFamily: font,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#b0afae",
                }}
              >
                {event.description}
              </p>
            )}

            <Divider />

            {/* Time */}
            {detail && (
              <div>
                <SectionLabel icon={Clock} label="Time" />
                <p
                  style={{
                    fontFamily: font,
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#f4f4f4",
                  }}
                >
                  {detail.timeLabel}
                </p>
              </div>
            )}

            {/* Location */}
            {detail?.location && (
              <div>
                <SectionLabel icon={MapPin} label="Location" />
                <p
                  style={{
                    fontFamily: font,
                    fontSize: "14px",
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
                    className="mt-[6px]"
                    style={{
                      fontFamily: font,
                      fontSize: "12px",
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

            {/* Location fallback from event data */}
            {!detail?.location && event.locationAddress && (
              <div>
                <SectionLabel icon={MapPin} label="Location" />
                <p
                  style={{
                    fontFamily: font,
                    fontSize: "14px",
                    lineHeight: 1.5,
                    color: "#f4f4f4",
                  }}
                >
                  {event.locationAddress.split("\n").map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
            )}

            {/* Departments */}
            {departments.size > 0 && (
              <>
                <Divider />
                <div>
                  <SectionLabel icon={Users} label="Departments" />
                  <div className="flex flex-wrap gap-[8px]">
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
                  <SectionLabel
                    icon={Mic}
                    label={
                      detail.presenters.length > 1 ? "Presenters" : "Presenter"
                    }
                  />
                  <NamedAvatarList personIds={detail.presenters} />
                </div>
              </>
            )}

            {/* Required */}
            {detail && detail.requiredAttendees.length > 0 && (
              <>
                <Divider />
                <div>
                  <SectionLabel
                    icon={Users}
                    label={`Required (${detail.requiredAttendees.length})`}
                  />
                  <AvatarGroup
                    personIds={detail.requiredAttendees}
                    max={10}
                    size={32}
                    gap="gap-[6px]"
                  />
                </div>
              </>
            )}

            {/* Optional */}
            {detail?.optionalAttendees && detail.optionalAttendees.length > 0 && (
              <div>
                <SectionLabel
                  icon={User}
                  label={`Optional (${detail.optionalAttendees.length})`}
                />
                <AvatarGroup
                  personIds={detail.optionalAttendees}
                  max={10}
                  size={32}
                  gap="gap-[6px]"
                />
              </div>
            )}

            {/* Bottom spacer for safe area */}
            <div style={{ height: 40 }} />
          </div>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}