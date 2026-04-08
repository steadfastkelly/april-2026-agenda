import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  HOUR_HEIGHT,
  TOTAL_HOURS,
  START_HOUR,
  DAY_LABELS,
  TIME_COLUMN_WIDTH,
  COLUMN_HEADER_HEIGHT,
  CARD_HORIZONTAL_GAP,
  TIME_LABELS,
  computePositionedEvents,
  type PositionedEvent,
} from "./schedule-data";
import { EventCard } from "./event-card";
import { useSchedule } from "./schedule-context";
import { useFilter } from "./filter-context";
import { Plus } from "lucide-react";

// ── Responsive breakpoint ──────────────────────────────────────────
const TABLET_BREAKPOINT = 1028;

function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < TABLET_BREAKPOINT;
  });
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mql.addEventListener("change", handler);
    setIsTablet(mql.matches);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isTablet;
}

// ── DnD item type ──────────────────────────────────────────────────
const CARD_TYPE = "EVENT_CARD";
interface DragItem {
  id: string;
  day: number;
  startHour: number;
  endHour: number;
}

// ── Snap constants ─────────────────────────────────────────────────
const SNAP_MINUTES = 15;
const SNAP_PX = HOUR_HEIGHT * (SNAP_MINUTES / 60); // 37.5px

function snapToGrid(pxY: number): number {
  return Math.round(pxY / SNAP_PX) * SNAP_PX;
}

function pxToHour(pxY: number): number {
  const snapped = snapToGrid(pxY);
  return START_HOUR + snapped / HOUR_HEIGHT;
}

// ── Helper: format hour to readable time ───────────────────────────
function formatHour(h: number): string {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? "PM" : "AM";
  return min > 0 ? `${hour12}:${min.toString().padStart(2, "0")} ${ampm}` : `${hour12} ${ampm}`;
}

// ── Horizontal grid tick on time label ─────────────────────────────
function TimeTick() {
  return (
    <div className="flex flex-col h-full items-end justify-center shrink-0 w-[12px]">
      <div className="h-0 shrink-0 w-[12px] relative">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 1">
            <path d="M12 0.5H0" stroke="#464544" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Column Header Row (sticky) ─────────────────────────────────────
function ColumnHeaderRow({ isTablet }: { isTablet: boolean }) {
  // On tablet, each column is half the visible area (minus time column); on desktop, flex: 1
  const dayStyle: React.CSSProperties = isTablet
    ? { flex: "0 0 auto", width: `calc((100vw - ${TIME_COLUMN_WIDTH}px - var(--site-pad, 120px)) / 2)` }
    : { flex: "1 1 0%" };

  return (
    <div
      className="flex sticky top-0 z-30 bg-[#242423]"
      style={{ height: COLUMN_HEADER_HEIGHT }}
    >
      <div
        className="shrink-0 sticky left-0 z-40 bg-[#242423] relative"
        style={{ width: TIME_COLUMN_WIDTH }}
      >
        <div className="absolute border-[#464544] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex items-center px-[16px] py-[6px] size-full">
          <p
            className="italic"
            style={{
              fontFamily: "'Libre Baskerville', 'Cambria', serif",
              fontSize: "16px",
              lineHeight: 1.6,
              letterSpacing: "0.8px",
              color: "#838281",
              fontWeight: 700,
            }}
          >
            Time
          </p>
        </div>
      </div>

      {DAY_LABELS.map((label) => (
        <div
          key={label}
          className="relative"
          style={dayStyle}
        >
          <div className="absolute border-[#464544] border-b border-l border-solid inset-0 pointer-events-none" />
          <div className="flex items-center px-[16px] py-[6px] size-full">
            <p
              className="italic"
              style={{
                fontFamily: "'Libre Baskerville', 'Cambria', serif",
                fontSize: "16px",
                lineHeight: 1.6,
                letterSpacing: "0.8px",
                color: "#838281",
                fontWeight: 700,
              }}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Time Column Body ───────────────────────────────────────────────
function TimeColumnBody() {
  return (
    <div
      className="shrink-0 sticky left-0 z-20 bg-[#242423]"
      style={{ width: TIME_COLUMN_WIDTH }}
    >
      {TIME_LABELS.map((label, i) => {
        const isLast = i === TIME_LABELS.length - 1;
        return (
          <div
            key={label}
            className="relative"
            style={{ height: isLast ? 32 : HOUR_HEIGHT }}
          >
            {!isLast && (
              <div className="absolute border-[#464544] border-b border-solid inset-0 pointer-events-none" />
            )}
            <div className="flex gap-[10px] items-start pl-[16px] py-[6px] h-full">
              <p
                className="flex-1 not-italic"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  letterSpacing: "0.8px",
                  color: "#f4f4f4",
                  fontWeight: 700,
                }}
              >
                {label}
              </p>
              {!isLast && <TimeTick />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Shared Grid Lines ──────────────────────────────────────────────
function DayGridLines() {
  return (
    <>
      {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
        <div key={i} className="relative" style={{ height: HOUR_HEIGHT }}>
          <div className="absolute border-[#464544] border-b border-l border-solid inset-0 pointer-events-none" />
        </div>
      ))}
      <div className="relative" style={{ height: 32 }}>
        <div className="absolute border-[#464544] border-l border-solid inset-0 pointer-events-none" />
      </div>
    </>
  );
}

// ── Draggable Card Wrapper ─────────────────────────────────────────
function DraggableCardWrapper({
  evt,
  hoveredId,
  onHover,
  panelSide,
  isFiltered,
  staggerIndex,
}: {
  evt: PositionedEvent;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  panelSide: "left" | "right";
  isFiltered: boolean;
  staggerIndex: number;
}) {
  const isHovered = hoveredId === evt.id;
  const nodeRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: CARD_TYPE,
      item: (): DragItem => ({
        id: evt.id,
        day: evt.day,
        startHour: evt.startHour,
        endHour: evt.endHour,
      }),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [evt.id, evt.day, evt.startHour, evt.endHour],
  );

  // Merge the drag connector with our local ref
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (nodeRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      dragRef(node);
    },
    [dragRef],
  );

  // Percentage-based positioning within the column
  const padding = 8; // px each side
  const gapCount = evt.totalColumns > 1 ? evt.totalColumns - 1 : 0;
  const totalGap = gapCount * CARD_HORIZONTAL_GAP;

  // Width: (100% - 2*padding - totalGaps) / totalColumns
  const widthCalc =
    evt.totalColumns > 1
      ? `calc((100% - ${2 * padding + totalGap}px) / ${evt.totalColumns})`
      : `calc(100% - ${2 * padding}px)`;

  // Left: padding + colIndex * ((100% - 2*padding - totalGaps) / totalColumns + gap)
  const colWidth = `(100% - ${2 * padding + totalGap}px) / ${evt.totalColumns}`;
  const leftCalc =
    evt.columnIndex > 0
      ? `calc(${padding}px + ${evt.columnIndex} * (${colWidth} + ${CARD_HORIZONTAL_GAP}px))`
      : `${padding}px`;

  return (
    <div
      ref={mergedRef}
      className="absolute"
      data-event-card
      data-event-id={evt.id}
      style={{
        top: evt.top,
        height: evt.height,
        left: leftCalc,
        width: widthCalc,
        zIndex: isDragging ? 60 : isHovered ? 40 : 1,
        cursor: "grab",
      }}
      onMouseEnter={() => !isDragging && onHover(evt.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => !isDragging && onHover(evt.id)}
      onBlur={() => onHover(null)}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{
          opacity: isDragging ? 0.4 : isFiltered ? 0.2 : 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
          opacity: { duration: 0.35, delay: staggerIndex * 0.06 },
          scale: { duration: 0.35, delay: staggerIndex * 0.06, ease: [0.25, 0.1, 0.25, 1] },
          y: { duration: 0.35, delay: staggerIndex * 0.06, ease: [0.25, 0.1, 0.25, 1] },
        }}
        className="size-full"
        whileHover={!isDragging ? {
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          y: -1,
        } : undefined}
      >
        <EventCard event={evt} panelSide={panelSide} isDragging={isDragging} />
      </motion.div>
    </div>
  );
}

// ── Drop Zone (covers a single day column) ─────────────────────────
function DayDropZone({
  dayIndex,
  onDrop,
  onEmptyCellClick,
  isTablet,
  children,
}: {
  dayIndex: number;
  onDrop: (item: DragItem, newDay: number, newStartHour: number) => void;
  onEmptyCellClick: (day: number, startHour: number) => void;
  isTablet: boolean;
  children: React.ReactNode;
}) {
  const colRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: CARD_TYPE,
      drop: (item: DragItem, monitor) => {
        const col = colRef.current;
        if (!col) return;

        const offset = monitor.getSourceClientOffset();
        if (!offset) return;

        const colRect = col.getBoundingClientRect();
        const relativeY = offset.y - colRect.top;
        const newStartHour = pxToHour(Math.max(0, relativeY));
        const clampedStart = Math.max(START_HOUR, Math.min(newStartHour, 21 - (item.endHour - item.startHour)));

        onDrop(item, dayIndex, clampedStart);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [dayIndex, onDrop],
  );

  // Merge refs
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      (colRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      dropRef(node);
    },
    [dropRef],
  );

  // Handle click on empty area
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger on direct clicks on the drop zone (not on cards)
      const target = e.target as HTMLElement;
      if (target.closest("[data-event-card]")) return;
      const col = colRef.current;
      if (!col) return;
      const rect = col.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const hour = pxToHour(Math.max(0, relativeY));
      const clampedHour = Math.max(START_HOUR, Math.min(hour, 20)); // leave room for 1h block
      onEmptyCellClick(dayIndex, clampedHour);
    },
    [dayIndex, onEmptyCellClick],
  );

  // On tablet, each column is half the visible area; on desktop, flex to fill
  const dayStyle: React.CSSProperties = isTablet
    ? { flex: "0 0 auto", width: `calc((100vw - ${TIME_COLUMN_WIDTH}px - var(--site-pad, 120px)) / 2)` }
    : { flex: "1 1 0%" };

  return (
    <div
      ref={mergedRef}
      className="relative transition-colors duration-150 cursor-pointer"
      style={{
        ...dayStyle,
        backgroundColor: isOver ? "rgba(194,171,116,0.04)" : "transparent",
      }}
      onClick={handleClick}
      title="Click to add a time block"
    >
      {children}

      {/* Snap guide overlay when dragging over */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none z-[5]">
          {Array.from({ length: TOTAL_HOURS * 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0"
              style={{
                top: i * SNAP_PX,
                height: 1,
                backgroundColor: i % 4 === 0 ? "rgba(194,171,116,0.15)" : "rgba(194,171,116,0.06)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Day Column Body ────────────────────────────────────────────────
function DayColumnBody({
  dayIndex,
  positionedEvents,
  hoveredId,
  onHover,
  onDrop,
  eventPassesFilter,
  onEmptyCellClick,
  isTablet,
}: {
  dayIndex: number;
  positionedEvents: PositionedEvent[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onDrop: (item: DragItem, newDay: number, newStartHour: number) => void;
  eventPassesFilter: (id: string) => boolean;
  onEmptyCellClick: (day: number, startHour: number) => void;
  isTablet: boolean;
}) {
  const dayEvents = positionedEvents.filter((e) => e.day === dayIndex);
  const panelSide: "left" | "right" = dayIndex >= 3 ? "left" : "right";

  return (
    <DayDropZone dayIndex={dayIndex} onDrop={onDrop} onEmptyCellClick={onEmptyCellClick} isTablet={isTablet}>
      <DayGridLines />

      {/* Empty day hint */}
      {dayEvents.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
          style={{ top: HOUR_HEIGHT * 2 }}
        >
          <div className="flex flex-col items-center gap-[8px] opacity-30">
            <Plus size={24} color="#c2ab74" />
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                color: "#c2ab74",
                letterSpacing: "0.3px",
                textAlign: "center",
              }}
            >
              Click to add
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {dayEvents.map((evt, index) => (
          <DraggableCardWrapper
            key={evt.id}
            evt={evt}
            hoveredId={hoveredId}
            onHover={onHover}
            panelSide={panelSide}
            isFiltered={!eventPassesFilter(evt.id)}
            staggerIndex={index}
          />
        ))}
      </AnimatePresence>
    </DayDropZone>
  );
}

// ── Main Schedule Grid ─────────────────────────────────────────────
export function ScheduleGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState("");
  const { events, updateEvent, setPrefill } = useSchedule();
  const { eventPassesFilter: checkFilter } = useFilter();
  const gridRef = useRef<HTMLDivElement>(null);
  const isTablet = useIsTablet();

  const positionedEvents = useMemo(() => {
    const allPositioned: PositionedEvent[] = [];
    for (let day = 0; day < 4; day++) {
      const dayEvts = events.filter((e) => e.day === day);
      allPositioned.push(...computePositionedEvents(dayEvts));
    }
    return allPositioned;
  }, [events]);

  // ── Keyboard arrow navigation between event cards ────────────────
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;

      const activeEl = document.activeElement as HTMLElement;
      const activeCard = activeEl?.closest("[data-event-id]") as HTMLElement | null;
      if (!activeCard) return;

      const activeId = activeCard.getAttribute("data-event-id");
      const activeEvent = positionedEvents.find((ev) => ev.id === activeId);
      if (!activeEvent) return;

      e.preventDefault();

      let targetEvent: PositionedEvent | undefined;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        // Navigate within the same day column, ordered by startHour
        const sameDayEvents = positionedEvents
          .filter((ev) => ev.day === activeEvent.day)
          .sort((a, b) => a.startHour - b.startHour);
        const currentIdx = sameDayEvents.findIndex((ev) => ev.id === activeId);
        if (e.key === "ArrowDown" && currentIdx < sameDayEvents.length - 1) {
          targetEvent = sameDayEvents[currentIdx + 1];
        } else if (e.key === "ArrowUp" && currentIdx > 0) {
          targetEvent = sameDayEvents[currentIdx - 1];
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // Navigate to the closest event in the adjacent day column
        const targetDay = e.key === "ArrowRight"
          ? Math.min(activeEvent.day + 1, 3)
          : Math.max(activeEvent.day - 1, 0);
        if (targetDay === activeEvent.day) return;
        const targetDayEvents = positionedEvents
          .filter((ev) => ev.day === targetDay)
          .sort((a, b) =>
            Math.abs(a.startHour - activeEvent.startHour) -
            Math.abs(b.startHour - activeEvent.startHour)
          );
        targetEvent = targetDayEvents[0];
      }

      if (targetEvent) {
        const targetEl = gridRef.current?.querySelector(
          `[data-event-id="${targetEvent.id}"]`
        ) as HTMLElement | null;
        // Focus the interactive element inside the card (the card's button/div with tabIndex)
        const focusable = targetEl?.querySelector("[tabindex], button, [role='button']") as HTMLElement | null;
        (focusable || targetEl)?.focus();
        setLiveMessage(
          `${targetEvent.titleDark || targetEvent.titleLight || targetEvent.title || targetEvent.category} on ${DAY_LABELS[targetEvent.day]}`
        );
      }
    },
    [positionedEvents],
  );

  const handleDrop = useCallback(
    (item: DragItem, newDay: number, newStartHour: number) => {
      const duration = item.endHour - item.startHour;
      const clampedEnd = Math.min(newStartHour + duration, 21);
      updateEvent(item.id, {
        day: newDay,
        startHour: newStartHour,
        endHour: clampedEnd,
      });
      setLiveMessage(
        `Moved event to ${DAY_LABELS[newDay]} at ${formatHour(newStartHour)}`
      );
    },
    [updateEvent],
  );

  const handleEmptyCellClick = useCallback(
    (day: number, startHour: number) => {
      setPrefill({ day, startHour });
    },
    [setPrefill],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      {/* Screen reader announcements for drag-and-drop */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>
      <div
        ref={gridRef}
        className="overflow-x-auto max-w-full no-scrollbar"
        role="grid"
        aria-label="Team Week schedule grid"
        onKeyDown={handleGridKeyDown}
      >
        {/* Inner wrapper expands to fit content so sticky + scroll work on tablet */}
        <div style={{ minWidth: "100%", width: isTablet ? "max-content" : "100%" }}>
          <ColumnHeaderRow isTablet={isTablet} />
          <div className="flex">
            <TimeColumnBody />
            {DAY_LABELS.map((_, day) => (
              <DayColumnBody
                key={day}
                dayIndex={day}
                positionedEvents={positionedEvents}
                hoveredId={hoveredId}
                onHover={setHoveredId}
                onDrop={handleDrop}
                eventPassesFilter={checkFilter}
                onEmptyCellClick={handleEmptyCellClick}
                isTablet={isTablet}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}