import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Pencil, ChevronDown, Check, AlertCircle, Trash2 } from "lucide-react";
import {
  EVENT_CATEGORIES,
  type EventCategory,
  type BadgeType,
  type ScheduleEvent,
  categoryHex,
  CATEGORY_COLOR,
  COLOR_HEX,
  DAY_LABELS,
} from "./schedule-data";
import { formatTimeRange } from "./event-details";
import { people, peopleList, DEPARTMENT_LABELS, DEPARTMENT_COLORS, type Department } from "./people-data";
import { useSchedule, getEventDetail } from "./schedule-context";
import type { EventDetail } from "./event-details";
import { toast } from "sonner";
import { Avatar } from "./avatar";

// ── Shared style tokens ────────────────────────────────────────────
const font = "'Inter', sans-serif";
const fontSerif = "'Libre Baskerville', 'Cambria', serif";
const bg = "#1e1e1d";
const bgField = "#2a2a29";
const border = "#3a3a39";
const borderFocus = "#c2ab74";
const textPrimary = "#f4f4f4";
const textSecondary = "#b0afae";
const textMuted = "#838281";
const errorColor = "#e5584f";

// ── Time options (15-min increments 9AM–9PM) ───────────────────────
interface TimeOption { label: string; value: number; }

function buildTimeOptions(): TimeOption[] {
  const opts: TimeOption[] = [];
  for (let h = 9; h <= 21; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 21 && m > 0) break;
      const decimal = h + m / 60;
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const minStr = m.toString().padStart(2, "0");
      opts.push({ label: `${hour12}:${minStr} ${ampm}`, value: decimal });
    }
  }
  return opts;
}
const TIME_OPTIONS = buildTimeOptions();

// ── Reusable primitives ────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: textMuted, letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: errorColor, marginLeft: 2 }}>*</span>}
    </label>
  );
}
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-[4px] mt-[4px]">
      <AlertCircle size={12} color={errorColor} />
      <span style={{ fontFamily: font, fontSize: "11px", color: errorColor }}>{message}</span>
    </div>
  );
}
const inputStyle: React.CSSProperties = {
  fontFamily: font, fontSize: "13px", color: textPrimary, backgroundColor: bgField,
  border: `1px solid ${border}`, borderRadius: 6, padding: "10px 12px", width: "100%",
  outline: "none", transition: "border-color 150ms", minHeight: 44,
};
function TextInput({ value, onChange, placeholder, error }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, borderColor: error ? errorColor : border }} onFocus={(e) => { e.currentTarget.style.borderColor = borderFocus; }} onBlur={(e) => { e.currentTarget.style.borderColor = error ? errorColor : border; }} />;
}
function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: "vertical" as const, minHeight: 60 }} onFocus={(e) => { e.currentTarget.style.borderColor = borderFocus; }} onBlur={(e) => { e.currentTarget.style.borderColor = border; }} />;
}
function SelectField<T extends string | number>({ value, onChange, options, error }: { value: T; onChange: (v: T) => void; options: { label: string; value: T }[]; error?: boolean }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => { const raw = e.target.value; onChange(typeof value === "number" ? (parseFloat(raw) as T) : (raw as T)); }} style={{ ...inputStyle, borderColor: error ? errorColor : border, appearance: "none", paddingRight: 32, cursor: "pointer" }}>
        {options.map((o) => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} color={textMuted} className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ── Person Multi-Select ────────────────────────────────────────────
function PersonMultiSelect({ selected, onChange, label }: { selected: string[]; onChange: (ids: string[]) => void; label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div ref={ref} className="relative">
      <FieldLabel>{label}</FieldLabel>
      <button type="button" onClick={() => setIsOpen(!isOpen)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", minHeight: 40 }}>
        <span style={{ color: selected.length > 0 ? textPrimary : textMuted }}>
          {selected.length === 0 ? "Select people..." : selected.length === peopleList.length ? "Everyone" : `${selected.length} selected`}
        </span>
        <ChevronDown size={14} color={textMuted} />
      </button>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-[4px] mt-[6px]">
          {selected.slice(0, 8).map((id) => { const p = people[id]; if (!p) return null; return (
            <button key={id} type="button" onClick={() => toggle(id)} className="relative rounded-full overflow-hidden shrink-0 group/av" style={{ width: 28, height: 28 }} title={`Remove ${p.name}`}>
              <Avatar person={p} size={28} />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/av:opacity-100 transition-opacity flex items-center justify-center"><X size={12} color="white" /></div>
            </button>);
          })}
          {selected.length > 8 && <div className="flex items-center justify-center rounded-full shrink-0" style={{ width: 28, height: 28, backgroundColor: "#3a3a39", fontFamily: font, fontSize: "10px", fontWeight: 700, color: textMuted }}>+{selected.length - 8}</div>}
        </div>
      )}
      {isOpen && (
        <div className="absolute z-50 mt-[4px] w-full rounded-[8px] overflow-hidden" style={{ backgroundColor: bg, border: `1px solid ${border}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxHeight: 240, overflowY: "auto" }}>
          <div className="flex gap-[8px] px-[12px] py-[8px]" style={{ borderBottom: `1px solid ${border}` }}>
            <button type="button" onClick={() => onChange(peopleList.map(p => p.id))} style={{ fontFamily: font, fontSize: "10px", fontWeight: 700, color: "#c2ab74", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Select All</button>
            <span style={{ color: border }}>|</span>
            <button type="button" onClick={() => onChange([])} style={{ fontFamily: font, fontSize: "10px", fontWeight: 700, color: textMuted, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Clear</button>
          </div>
          {peopleList.map((p) => { const isSel = selected.includes(p.id); return (
            <button key={p.id} type="button" onClick={() => toggle(p.id)} className="flex items-center gap-[10px] w-full px-[12px] py-[8px] transition-colors" style={{ background: isSel ? "rgba(194,171,116,0.08)" : "transparent", border: "none", cursor: "pointer", textAlign: "left", minHeight: 44 }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isSel ? "rgba(194,171,116,0.12)" : "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isSel ? "rgba(194,171,116,0.08)" : "transparent"; }}>
              <Avatar person={p} size={24} />
              <span className="flex-1" style={{ fontFamily: font, fontSize: "12px", color: textPrimary }}>{p.name}</span>
              <span style={{ fontFamily: font, fontSize: "10px", fontWeight: 700, color: DEPARTMENT_COLORS[p.department], letterSpacing: "0.3px" }}>{p.department}</span>
              {isSel && <Check size={14} color="#c2ab74" />}
            </button>);
          })}
        </div>
      )}
    </div>
  );
}

// ── Department Tag Select ──────────────────────────────────────────
const ALL_DEPTS: Department[] = ["LEAD", "DES", "AM", "DEV"];
function DepartmentTagSelect({ selected, onChange }: { selected: Department[]; onChange: (d: Department[]) => void }) {
  const toggle = (d: Department) => onChange(selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d]);
  return (
    <div className="flex flex-wrap gap-[6px]">
      {ALL_DEPTS.map((d) => { const active = selected.includes(d); return (
        <button key={d} type="button" onClick={() => toggle(d)} className="inline-flex items-center rounded-full px-[10px] py-[4px] transition-all" style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px", cursor: "pointer", border: `1px solid ${active ? DEPARTMENT_COLORS[d] : border}`, backgroundColor: active ? DEPARTMENT_COLORS[d] + "22" : "transparent", color: active ? DEPARTMENT_COLORS[d] : textMuted }}>{DEPARTMENT_LABELS[d]}</button>
      ); })}
    </div>
  );
}

// ── Toggle + Category Preview + Section Divider ────────────────────
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-[10px] cursor-pointer select-none">
      <div className="relative rounded-full transition-colors" style={{ width: 36, height: 20, backgroundColor: checked ? "#c2ab74" : "#3a3a39" }} onClick={() => onChange(!checked)}>
        <div className="absolute top-[2px] rounded-full bg-white transition-all" style={{ width: 16, height: 16, left: checked ? 18 : 2 }} />
      </div>
      <span style={{ fontFamily: font, fontSize: "12px", color: textSecondary }}>{label}</span>
    </label>
  );
}
function CategoryPreview({ category }: { category: EventCategory }) {
  return <div className="flex items-center gap-[8px]"><div className="rounded-[3px]" style={{ width: 14, height: 14, backgroundColor: categoryHex(category) }} /><span style={{ fontFamily: font, fontSize: "12px", color: textSecondary }}>{category}</span></div>;
}
function SectionDivider({ label }: { label: string }) {
  return <div className="flex items-center gap-[12px] pt-[8px]"><div className="flex-1 h-px" style={{ backgroundColor: border }} /><span style={{ fontFamily: font, fontSize: "10px", fontWeight: 700, color: textMuted, letterSpacing: "1px", textTransform: "uppercase" }}>{label}</span><div className="flex-1 h-px" style={{ backgroundColor: border }} /></div>;
}

// ════════════════════════════════════════════════════════════════════
// ── MAIN MODAL ─────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════

interface FormState {
  title: string; category: EventCategory; day: number; startTime: number; endTime: number;
  description: string; locationName: string; locationAddress: string;
  moreDetails: string;
  requiredAttendees: string[]; optionalAttendees: string[]; presenters: string[];
  departments: Department[]; showBadge: boolean; badgeType: BadgeType;
}
const initialForm: FormState = {
  title: "", category: "MEETING", day: 0, startTime: 9, endTime: 10, description: "",
  locationName: "", locationAddress: "", moreDetails: "",
  requiredAttendees: [], optionalAttendees: [],
  presenters: [], departments: [], showBadge: false, badgeType: "logo",
};

interface ValidationErrors { title?: string; time?: string; attendees?: string; }
function validate(form: FormState): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (form.endTime <= form.startTime) errors.time = "End time must be after start time";
  if (form.category === "MEETING" && form.requiredAttendees.length === 0) errors.attendees = "Meetings require at least one attendee";
  return errors;
}

/** Build a FormState from an existing event + detail for edit mode */
function buildFormFromEvent(evt: ScheduleEvent, detail?: EventDetail): FormState {
  const title = evt.title || evt.titleLight || evt.titleDark || "";
  // Parse location: locationAddress may be "Name\nAddress"
  let locName = "";
  let locAddr = "";
  if (detail?.location) {
    locName = detail.location.split("\n")[0] || "";
    locAddr = detail.locationNote || "";
  } else if (evt.locationAddress) {
    const parts = evt.locationAddress.split("\n");
    locName = parts[0] || "";
    locAddr = parts.slice(1).join("\n");
  }
  return {
    title: title.trim(),
    category: evt.category,
    day: evt.day,
    startTime: evt.startHour,
    endTime: evt.endHour,
    description: detail?.fullDescription || evt.description || "",
    locationName: locName,
    locationAddress: locAddr,
    moreDetails: detail?.moreDetails || "",
    requiredAttendees: detail?.requiredAttendees || [],
    optionalAttendees: detail?.optionalAttendees || [],
    presenters: detail?.presenters || [],
    departments: [],
    showBadge: !!evt.badge,
    badgeType: evt.badge || "logo",
  };
}

export function AddTimeBlockModal({
  isOpen,
  onClose,
  editingId,
  prefillDay,
  prefillStartHour,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingId?: string | null;
  prefillDay?: number;
  prefillStartHour?: number;
}) {
  const { addEvent, editFullEvent, deleteEvent, events } = useSchedule();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [shake, setShake] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const isEditing = !!editingId;

  // Pre-fill form when editing
  useEffect(() => {
    if (!isOpen) {
      setConfirmDelete(false);
      return;
    }
    if (editingId) {
      const evt = events.find((e) => e.id === editingId);
      if (evt) {
        const detail = getEventDetail(editingId);
        setForm(buildFormFromEvent(evt, detail));
      }
    } else if (prefillDay !== undefined && prefillStartHour !== undefined) {
      // Pre-fill from grid cell click
      const endTime = Math.min(prefillStartHour + 1, 21);
      setForm({ ...initialForm, day: prefillDay, startTime: prefillStartHour, endTime });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [isOpen, editingId, prefillDay, prefillStartHour]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; if (key === "title") delete next.title; if (key === "startTime" || key === "endTime") delete next.time; if (key === "requiredAttendees" || key === "category") delete next.attendees; return next; });
  }, []);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const el = modalRef.current;
    if (el) { (el.querySelector("input, select, textarea, button") as HTMLElement)?.focus(); }
    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const el = modalRef.current; if (!el) return;
      const focusable = el.querySelectorAll<HTMLElement>('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { setShake(true); setTimeout(() => setShake(false), 400); return; }

    const buildEvent = (id: string): ScheduleEvent => ({
      id, day: form.day, startHour: form.startTime, endHour: form.endTime,
      category: form.category, badge: form.showBadge ? form.badgeType : null,
      titleLight: form.title, description: form.description || undefined,
      locationLabel: form.locationName ? "Location:" : undefined,
      locationAddress: form.locationName ? (form.locationAddress ? `${form.locationName}\n${form.locationAddress}` : form.locationName) : undefined,
    });
    const buildDetail = (): EventDetail => ({
      fullDescription: form.description || form.title,
      requiredAttendees: form.requiredAttendees,
      optionalAttendees: form.optionalAttendees.length > 0 ? form.optionalAttendees : undefined,
      presenters: form.presenters.length > 0 ? form.presenters : undefined,
      timeLabel: formatTimeRange(form.startTime, form.endTime),
      location: form.locationName || undefined,
      locationNote: form.locationAddress || undefined,
      moreDetails: form.moreDetails.trim() || undefined,
    });

    if (isEditing && editingId) {
      editFullEvent(editingId, buildEvent(editingId), buildDetail());
      toast.success("Time block updated");
    } else {
      const id = `custom-${Date.now()}`;
      addEvent(buildEvent(id), buildDetail());
      toast.success("Time block added");
    }
    setForm(initialForm);
    setErrors({});
    onClose();
  }, [form, addEvent, editFullEvent, editingId, isEditing, onClose]);

  const handleDelete = useCallback(() => {
    if (!editingId) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteEvent(editingId);
    toast.success("Time block deleted");
    setForm(initialForm);
    setErrors({});
    setConfirmDelete(false);
    onClose();
  }, [editingId, confirmDelete, deleteEvent, onClose]);

  const previewHex = isOpen ? COLOR_HEX[CATEGORY_COLOR[form.category]] : "#838281";
  const hasErrors = Object.keys(errors).length > 0;
  const isMobileWidth = typeof window !== "undefined" && window.innerWidth < 768;
  const IconComp = isEditing ? Pencil : Plus;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div key="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog" aria-modal="true" aria-label={isEditing ? "Edit Time Block" : "Add Time Block"}>
          <motion.div key="modal-panel" initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }} ref={modalRef}
            className={`relative overflow-hidden flex flex-col ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
            style={{ width: "min(540px, 100vw)", maxHeight: "calc(100dvh - 60px)", backgroundColor: bg, border: `1px solid ${border}`, boxShadow: "0 24px 64px rgba(0,0,0,0.6)", borderRadius: isMobileWidth ? 0 : 12, ...(isMobileWidth ? { maxHeight: "100dvh", height: "100dvh", width: "100vw" } : {}) }}>
            {/* Accent bar */}
            <div style={{ height: 3, backgroundColor: previewHex, transition: "background-color 200ms" }} />

            {/* Header */}
            <div className="flex items-center justify-between px-[24px] py-[16px] shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="flex items-center gap-[12px]">
                <div className="flex items-center justify-center rounded-[8px]" style={{ width: 36, height: 36, backgroundColor: previewHex + "33" }}>
                  <IconComp size={18} color={previewHex} />
                </div>
                <div>
                  <h2 style={{ fontFamily: fontSerif, fontSize: "18px", fontWeight: 700, color: textPrimary, letterSpacing: "0.3px", margin: 0 }}>
                    {isEditing ? "Edit Time Block" : "Add Time Block"}
                  </h2>
                  <p style={{ fontFamily: font, fontSize: "11px", color: textMuted, marginTop: 2 }}>
                    {isEditing ? `Editing on ${DAY_LABELS[form.day]}` : `New block for ${DAY_LABELS[form.day]}`}
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="flex items-center justify-center rounded-[6px] transition-colors" style={{ width: 44, height: 44, border: "none", backgroundColor: "transparent", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#3a3a39"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }} aria-label="Close modal">
                <X size={18} color={textMuted} />
              </button>
            </div>

            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto px-[24px] py-[20px]" style={{ overscrollBehavior: "contain" }}>
              <div className="flex flex-col gap-[16px]">
                <div><FieldLabel required>Title</FieldLabel><TextInput value={form.title} onChange={(v) => update("title", v)} placeholder="e.g. Design Review" error={!!errors.title} /><FieldError message={errors.title} /></div>

                <div className="flex gap-[12px]">
                  <div className="flex-1"><FieldLabel required>Category</FieldLabel><SelectField value={form.category} onChange={(v) => update("category", v as EventCategory)} options={EVENT_CATEGORIES.map((c) => ({ label: c, value: c }))} /><div className="mt-[6px]"><CategoryPreview category={form.category} /></div></div>
                  <div className="flex-1"><FieldLabel required>Day</FieldLabel><SelectField value={form.day} onChange={(v) => update("day", v)} options={DAY_LABELS.map((l, i) => ({ label: l, value: i }))} /></div>
                </div>

                <div className="flex gap-[12px]">
                  <div className="flex-1"><FieldLabel required>Start Time</FieldLabel><SelectField value={form.startTime} onChange={(v) => update("startTime", v)} options={TIME_OPTIONS} error={!!errors.time} /></div>
                  <div className="flex-1"><FieldLabel required>End Time</FieldLabel><SelectField value={form.endTime} onChange={(v) => update("endTime", v)} options={TIME_OPTIONS} error={!!errors.time} /></div>
                </div>
                <FieldError message={errors.time} />

                {form.endTime > form.startTime && (
                  <div className="rounded-[6px] px-[12px] py-[8px]" style={{ backgroundColor: previewHex + "1a", border: `1px solid ${previewHex}33` }}>
                    <span style={{ fontFamily: font, fontSize: "12px", fontWeight: 600, color: textPrimary }}>{formatTimeRange(form.startTime, form.endTime)}</span>
                    <span style={{ fontFamily: font, fontSize: "11px", color: textMuted, marginLeft: 8 }}>({((form.endTime - form.startTime) * 60).toFixed(0)} min)</span>
                  </div>
                )}

                <div><FieldLabel>Description</FieldLabel><TextArea value={form.description} onChange={(v) => update("description", v)} placeholder="What's this time block about?" /></div>

                <SectionDivider label="Location" />
                <div className="flex gap-[12px]">
                  <div className="flex-1"><FieldLabel>Location Name</FieldLabel><TextInput value={form.locationName} onChange={(v) => update("locationName", v)} placeholder="e.g. The Loading Dock" /></div>
                  <div className="flex-1"><FieldLabel>Address</FieldLabel><TextInput value={form.locationAddress} onChange={(v) => update("locationAddress", v)} placeholder="e.g. 123 Main St." /></div>
                </div>

                <SectionDivider label="More Details" />
                <div><FieldLabel>Additional Notes</FieldLabel><TextArea value={form.moreDetails} onChange={(v) => update("moreDetails", v)} placeholder="Any extra info to show on the detail card…" rows={3} /></div>

                <SectionDivider label="People" />
                <div><PersonMultiSelect selected={form.requiredAttendees} onChange={(ids) => update("requiredAttendees", ids)} label={`Required Attendees ${form.category === "MEETING" ? "*" : ""}`} /><FieldError message={errors.attendees} /></div>
                <PersonMultiSelect selected={form.optionalAttendees} onChange={(ids) => update("optionalAttendees", ids)} label="Optional Attendees" />
                <PersonMultiSelect selected={form.presenters} onChange={(ids) => update("presenters", ids)} label="Presenters" />

                <SectionDivider label="Display Options" />
                <div><FieldLabel>Department Tags</FieldLabel><DepartmentTagSelect selected={form.departments} onChange={(d) => update("departments", d)} /></div>
                <div className="flex gap-[24px]"><Toggle checked={form.showBadge} onChange={(v) => update("showBadge", v)} label="Show badge" /></div>
                {form.showBadge && (
                  <div><FieldLabel>Badge Type</FieldLabel>
                    <div className="flex gap-[8px]">
                      {(["logo", "DES", "AM", "DEV"] as BadgeType[]).map((bt) => { if (!bt) return null; const active = form.badgeType === bt; return (
                        <button key={bt} type="button" onClick={() => update("badgeType", bt)} className="rounded-[6px] px-[12px] py-[6px] transition-all" style={{ fontFamily: font, fontSize: "11px", fontWeight: 700, color: active ? "#c2ab74" : textMuted, backgroundColor: active ? "rgba(194,171,116,0.12)" : "transparent", border: `1px solid ${active ? "#c2ab74" : border}`, cursor: "pointer" }}>{bt === "logo" ? "Steadfast" : bt}</button>
                      ); })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-[24px] py-[16px] shrink-0" style={{ borderTop: `1px solid ${border}` }}>
              <div style={{ fontFamily: font, fontSize: "11px", color: textMuted }}>
                {isEditing && (
                  <button type="button" onClick={handleDelete} className="flex items-center gap-[6px] rounded-[6px] px-[12px] py-[8px] transition-colors" style={{ fontFamily: font, fontSize: "12px", fontWeight: 600, color: confirmDelete ? "#fff" : errorColor, backgroundColor: confirmDelete ? errorColor : "transparent", border: `1px solid ${confirmDelete ? errorColor : border}`, cursor: "pointer", minHeight: 36 }}
                    onMouseEnter={(e) => { if (!confirmDelete) e.currentTarget.style.backgroundColor = "rgba(229,88,79,0.1)"; }}
                    onMouseLeave={(e) => { if (!confirmDelete) e.currentTarget.style.backgroundColor = "transparent"; }}>
                    <Trash2 size={14} />
                    {confirmDelete ? "Confirm Delete" : "Delete"}
                  </button>
                )}
                {!isEditing && hasErrors && <span style={{ color: errorColor }}>Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} above</span>}
              </div>
              <div className="flex gap-[10px]">
                <button type="button" onClick={onClose} className="rounded-[6px] px-[16px] py-[8px] transition-colors" style={{ fontFamily: font, fontSize: "13px", fontWeight: 600, color: textSecondary, backgroundColor: "transparent", border: `1px solid ${border}`, cursor: "pointer", minHeight: 44 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#2a2a29"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>Cancel</button>
                <button type="button" onClick={handleSubmit} className="rounded-[6px] px-[20px] py-[8px] transition-all" style={{ fontFamily: font, fontSize: "13px", fontWeight: 700, color: "#1e1e1d", backgroundColor: "#c2ab74", border: "none", cursor: "pointer", letterSpacing: "0.3px", minHeight: 44 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#d4be87"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#c2ab74"; }}>
                  {isEditing ? "Save Changes" : "Add Time Block"}
                </button>
              </div>
            </div>

            <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }`}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}