import { Header } from "./components/header";
import { MobileHeader } from "./components/mobile-header";
import { ScheduleGrid } from "./components/schedule-grid";
import { MobileSchedule } from "./components/mobile-schedule";
import { ScheduleProvider, useSchedule } from "./components/schedule-context";
import { FilterProvider } from "./components/filter-context";
import { DesktopFilterBar, MobileFilterBar } from "./components/filter-bar";
import { useIsMobile } from "./components/use-is-mobile";
import { Legend, MobileLegend } from "./components/legend";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";

// ── Loading Spinner ─────────────────────────────────────────────────
function LoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-[80px] gap-[16px]">
      <Loader2 size={32} className="animate-spin" style={{ color: "#c2ab74" }} />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#838281" }}>
        Loading schedule...
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── APP CONTENT (inside providers to access context) ───────────────
// ════════════════════════════════════════════════════════════════════

function AppContent() {
  const isMobile = useIsMobile();
  const { loading } = useSchedule();

  return (
    <div
      className="min-h-screen bg-[#242423] px-[30px] md:px-[60px]"
      style={{ fontFamily: "'Inter', 'Libre Baskerville', sans-serif" }}
    >
      {/* Skip-to-content link for keyboard users */}
      <a
        href="#schedule-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-[8px] focus:left-[8px] focus:z-[9999] focus:rounded-[6px] focus:px-[16px] focus:py-[10px]"
        style={{
          backgroundColor: "#c2ab74",
          color: "#1e1e1d",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        Skip to schedule
      </a>

      {/* ── Desktop Layout ──────────────────────────────────── */}
      {!isMobile && (
        <div className="w-full max-w-[1512px] mx-auto bg-[#242423]">
          <Header />
          <DesktopFilterBar />
          <div className="flex items-center gap-0 flex-wrap" style={{ borderBottom: "1px solid #333332" }}>
            <Legend />
          </div>
          <main id="schedule-content" role="main" aria-label="Team Week Agenda">
            {loading ? <LoadingOverlay /> : <ScheduleGrid />}
          </main>
          <footer
            className="flex items-center justify-center pb-[60px] pt-[40px]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              color: "#838281",
              letterSpacing: "0.3px",
            }}
          >
            &copy; 2026 &bull; Steadfast. All rights reserved.
          </footer>
        </div>
      )}

      {/* ── Mobile Layout ───────────────────────────────────── */}
      {isMobile && (
        <div
          className="flex flex-col bg-[#242423]"
          style={{ height: "100dvh" }}
        >
          <MobileHeader />
          <MobileFilterBar />
          <MobileLegend />
          <main
            id="schedule-content"
            role="main"
            aria-label="Team Week Agenda"
            className="flex flex-col flex-1 min-h-0"
          >
            {loading ? <LoadingOverlay /> : <MobileSchedule />}
          </main>
          <footer
            className="flex items-center justify-center pb-[60px] pt-[24px] shrink-0"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 400,
              color: "#838281",
              letterSpacing: "0.3px",
            }}
          >
            &copy; 2026 &bull; Steadfast. All rights reserved.
          </footer>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────── */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#2a2a29",
            color: "#f4f4f4",
            border: "1px solid #3a3a39",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// ── MAIN APP ───────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <ScheduleProvider>
      <FilterProvider>
        <AppContent />
      </FilterProvider>
    </ScheduleProvider>
  );
}