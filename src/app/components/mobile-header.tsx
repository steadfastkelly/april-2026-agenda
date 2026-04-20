import { useState, useCallback } from "react";
import { useSchedule } from "./schedule-context";

type PublishState = "idle" | "publishing" | "success" | "error";

function MobilePublishButton() {
  const { publish } = useSchedule();
  const [state, setState] = useState<PublishState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePublish = useCallback(async () => {
    if (state === "publishing") return;
    setState("publishing");
    setErrorMsg("");

    const result = await publish();

    if (result.ok) {
      setState("success");
      setTimeout(() => setState("idle"), 3000);
    } else {
      setState("error");
      setErrorMsg(result.error ?? "Publish failed");
      setTimeout(() => setState("idle"), 4000);
    }
  }, [publish, state]);

  const label =
    state === "publishing" ? "Publishing…" :
    state === "success"    ? "✓ Saved — refresh to see" :
    state === "error"      ? "✗ Failed" :
    "↑ Publish";

  const color =
    state === "success" ? "#7ec87e" :
    state === "error"   ? "#e07070" :
    "#c2ab74";

  return (
    <div style={{ marginTop: "6px" }}>
      <button
        onClick={handlePublish}
        disabled={state === "publishing"}
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          color,
          opacity: state === "publishing" ? 0.5 : 0.85,
          background: "none",
          border: "none",
          cursor: state === "publishing" ? "default" : "pointer",
          padding: 0,
          transition: "color 0.2s, opacity 0.2s",
        }}
      >
        {label}
      </button>
      {state === "error" && errorMsg && (
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "9px",
          color: "#e07070",
          opacity: 0.8,
          margin: "2px 0 0",
          lineHeight: 1.3,
        }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}

export function MobileHeader() {
  return (
    <div className="px-[16px] pt-[16px] pb-[10px] shrink-0">
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

      <MobilePublishButton />
    </div>
  );
}
