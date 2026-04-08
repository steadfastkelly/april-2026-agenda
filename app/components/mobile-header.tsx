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
        APRIL 20 – 23, 2026
      </p>
    </div>
  );
}
