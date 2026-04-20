import { useRef, useCallback } from "react";
import { useSchedule, getAllDetails } from "./schedule-context";
import type { ScheduleEvent } from "./schedule-data";
import type { EventDetail } from "./event-details";

function MobileExportImport() {
  const { events, importState } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const details = getAllDetails();
    const blob = new Blob([JSON.stringify({ events, details }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team-week-schedule.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as {
          events: ScheduleEvent[];
          details?: Record<string, EventDetail>;
        };
        importState(data);
      } catch { /* ignore */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [importState]);

  const btnStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "1.2px",
    color: "#c2ab74",
    opacity: 0.7,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textTransform: "uppercase" as const,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
      <button style={btnStyle} onClick={handleExport}>↓ Export</button>
      <span style={{ color: "#3C434C", fontSize: "10px" }}>|</span>
      <button style={btnStyle} onClick={() => fileInputRef.current?.click()}>↑ Import</button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImport}
        style={{ display: "none" }}
      />
    </div>
  );
}

export function MobileHeader() {
  return (
    <div className="px-[16px] pt-[16px] pb-[10px] shrink-0">
      {/* Title — scales with viewport width */}
      <p
        className="text-white"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(18px, 5.5vw, 28px)",
          lineHeight: 1.2,
          fontWeight: 700,
        }}
      >
        Team Week Agenda
      </p>

      {/* Subtitle with dates */}
      <p
        className="mt-[4px]"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(10px, 2.8vw, 13px)",
          lineHeight: 1.4,
          fontWeight: 600,
          color: "#c2ab74",
          letterSpacing: "1.5px",
        }}
      >
        APRIL 20 – 24, 2026
      </p>

      <MobileExportImport />
    </div>
  );
}
