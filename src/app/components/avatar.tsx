// ── Unified Avatar Component ───────────────────────────────────────
// Renders department-colored initials circles. No images, no external
// assets — works identically in dev preview and Netlify production.

import { people, DEPARTMENT_COLORS, type Person } from "./people-data";

/** Stable color per person based on their department */
function bgFor(person: Person): string {
  return DEPARTMENT_COLORS[person.department] ?? "#3a3a39";
}

// ── Single Avatar ──────────────────────────────────────────────────

export function Avatar({
  person,
  size = 28,
  className = "",
  title,
}: {
  person: Person;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={`relative rounded-full shrink-0 overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgFor(person) + "33",
        border: `1.5px solid ${bgFor(person)}66`,
      }}
      title={title ?? person.name}
    >
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: `${Math.max(10, Math.round(size * 0.38))}px`,
          fontWeight: 700,
          color: bgFor(person),
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        {person.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ── Avatar Group with +N overflow ──────────────────────────────────

export function AvatarGroup({
  personIds,
  max = 6,
  size = 28,
  ringColor = "#1e1e1d",
  gap = "-space-x-1.5",
}: {
  personIds: string[];
  max?: number;
  size?: number;
  ringColor?: string;
  gap?: string;
}) {
  const resolved = personIds.map((id) => people[id]).filter(Boolean);
  const visible = resolved.slice(0, max);
  const overflow = resolved.length - max;

  return (
    <div className={`flex items-center ${gap}`}>
      {visible.map((p) => (
        <div
          key={p.id}
          className="rounded-full"
          style={{ boxShadow: `0 0 0 2px ${ringColor}` }}
        >
          <Avatar person={p} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{
            width: size,
            height: size,
            backgroundColor: "#3a3a39",
            boxShadow: `0 0 0 2px ${ringColor}`,
            fontFamily: "'Inter', sans-serif",
            fontSize: `${Math.max(9, Math.round(size * 0.36))}px`,
            fontWeight: 700,
            color: "#a0a09f",
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ── Named Avatar List (for presenter lists, etc.) ──────────────────

export function NamedAvatarList({
  personIds,
  size = 28,
}: {
  personIds: string[];
  size?: number;
}) {
  const resolved = personIds.map((id) => people[id]).filter(Boolean);

  return (
    <div className="flex flex-col gap-[8px]">
      {resolved.map((p) => (
        <div key={p.id} className="flex items-center gap-[10px]">
          <Avatar person={p} size={size} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#f4f4f4",
            }}
          >
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
