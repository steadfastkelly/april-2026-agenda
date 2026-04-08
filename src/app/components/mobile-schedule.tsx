import {
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "../../imports/svg-trmi486z4o";
import {
  START_HOUR,
  TOTAL_HOURS,
  CARD_GAP,
  CARD_HORIZONTAL_GAP,
  TIME_LABELS,
  COLOR_HEX,
  LABEL_COLOR,
  TITLE_DARK_COLOR,
  DAY_DATE_LABELS,
  DAY_SHORT_DATE_LABELS,
  DAY_LABELS,
  computePositionedEvents,
  type PositionedEvent,
} from "./schedule-data";
import { getEventDetail } from "./schedule-context";
import { useSchedule } from "./schedule-context";
import { useFilter } from "./filter-context";
import { MobileDetailModal } from "./mobile-detail-modal";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── Mobile Layout Constants ────────────────────────────────────────
const M_HOUR_HEIGHT = 100;
const M_TIME_COL_WIDTH = 48;
const M_CARD_PADDING = 6;
const SWIPE_THRESHOLD = 50;

// ── Steadfast Logo Badge (mobile-scaled) ───────────────────────────
function LogoBadge() {
  return (
    <div className="bg-[#242423] overflow-clip relative rounded-full shrink-0 size-[20px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[8px] left-[calc(50%-0.5px)] top-1/2 w-[6px]">
        <div className="absolute inset-0">
          <svg
            className="absolute block size-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 7.32252 10.25"
          >
            <path d={svgPaths.p2991da80} fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TextBadge({ label }: { label: string }) {
  return (
    <div className="bg-[#242423] overflow-clip relative rounded-full shrink-0 size-[20px] flex items-center justify-center">
      <p
        className="not-italic text-center text-white"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "8px",
          lineHeight: 1.6,
          letterSpacing: "0.1px",
          fontWeight: 700,
        }}
      >
        {label}
      </p>
    </div>
  );
}

function Badge({ type }: { type: "logo" | "DES" | "AM" | "DEV" }) {
  if (type === "logo") return <LogoBadge />;
  return <TextBadge label={type} />;
}

// ── Mobile Team Building Content ───────────────────────────────────
function MobileTeamBuildingContent() {
  return (
    <div
      className="flex flex-col gap-[8px] items-start w-full"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        letterSpacing: "0.2px",
        color: "white",
      }}
    >
      <p style={{ lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>10:15AM</span> — Meet at Office
      </p>
      <p style={{ lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>11AM</span> — Lunch at Superica
      </p>
      <p style={{ lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>1PM</span> — Escape Rooms
      </p>
      <p style={{ lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>2:30PM</span> — Frankie's of Raleigh
      </p>
    </div>
  );
}

// ── Mobile Event Card ──────────────────────────────────────────────
function MobileEventCard({
  event,
  onTap,
  isFiltered,
}: {
  event: PositionedEvent;
  onTap: (e: PositionedEvent) => void;
  isFiltered: boolean;
}) {
  const bgHex = COLOR_HEX[event.color];
  const labelColor = LABEL_COLOR[event.color];
  const titleDarkColor = TITLE_DARK_COLOR[event.color];
  const eventLabel = event.titleDark || event.titleLight || event.title || event.category;
  const isTappable = true;

  const handleTap = useCallback(() => {
    if (isTappable) onTap(event);
  }, [event, isTappable, onTap]);

  // END category
  if (event.category === "END") {
    return (
      <div
        className="rounded-[4px] overflow-clip size-full transition-opacity duration-200"
        style={{
          backgroundColor: bgHex,
          cursor: "pointer",
          opacity: isFiltered ? 0.2 : 1,
        }}
        onClick={handleTap}
      >
        <div className="flex flex-col items-start justify-between p-[12px] size-full">
          <p
            className="not-italic w-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              lineHeight: 1.6,
              letterSpacing: "0.5px",
              color: "#f4f4f4",
              fontWeight: 700,
            }}
          >
            {event.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[4px] overflow-hidden size-full active:brightness-110 transition-all duration-200"
      style={{
        backgroundColor: bgHex,
        cursor: isTappable ? "pointer" : "default",
        opacity: isFiltered ? 0.2 : 1,
      }}
      onClick={handleTap}
      role={isTappable ? "button" : undefined}
      tabIndex={isTappable ? 0 : undefined}
      aria-label={`${eventLabel}${isTappable ? ", tap for details" : ""}`}
      onKeyDown={(e) => {
        if (isTappable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTap(event);
        }
      }}
    >
      <div className="flex flex-col items-start gap-[4px] p-[10px] size-full overflow-hidden">
        {/* Category label */}
        {!event.hideTypeLabel && (
          <p
            className="not-italic w-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              lineHeight: 1.4,
              letterSpacing: "0.5px",
              color: labelColor,
              fontWeight: 700,
            }}
          >
            {event.category}
          </p>
        )}

        {/* Title */}
        {(event.titleDark || event.titleLight || event.title) && (
          <p
            className="italic w-full overflow-hidden"
            style={{
              fontFamily: "'Libre Baskerville', 'Cambria', serif",
              fontSize: "12px",
              lineHeight: 1.3,
              letterSpacing: "0.5px",
              fontWeight: 700,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical" as const,
            }}
          >
            {event.titleDark && (
              <span style={{ color: titleDarkColor }}>
                {event.titleDark.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </span>
            )}
            {event.titleLight && (
              <span style={{ color: "white" }}>
                {event.titleLight.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </span>
            )}
            {event.title && !event.titleDark && !event.titleLight && (
              <span style={{ color: "white" }}>{event.title}</span>
            )}
          </p>
        )}

        {/* Location */}
        {event.locationLabel && (
          <p
            className="not-italic w-full overflow-hidden"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "10px",
              lineHeight: 1.3,
              letterSpacing: "0.2px",
              color: "white",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as const,
            }}
          >
            {event.locationAddress &&
              event.locationAddress.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 0 ? line : (
                    <>
                      <br />
                      {line}
                    </>
                  )}
                </span>
              ))}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Day Navigation Bar — compact with date labels ──────────────────
function DayNavBar({
  activeDay,
  onSelect,
}: {
  activeDay: number;
  onSelect: (day: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-[4px] px-[8px] py-[6px] shrink-0"
      style={{ backgroundColor: "#242423", borderBottom: "1px solid #464544" }}
    >
      <button
        type="button"
        onClick={() => onSelect(Math.max(0, activeDay - 1))}
        disabled={activeDay === 0}
        className="flex items-center justify-center shrink-0 rounded-[8px] transition-all active:scale-95"
        style={{
          width: 44,
          height: 44,
          backgroundColor: activeDay === 0 ? "transparent" : "#2a2a29",
          border: "none",
          cursor: activeDay === 0 ? "default" : "pointer",
          opacity: activeDay === 0 ? 0.3 : 1,
        }}
        aria-label="Previous day"
      >
        <ChevronLeft size={18} color="#f4f4f4" />
      </button>

      <div className="flex-1 flex items-center justify-center min-w-0">
        <p
          className="text-center truncate"
          style={{
            fontFamily: "'Libre Baskerville', 'Cambria', serif",
            fontSize: "clamp(13px, 3.5vw, 16px)",
            lineHeight: 1.4,
            letterSpacing: "0.5px",
            color: "#f4f4f4",
            fontWeight: 700,
            fontStyle: "italic",
          }}
        >
          {DAY_DATE_LABELS[activeDay]}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onSelect(Math.min(DAY_LABELS.length - 1, activeDay + 1))}
        disabled={activeDay === DAY_LABELS.length - 1}
        className="flex items-center justify-center shrink-0 rounded-[8px] transition-all active:scale-95"
        style={{
          width: 44,
          height: 44,
          backgroundColor: activeDay === DAY_LABELS.length - 1 ? "transparent" : "#2a2a29",
          border: "none",
          cursor: activeDay === DAY_LABELS.length - 1 ? "default" : "pointer",
          opacity: activeDay === DAY_LABELS.length - 1 ? 0.3 : 1,
        }}
        aria-label="Next day"
      >
        <ChevronRight size={18} color="#f4f4f4" />
      </button>
    </div>
  );
}

// ── Dot Indicators ─────────────────────────────────────────────────
function DayDots({ activeDay }: { activeDay: number }) {
  return (
    <div
      className="flex items-center justify-center gap-[8px] py-[6px] shrink-0"
      style={{ backgroundColor: "#242423" }}
    >
      {DAY_SHORT_DATE_LABELS.map((label, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === activeDay ? 8 : 6,
            height: i === activeDay ? 8 : 6,
            backgroundColor: i === activeDay ? "#c2ab74" : "#464544",
          }}
          aria-label={label}
        />
      ))}
    </div>
  );
}

// ── Single Day Grid ────────────────────────────────────────────────
function MobileDayGrid({
  dayIndex,
  positionedEvents,
  onEventTap,
  eventPassesFilter,
}: {
  dayIndex: number;
  positionedEvents: PositionedEvent[];
  onEventTap: (e: PositionedEvent) => void;
  eventPassesFilter: (id: string) => boolean;
}) {
  const dayEvents = positionedEvents.filter((e) => e.day === dayIndex);

  return (
    <div className="flex relative" style={{ width: "100%" }}>
      {/* Time column */}
      <div
        className="shrink-0 bg-[#242423]"
        style={{ width: M_TIME_COL_WIDTH }}
      >
        {TIME_LABELS.map((label, i) => {
          const isLast = i === TIME_LABELS.length - 1;
          return (
            <div
              key={label}
              className="relative"
              style={{ height: isLast ? 24 : M_HOUR_HEIGHT }}
            >
              {!isLast && (
                <div className="absolute border-[#464544] border-b border-solid inset-0 pointer-events-none" />
              )}
              <div className="flex items-start px-[6px] py-[4px] h-full">
                <p
                  className="not-italic"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "10px",
                    lineHeight: 1.4,
                    letterSpacing: "0.4px",
                    color: "#838281",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event area */}
      <div className="relative flex-1">
        {/* Hour grid lines */}
        {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
          <div
            key={i}
            className="relative"
            style={{ height: M_HOUR_HEIGHT }}
          >
            <div className="absolute border-[#464544] border-b border-l border-solid inset-0 pointer-events-none" />
          </div>
        ))}
        {/* Bottom row */}
        <div className="relative" style={{ height: 24 }}>
          <div className="absolute border-[#464544] border-l border-solid inset-0 pointer-events-none" />
        </div>

        {/* Event cards */}
        {dayEvents.map((evt, index) => {
          const availableWidth = `calc(100% - ${M_CARD_PADDING * 2}px)`;
          const top = (evt.startHour - START_HOUR) * M_HOUR_HEIGHT + CARD_GAP;
          const height =
            (evt.endHour - evt.startHour) * M_HOUR_HEIGHT - CARD_GAP * 2;

          const colFrac =
            evt.totalColumns > 1
              ? `calc((100% - ${M_CARD_PADDING * 2 + (evt.totalColumns - 1) * CARD_HORIZONTAL_GAP}px) / ${evt.totalColumns})`
              : availableWidth;
          const left =
            evt.totalColumns > 1
              ? `calc(${M_CARD_PADDING}px + ${evt.columnIndex} * (((100% - ${M_CARD_PADDING * 2 + (evt.totalColumns - 1) * CARD_HORIZONTAL_GAP}px) / ${evt.totalColumns}) + ${CARD_HORIZONTAL_GAP}px))`
              : `${M_CARD_PADDING}px`;

          return (
            <motion.div
              key={evt.id}
              className="absolute"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                top,
                height,
                left,
                width: colFrac,
                zIndex: 1,
              }}
            >
              <MobileEventCard
                event={evt}
                onTap={onEventTap}
                isFiltered={!eventPassesFilter(evt.id)}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── MOBILE SCHEDULE (Main Export) ──────────────────────────────────
// ════════════════════════════════════════════════════════════════════

export function MobileSchedule() {
  const { events, requestEdit } = useSchedule();
  const { eventPassesFilter } = useFilter();
  const [activeDay, setActiveDay] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<PositionedEvent | null>(null);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const positionedEvents = useMemo(() => {
    const allPositioned: PositionedEvent[] = [];
    for (let day = 0; day < DAY_LABELS.length; day++) {
      const dayEvts = events.filter((e) => e.day === day);
      allPositioned.push(...computePositionedEvents(dayEvts));
    }
    return allPositioned;
  }, [events]);

  const handleEventTap = useCallback((evt: PositionedEvent) => {
    setSelectedEvent(evt);
  }, []);

  const navigateDay = useCallback((newDay: number) => {
    setSlideDirection(newDay > activeDay ? 1 : -1);
    setActiveDay(newDay);
  }, [activeDay]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 10) {
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;

    if (isSwiping.current && Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0 && activeDay < 3) {
        navigateDay(activeDay + 1);
      } else if (diff < 0 && activeDay > 0) {
        navigateDay(activeDay - 1);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  }, [activeDay, navigateDay]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && activeDay > 0) {
      navigateDay(activeDay - 1);
    } else if (e.key === "ArrowRight" && activeDay < DAY_LABELS.length - 1) {
      navigateDay(activeDay + 1);
    }
  }, [activeDay, navigateDay]);

  const gridHeight = TOTAL_HOURS * M_HOUR_HEIGHT + 24;

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Day navigation bar */}
      <DayNavBar activeDay={activeDay} onSelect={navigateDay} />

      {/* Dot indicators */}
      <DayDots activeDay={activeDay} />

      {/* Single-day vertical scroll with swipe support */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain no-scrollbar"
        style={{ minHeight: 0, touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, x: slideDirection * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: slideDirection * -40 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ minHeight: gridHeight }}
          >
            <MobileDayGrid
              dayIndex={activeDay}
              positionedEvents={positionedEvents}
              onEventTap={handleEventTap}
              eventPassesFilter={eventPassesFilter}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom safe area spacer for FAB */}
        <div style={{ height: 80 }} />
      </div>

      {/* Full-screen detail modal */}
      {selectedEvent && (
        <MobileDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            const eventId = selectedEvent.id;
            setSelectedEvent(null);
            // Small delay to let the detail modal close before the edit modal opens
            setTimeout(() => requestEdit(eventId), 100);
          }}
        />
      )}
    </div>
  );
}