export function Header() {
  return (
    <div className="flex gap-[23px] items-center py-[40px] w-full lg:py-[60px]">
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
  );
}