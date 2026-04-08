import { useState, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import svgPaths from "../../imports/svg-trmi486z4o";
import type { PositionedEvent } from "./schedule-data";
import { COLOR_HEX, LABEL_COLOR, TITLE_DARK_COLOR } from "./schedule-data";
import { DetailPanel } from "./detail-panel";
import { getEventDetail } from "./schedule-context";

// ── Panel width constant ───────────────────────────────────────────
const PANEL_WIDTH = 320;
const PANEL_GAP = 12;

// ── Steadfast Logo Badge ───────────────────────────────────────────
function LogoBadge() {
  return (
    <div className="bg-[#242423] overflow-clip relative rounded-[50px] shrink-0 size-[24px]">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[10px] left-[calc(50%-0.5px)] top-1/2 w-[7px]">
        <div className="absolute inset-[0_-3.7%_-2.5%_0]">
          <div className="absolute inset-[0_-0.44%]">
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
    </div>
  );
}

// ── Text Badge (DES, AM, DEV, etc.) ───────────────────────────────
function TextBadge({ label }: { label: string }) {
  return (
    <div className="bg-[#242423] overflow-clip relative rounded-[50px] shrink-0 size-[24px] flex items-center justify-center">
      <p
        className="not-italic text-center text-white"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
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

// ── Badge Component ────────────────────────────────────────────────
function Badge({ type }: { type: "logo" | "DES" | "AM" | "DEV" }) {
  if (type === "logo") return <LogoBadge />;
  return <TextBadge label={type} />;
}

// ── Team Building Custom Content ───────────────────────────────────
function TeamBuildingContent() {
  return (
    <div
      className="flex flex-col gap-[12px] items-start w-full"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "12px",
        letterSpacing: "0.24px",
        color: "white",
        lineHeight: 0,
      }}
    >
      <p style={{ marginBottom: "50px", lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>10:15AM:</span>
        <span style={{ color: "white" }}> </span>
        <span>Meet at Steadfast Office</span>
      </p>
      <p style={{ lineHeight: 1.3, color: "rgba(255,255,255,0.2)", marginBottom: "50px" }}>—</p>
      <p style={{ marginBottom: "50px", lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>11AM:</span>
        <span> Lunch at Superica</span>
      </p>
      <p style={{ marginBottom: "50px", lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>
          Location:
          <br />
        </span>
        <span>
          Fenton Main St., Suite 110
          <br />
          Cary, NC 27511
        </span>
      </p>
      <p style={{ lineHeight: 1.3, color: "rgba(255,255,255,0.2)", marginBottom: "50px" }}>—</p>
      <p style={{ marginBottom: "50px", lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>1PM:</span>
        <span> Breakout Rooms - Whole Brain Escape</span>
      </p>
      <p style={{ marginBottom: "50px", lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>Location:</span>
        <span>
          {" "}
          <br />
          410 Upchurch St.
          <br />
          Apex, NC 27502
        </span>
      </p>
      <p style={{ lineHeight: 1.3, color: "rgba(255,255,255,0.2)", marginBottom: "50px" }}>—</p>
      <p style={{ lineHeight: 1.3 }}>
        <span style={{ fontWeight: 700 }}>2:30PM: </span>
        <span>
          Frankie's of Raleigh
          <br />
        </span>
        <span style={{ fontWeight: 700 }}>
          Location: <br />
        </span>
        <span>
          11190 Fun Park Dr.
          <br />
          Raleigh, NC 27617
        </span>
      </p>
    </div>
  );
}

// ── Event Card ─────────────────────────────────────────────────────
export function EventCard({
  event,
  isDragging,
}: {
  event: PositionedEvent;
  panelSide?: "left" | "right";
  isDragging?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hasDetail = !!getEventDetail(event.id);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const open = useCallback(() => {
    if (!hasDetail) return;
    clearCloseTimer();
    setIsOpen(true);
  }, [hasDetail, clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    if (isPinned) return; // Don't auto-close if pinned
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setIsOpen(false), 250);
  }, [clearCloseTimer, isPinned]);

  // Click to toggle pin
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!hasDetail) return;
    e.stopPropagation(); // prevent empty cell click
    if (isPinned) {
      setIsPinned(false);
      setIsOpen(false);
    } else {
      setIsPinned(true);
      setIsOpen(true);
    }
  }, [hasDetail, isPinned]);

  // Keyboard: Escape to close, Enter/Space to toggle pin
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsPinned(false);
        cardRef.current?.blur();
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (isPinned) {
          setIsPinned(false);
          setIsOpen(false);
        } else {
          setIsPinned(true);
          setIsOpen(true);
        }
      }
    },
    [isPinned],
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Keep the panel alive when mouse moves to it
  const handlePanelMouseEnter = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const handlePanelMouseLeave = useCallback(() => {
    if (!isPinned) scheduleClose();
  }, [scheduleClose, isPinned]);

  // ── Render ────────────────────────────────────────────────────────
  const bgHex = COLOR_HEX[event.color];
  const labelColor = LABEL_COLOR[event.color];
  const titleDarkColor = TITLE_DARK_COLOR[event.color];

  const eventLabel = event.titleDark || event.titleLight || event.title || event.category;

  const cardContent = (
    <>
      {/* Category label — solid accessible color, no opacity */}
      {!event.hideTypeLabel && (
        <p
          className="not-italic w-full"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            lineHeight: 1.6,
            letterSpacing: "0.7px",
            color: labelColor,
            fontWeight: 700,
          }}
        >
          {event.category}
        </p>
      )}

      {/* Details section */}
      <div className="flex flex-col gap-[12px] items-start w-full min-w-0 overflow-hidden">
        {event.badge && (
          <div className="flex gap-[8px] items-center">
            <Badge type={event.badge} />
          </div>
        )}

        {(event.titleDark || event.titleLight) && (
          <p
            className="italic w-full overflow-hidden"
            style={{
              fontFamily: "'Libre Baskerville', 'Cambria', serif",
              fontSize: "14px",
              lineHeight: 1.3,
              letterSpacing: "0.7px",
              fontWeight: 700,
              display: "-webkit-box",
              WebkitLineClamp: 6,
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
          </p>
        )}

        {event.customContent === "teamBuilding" && <TeamBuildingContent />}

        {event.description && (
          <p
            className="not-italic w-full overflow-hidden"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              lineHeight: 1.3,
              letterSpacing: "0.24px",
              color: "white",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical" as const,
            }}
          >
            {event.description}
          </p>
        )}

        {event.locationLabel && (
          <p
            className="not-italic w-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              lineHeight: 1.3,
              letterSpacing: "0.24px",
              color: "white",
            }}
          >
            <span style={{ fontWeight: 700 }}>{event.locationLabel}</span>{" "}
            {event.locationAddress &&
              event.locationAddress.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {i === 0 ? line : <><br />{line}</>}
                </span>
              ))}
          </p>
        )}

        {event.locationNote && (
          <p
            className="not-italic w-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              lineHeight: 1.3,
              letterSpacing: "0.22px",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {event.locationNote}
          </p>
        )}
      </div>
    </>
  );

  // END category — simple card, no detail panel
  if (event.category === "END") {
    return (
      <div
        className="rounded-[4px] overflow-clip"
        style={{ backgroundColor: bgHex, width: "100%", height: "100%" }}
      >
        <div className="flex flex-col items-start justify-between p-[20px] size-full">
          <p
            className="not-italic w-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              lineHeight: 1.6,
              letterSpacing: "0.7px",
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
    <>
      <div
        ref={cardRef}
        className="relative size-full outline-none group"
        tabIndex={hasDetail ? 0 : undefined}
        role={hasDetail ? "button" : undefined}
        aria-label={`${eventLabel}${hasDetail ? ", click to pin details" : ""}`}
        aria-expanded={hasDetail ? isOpen : undefined}
        aria-haspopup={hasDetail ? "dialog" : undefined}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={scheduleClose}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        {/* Card surface */}
        <div
          className="rounded-[4px] overflow-hidden size-full transition-all duration-200"
          style={{
            backgroundColor: bgHex,
            boxShadow: isDragging
              ? `0 12px 32px rgba(0,0,0,0.45)`
              : isPinned
                ? `0 0 0 2px #c2ab74, 0 8px 24px rgba(0,0,0,0.35)`
                : isOpen
                  ? `0 0 0 2px ${bgHex}, 0 8px 24px rgba(0,0,0,0.35)`
                  : "none",
            transform: isDragging ? "scale(1.03)" : undefined,
            opacity: isDragging ? 0.9 : 1,
          }}
        >
          <div className="flex flex-col items-start justify-between p-[20px] size-full">
            {cardContent}
          </div>
        </div>

        {/* Focus ring for keyboard navigation */}
        {hasDetail && (
          <div
            className="absolute inset-0 rounded-[4px] pointer-events-none opacity-0 group-focus-visible:opacity-100 transition-opacity duration-150"
            style={{
              boxShadow: `0 0 0 2px ${bgHex}, 0 0 0 4px #f4f4f4`,
            }}
          />
        )}
      </div>

      {/* Portal-rendered floating detail panel */}
      {isOpen && hasDetail && (
        <PortalPanelWrapper
          event={event}
          anchorRef={cardRef}
          onMouseEnter={handlePanelMouseEnter}
          onMouseLeave={handlePanelMouseLeave}
        />
      )}
    </>
  );
}

// ── Portal Panel Wrapper ───────────────────────────────────────────
// Renders the detail panel as a fixed-position portal on document.body
// so it escapes the scroll container's overflow clipping.
function PortalPanelWrapper({
  event,
  anchorRef,
  onMouseEnter,
  onMouseLeave,
}: {
  event: PositionedEvent;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Use a callback ref pattern: compute position once after first paint,
  // then apply via direct DOM mutation to avoid re-render loops.
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const compute = () => {
      const rect = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const panelH = panel.offsetHeight || 400;

      // Horizontal: prefer right, flip left if needed
      let left = rect.right + PANEL_GAP;
      if (left + PANEL_WIDTH > vw - 16) {
        left = rect.left - PANEL_WIDTH - PANEL_GAP;
      }
      left = Math.max(8, Math.min(left, vw - PANEL_WIDTH - 8));

      // Vertical: align with card top, clamp to viewport
      let top = rect.top;
      if (top + panelH > vh - 16) {
        top = vh - panelH - 16;
      }
      top = Math.max(8, top);

      // Apply directly to DOM — no setState, no re-render
      panel.style.top = `${top}px`;
      panel.style.left = `${left}px`;
      panel.style.opacity = "1";
    };

    // Compute on next frame so the panel has measured its height
    const raf = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: PANEL_WIDTH,
        opacity: 0,
        zIndex: 9999,
        pointerEvents: "auto",
        transition: "opacity 180ms ease-out",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="dialog"
      aria-label={`Details for ${event.titleDark || event.titleLight || event.title || event.category}`}
    >
      <DetailPanel event={event} />
    </div>,
    document.body,
  );
}