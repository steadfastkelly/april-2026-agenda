import { useRef, useCallback } from "react";
import { useSchedule, getAllDetails } from "./schedule-context";
import type { ScheduleEvent } from "./schedule-data";
import type { EventDetail } from "./event-details";

function ExportImportControls() {
  const { events, importState } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const details = getAllDetails();
    const data = { events, details };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
      } catch { /* ignore malformed files */ }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [importState]);

  const btnStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1.5px",
    color: "#c2ab74",
    opacity: 0.7,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textTransform: "uppercase" as const,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <button style={btnStyle} onClick={handleExport} title="Download current schedule as JSON">
        ↓ Export
      </button>
      <span style={{ color: "#3C434C", fontSize: "11px" }}>|</span>
      <button style={btnStyle} onClick={() => fileInputRef.current?.click()} title="Load a previously exported schedule JSON">
        ↑ Import
      </button>
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

export function Header() {
  return (
    <div className="flex flex-col w-full pt-[40px] pb-0 lg:pt-[60px]">
    <div className="flex gap-[23px] items-center w-full">
      <p
        className="shrink-0 text-white"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "clamp(28px, 4vw, 60px)",
          lineHeight: "normal",
          fontWeight: 700,
        }}
      >
        Team Week Agenda
      </p>

      {/* Divider */}
      <div className="flex-[1_0_0] h-[36px] min-h-px min-w-px relative flex items-center">
        {/* Horizontal fade line */}
        <div className="flex-1 h-0" style={{ borderBottom: "1px solid transparent", backgroundImage: "linear-gradient(to left, #3A4550, transparent)", backgroundSize: "100% 1px", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />
        {/* Vertical tick — always 1px */}
        <div className="shrink-0 h-full" style={{ width: "1px", backgroundColor: "#3C434C" }} />
      </div>

      <p
        className="shrink-0 text-right uppercase"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "16px",
          lineHeight: "normal",
          fontWeight: 700,
          color: "#c2ab74",
          letterSpacing: "3.2px",
        }}
      >
        APRIL 20 – 23, 2026
      </p>
    </div>

    {/* Export / Import row */}
    <div className="flex justify-end pb-[8px] pt-[6px]">
      <ExportImportControls />
    </div>
  </div>
  );
}
