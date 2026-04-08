import { EVENT_CATEGORIES, CATEGORY_COLOR, COLOR_HEX, type EventCategory } from "./schedule-data";

const font = "'Inter', sans-serif";

// Only show user-facing categories (skip END)
const LEGEND_CATEGORIES: EventCategory[] = EVENT_CATEGORIES.filter((c) => c !== "END");

export function Legend() {
  return (
    <div
      className="flex items-center gap-[16px] px-[16px] py-[8px] flex-wrap"
      style={{ backgroundColor: "#242423" }}
      role="list"
      aria-label="Category color legend"
    >
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
        Legend
      </span>
      {LEGEND_CATEGORIES.map((cat) => {
        const color = CATEGORY_COLOR[cat];
        const hex = COLOR_HEX[color];
        return (
          <div
            key={cat}
            className="flex items-center gap-[6px]"
            role="listitem"
          >
            <div
              className="rounded-[3px] shrink-0"
              style={{ width: 10, height: 10, backgroundColor: hex }}
            />
            <span
              style={{
                fontFamily: font,
                fontSize: "11px",
                fontWeight: 600,
                color: "#b0afae",
                letterSpacing: "0.3px",
              }}
            >
              {cat}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function MobileLegend() {
  return (
    <div
      className="flex items-center gap-[10px] px-[12px] py-[6px] overflow-x-auto shrink-0"
      style={{
        backgroundColor: "#242423",
        borderBottom: "1px solid #333332",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      role="list"
      aria-label="Category color legend"
    >
      {LEGEND_CATEGORIES.map((cat) => {
        const color = CATEGORY_COLOR[cat];
        const hex = COLOR_HEX[color];
        return (
          <div
            key={cat}
            className="flex items-center gap-[4px] shrink-0"
            role="listitem"
          >
            <div
              className="rounded-[2px] shrink-0"
              style={{ width: 8, height: 8, backgroundColor: hex }}
            />
            <span
              style={{
                fontFamily: font,
                fontSize: "10px",
                fontWeight: 600,
                color: "#838281",
                letterSpacing: "0.2px",
              }}
            >
              {cat}
            </span>
          </div>
        );
      })}
    </div>
  );
}
