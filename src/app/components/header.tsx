import { useState, useCallback } from "react";
import { useSchedule } from "./schedule-context";

type PublishState = "idle" | "publishing" | "success" | "error";

function PublishButton() {
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
      // Reset to idle after 3 seconds
      setTimeout(() => setState("idle"), 3000);
    } else {
      setState("error");
      setErrorMsg(result.error ?? "Publish failed");
      setTimeout(() => setState("idle"), 4000);
    }
  }, [publish, state]);

  const label =
    state === "publishing" ? "Publishing…" :
    state === "success"    ? "✓ Live for everyone" :
    state === "error"      ? "✗ Failed" :
    "↑ Publish";

  const color =
    state === "success" ? "#7ec87e" :
    state === "error"   ? "#e07070" :
    "#c2ab74";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
      <button
        onClick={handlePublish}
        disabled={state === "publishing"}
        title={
          state === "idle"
            ? "Save your changes so everyone sees them"
            : state === "publishing"
            ? "Pushing changes to the site…"
            : state === "success"
            ? "Changes are live — will appear for everyone within ~60 seconds"
            : errorMsg
        }
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
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
          fontSize: "10px",
          color: "#e07070",
          opacity: 0.8,
          margin: 0,
          maxWidth: "220px",
          textAlign: "right",
          lineHeight: 1.3,
        }}>
          {errorMsg}
        </p>
      )}
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
          <div className="flex-1 h-0" style={{ borderBottom: "1px solid transparent", backgroundImage: "linear-gradient(to left, #3A4550, transparent)", backgroundSize: "100% 1px", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />
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

      {/* Publish row */}
      <div className="flex justify-end pb-[8px] pt-[6px]">
        <PublishButton />
      </div>
    </div>
  );
}
