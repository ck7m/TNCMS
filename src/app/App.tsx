import React, { useState, useEffect } from "react";
import {
  Phone, PhoneOutgoing, PhoneIncoming,
  WifiOff, Wifi, Database, Shield,
  User, FileText, MapPin, Star,
  Search, Download, Clock, CheckCircle,
  ChevronDown, X, AlertCircle, RefreshCw,
  Check, Flag, ClipboardList, LayoutDashboard,
  Bell, Settings, LogOut, AlertTriangle,
  Zap, ChevronRight, Filter, Eye, Sun, Moon,
} from "lucide-react";
import { Toaster, toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const CALL_TYPES = [
  "Emergency Complaint",
  "General Inquiry",
  "Service Disruption",
  "Billing Dispute",
  "Technical Fault",
  "VIP Escalation",
  "Repeat Complaint",
  "Follow-Up",
];

const COMPLAINT_CATEGORIES = [
  "Power Outage",
  "Water Supply Failure",
  "Sewage & Drainage",
  "Road & Infrastructure",
  "Gas Supply Issue",
  "Noise & Pollution",
  "Property Encroachment",
  "Public Safety",
  "Municipal Service",
  "Other (Unlisted)",
];

const POLICE_STATIONS = [
  "Central Police Station",
  "North Division HQ",
  "South Division HQ",
  "East Division HQ",
  "West Division HQ",
  "Harbor Station",
  "Airport Division",
  "Industrial Area Station",
  "Cantonment Station",
];

const PRIMARY_ZONES = [
  "Zone A — Central District",
  "Zone B — North Sector",
  "Zone C — South Sector",
  "Zone D — East Sector",
  "Zone E — West Sector",
  "Zone F — Harbor District",
  "Zone G — Industrial Belt",
];

const SECONDARY_ZONES = [
  "Alpha Sector", "Beta Sector", "Gamma Sector",
  "Delta Sector", "Epsilon Sector", "Zeta Sector",
  "Eta Sector", "Theta Sector", "Iota Sector", "Kappa Sector",
];

const WOP_ZONES = [
  "WOP-1 Industrial Belt",
  "WOP-2 Residential North",
  "WOP-3 Commercial Core",
  "WOP-4 Rural Periphery",
  "WOP-5 Mixed Use",
  "WOP-6 Port Area",
];

const SERVICE_CENTERS = [
  "Central Operations Hub",
  "North Service Center",
  "South Service Center",
  "East Service Center",
  "West Service Center",
];

const COMPLAINT_TAKERS = [
  "Agent Sarah Mahmood",
  "Agent John Davies",
  "Agent Priya Kapoor",
  "Agent Marcus Thompson",
  "Agent Liu Wei",
  "Agent Fatima Al-Hassan",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "taker" | "supervisor";
type View = "intake" | "challan" | "dashboard";
type ChallanTab = "call" | "caller" | "complaint" | "incident" | "vip" | "dispatch";
type SyncStatus = "online" | "offline" | "syncing";
type ComplaintStatus = "Pending" | "In Progress" | "Resolved" | "Escalated" | "Closed";

interface MockComplaint {
  id: string;
  cli: string;
  customer: string;
  timestamp: string;
  category: string;
  status: ComplaintStatus;
  zone: string;
  taker: string;
  vip: boolean;
  repeatCaller: boolean;
  address: string;
  details: string;
  policeStation: string;
  primaryZone: string;
  secondaryZones: string[];
  wopZones: string[];
}

interface IntakeState {
  cli: string;
  customerName: string;
  address: string;
  callType: string;
  repeatCaller: boolean;
  callSerial: string;
  timestamp: string;
}

interface ChallanState {
  id?: string; // If editing an existing complaint
  runningSerial: string;
  callerName: string;
  callerAddress: string;
  vipCaller: boolean;
  category: string;
  unlistedComplaint: string;
  details: string;
  incidentAddress: string;
  policeStation: string;
  vipStatus: boolean;
  vipName: string;
  vipAddress: string;
  primaryZone: string;
  secondaryZones: string[];
  wopZones: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_COMPLAINTS: MockComplaint[] = [
  {
    id: "CMP-2024-0891",
    cli: "021-4521098",
    customer: "Muhammad Tariq",
    timestamp: "2024-01-15 09:23",
    category: "Power Outage",
    status: "Pending",
    zone: "Zone A — Central District",
    taker: "Agent Sarah Mahmood",
    vip: false,
    repeatCaller: true,
    address: "St. 4, Block B, Central District",
    details: "Complete power failure in the entire street since morning. Neighboring blocks have supply.",
    policeStation: "Central Police Station",
    primaryZone: "Zone A — Central District",
    secondaryZones: ["Alpha Sector"],
    wopZones: ["WOP-3 Commercial Core"],
  },
  {
    id: "CMP-2024-0890",
    cli: "021-3317642",
    customer: "Sana Mirza",
    timestamp: "2024-01-15 09:11",
    category: "Water Supply Failure",
    status: "In Progress",
    zone: "Zone C — South Sector",
    taker: "Agent John Davies",
    vip: false,
    repeatCaller: false,
    address: "Flat 202, Sector 11-A, North Division",
    details: "Low pressure water supply and bad smell from the tap.",
    policeStation: "North Division HQ",
    primaryZone: "Zone C — South Sector",
    secondaryZones: ["Beta Sector"],
    wopZones: ["WOP-2 Residential North"],
  },
  {
    id: "CMP-2024-0889",
    cli: "021-5566123",
    customer: "Brig. (R) Ahmed Khan",
    timestamp: "2024-01-15 08:57",
    category: "Gas Supply Issue",
    status: "Escalated",
    zone: "Zone B — North Sector",
    taker: "Agent Priya Kapoor",
    vip: true,
    repeatCaller: false,
    address: "House 52, Lane 3, South Sector",
    details: "Gas pressure dropped to zero during peak morning hours.",
    policeStation: "South Division HQ",
    primaryZone: "Zone B — North Sector",
    secondaryZones: ["Gamma Sector"],
    wopZones: ["WOP-5 Mixed Use"],
  },
  {
    id: "CMP-2024-0888",
    cli: "021-7712089",
    customer: "Rehana Siddiqui",
    timestamp: "2024-01-15 08:43",
    category: "Sewage & Drainage",
    status: "Resolved",
    zone: "Zone D — East Sector",
    taker: "Agent Marcus Thompson",
    vip: false,
    repeatCaller: true,
    address: "B-44, Gulshan-e-Iqbal",
    details: "Main sewage pipe overflowing, blocking main road access.",
    policeStation: "East Division HQ",
    primaryZone: "Zone D — East Sector",
    secondaryZones: ["Delta Sector"],
    wopZones: ["WOP-4 Rural Periphery"],
  },
  {
    id: "CMP-2024-0887",
    cli: "021-9923456",
    customer: "Omar Farooq",
    timestamp: "2024-01-15 08:30",
    category: "Road & Infrastructure",
    status: "Closed",
    zone: "Zone E — West Sector",
    taker: "Agent Liu Wei",
    vip: false,
    repeatCaller: false,
    address: "Sector 5, Industrial Area",
    details: "Deep pothole causing accidents near the highway exit.",
    policeStation: "Industrial Area Station",
    primaryZone: "Zone E — West Sector",
    secondaryZones: ["Epsilon Sector"],
    wopZones: ["WOP-1 Industrial Belt"],
  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">
          {label}
        </label>
      )}
      {children}
      {hint && <span className="text-[10px] text-slate-400 dark:text-slate-500">{hint}</span>}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={[
        "w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border",
        "rounded text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-600",
        "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20",
        "transition-colors font-mono disabled:opacity-40 disabled:cursor-default",
        className ?? "",
      ].join(" ")}
    />
  );
}

function SelectInput({
  value, onChange, options, placeholder = "Select…",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors pr-8 cursor-pointer"
      >
        <option value="" className="text-slate-400 dark:text-slate-600">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o} className="bg-popover text-foreground">{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
    </div>
  );
}

function MultiSelectInput({
  values, onChange, options, placeholder = "Select…",
}: {
  values: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border rounded text-sm text-left hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
      >
        <span className={values.length === 0 ? "text-slate-400 dark:text-slate-500" : "text-foreground"}>
          {values.length === 0 ? placeholder : `${values.length} selected`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full top-full mt-1 bg-popover border border-border rounded-lg shadow-2xl max-h-52 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
            >
              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${values.includes(opt) ? "bg-primary border-primary" : "border-slate-300 dark:border-slate-700"}`}>
                {values.includes(opt) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">{opt}</span>
            </button>
          ))}
        </div>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {values.map(v => (
            <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] rounded-full border border-blue-200 dark:border-blue-800/40 font-medium">
              {v}
              <button type="button" onClick={() => toggle(v)} className="hover:text-red-500 transition-colors">
                <X className="w-2 h-2" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"}`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`}
        />
      </button>
    </div>
  );
}

function SectionHead({ icon: Icon, title, warning }: { icon: React.ElementType; title: string; warning?: boolean }) {
  return (
    <div className={`flex items-center gap-2 mb-5 pb-2.5 border-b ${warning ? "border-amber-500/20" : "border-border"}`}>
      <Icon className={`w-3.5 h-3.5 ${warning ? "text-amber-500" : "text-primary"}`} />
      <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${warning ? "text-amber-500" : "text-slate-500 dark:text-slate-400"}`}>
        {title}
      </span>
    </div>
  );
}

const STATUS_CLASSES: Record<ComplaintStatus, string> = {
  "Pending":     "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "In Progress": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Resolved":    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Escalated":   "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  "Closed":      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

function StatusBadge({ status }: { status: ComplaintStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${STATUS_CLASSES[status]}`}>
      {status}
    </span>
  );
}

function NavItem({
  icon: Icon, label, active, onClick, badge, danger,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all text-left",
        active
          ? "bg-blue-50 dark:bg-primary/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-primary/20"
          : danger
          ? "text-red-500/70 hover:text-red-600 hover:bg-red-500/10"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40",
      ].join(" ")}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && (
        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "blue" | "amber" | "red" | "emerald";
}) {
  const cfg = {
    blue:    { wrap: "bg-blue-50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-800/20",    val: "text-blue-600 dark:text-blue-400",    ic: "text-blue-500/80"    },
    amber:   { wrap: "bg-amber-50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/20",  val: "text-amber-600 dark:text-amber-400",   ic: "text-amber-500/80"   },
    red:     { wrap: "bg-red-50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/20",      val: "text-red-600 dark:text-red-400",     ic: "text-red-500/80"     },
    emerald: { wrap: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/20", val: "text-emerald-600 dark:text-emerald-400", ic: "text-emerald-500/80" },
  }[color];

  return (
    <div className={`flex items-center gap-3.5 p-4 rounded-xl border ${cfg.wrap}`}>
      <Icon className={`w-6 h-6 ${cfg.ic} flex-shrink-0`} />
      <div>
        <p className={`text-2xl font-semibold font-mono leading-none ${cfg.val}`}>{value}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
}

// ─── Intake View ──────────────────────────────────────────────────────────────

function IntakeView({
  intake, setIntake, activeCLI, dialingActive,
  onSimulateCall, onOutboundCall, onSave, onDismissCall, onClear, onOpenChallan,
}: {
  intake: IntakeState;
  setIntake: React.Dispatch<React.SetStateAction<IntakeState>>;
  activeCLI: string;
  dialingActive: boolean;
  onSimulateCall: () => void;
  onOutboundCall: () => void;
  onSave: () => void;
  onDismissCall: () => void;
  onClear: () => void;
  onOpenChallan: () => void;
}) {
  const upd = <K extends keyof IntakeState>(k: K, v: IntakeState[K]) =>
    setIntake(p => ({ ...p, [k]: v }));

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">New Complaint Intake</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-mono">
              Capture initial caller record
            </p>
          </div>
          <button
            onClick={onSimulateCall}
            disabled={!!activeCLI}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PhoneIncoming className="w-3.5 h-3.5" />
            Simulate Incoming Call
          </button>
        </div>

        {activeCLI && (
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <PhoneIncoming className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Call Connected</span>
              <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400 font-semibold">{activeCLI}</span>
              <span className="text-[10px] text-emerald-500 uppercase tracking-wider hidden sm:block">
                — CLI auto-captured
              </span>
            </div>
            <button onClick={onDismissCall} className="text-emerald-500 hover:text-emerald-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-b border-border">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Intake Form</span>
            <span className="ml-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">{intake.callSerial}</span>
          </div>

          {/* Form grid */}
          <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
            {/* CLI */}
            <Field label="CLI / Phone Extension">
              <div className="flex gap-2">
                <TextInput
                  value={intake.cli}
                  onChange={e => upd("cli", e.target.value)}
                  placeholder="021-XXXXXXX"
                  className="flex-1"
                />
                <button
                  onClick={onOutboundCall}
                  disabled={!intake.cli || dialingActive}
                  title="Initiate outbound call"
                  className={[
                    "w-9 flex-shrink-0 flex items-center justify-center rounded border transition-all",
                    dialingActive
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : intake.cli
                      ? "bg-slate-100 dark:bg-slate-800 border-border text-slate-600 dark:text-slate-400 hover:border-primary/40 hover:text-primary cursor-pointer"
                      : "bg-slate-50 dark:bg-slate-900/20 border-border text-slate-300 dark:text-slate-700 cursor-not-allowed",
                  ].join(" ")}
                >
                  <PhoneOutgoing className={`w-3.5 h-3.5 ${dialingActive ? "animate-pulse" : ""}`} />
                </button>
              </div>
              {dialingActive && (
                <span className="text-[10px] text-amber-500 font-mono animate-pulse">
                  Dialing {intake.cli}…
                </span>
              )}
            </Field>

            {/* Customer Name */}
            <Field label="Customer Name">
              <TextInput
                value={intake.customerName}
                onChange={e => upd("customerName", e.target.value)}
                placeholder="Full name as per record"
                className="font-sans"
              />
            </Field>

            {/* Call Serial */}
            <Field label="Call Serial Number" hint="System-generated — read only">
              <TextInput
                value={intake.callSerial}
                readOnly
                className="text-slate-400 dark:text-slate-500 cursor-default bg-slate-50 dark:bg-slate-900/10"
              />
            </Field>

            {/* Timestamp */}
            <Field label="Timestamp" hint="Captured at call pickup — read only">
              <TextInput
                value={intake.timestamp}
                readOnly
                className="text-slate-400 dark:text-slate-500 cursor-default bg-slate-50 dark:bg-slate-900/10"
              />
            </Field>

            {/* Address */}
            <Field label="Caller Address">
              <textarea
                value={intake.address}
                onChange={e => upd("address", e.target.value)}
                rows={3}
                placeholder="Street, area, city…"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border rounded text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none font-sans"
              />
            </Field>

            {/* Call Type + Repeat Caller */}
            <div className="flex flex-col gap-4">
              <Field label="Call Type">
                <SelectInput
                  value={intake.callType}
                  onChange={v => upd("callType", v)}
                  options={CALL_TYPES}
                  placeholder="Select call type…"
                />
              </Field>
              <div>
                <Toggle
                  checked={intake.repeatCaller}
                  onChange={v => upd("repeatCaller", v)}
                  label="Repeat Caller"
                />
                {intake.repeatCaller && (
                  <div className="flex items-center gap-2 mt-2 px-2.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-600 dark:text-amber-400">
                     <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                     Flagged — review prior complaint history before proceeding
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-slate-50/50 dark:bg-slate-900/10">
            <button
              onClick={onClear}
              className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-wider font-semibold"
            >
              Clear Form
            </button>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-border text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                Save to Queue
              </button>
              <button
                onClick={onOpenChallan}
                className="flex items-center gap-2 px-3.5 py-2 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-foreground/90 transition-colors"
              >
                Open Challan
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* PII notice */}
        <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          PII — Restricted Access · Local Network Only · Not for External Distribution
        </p>
      </div>
    </div>
  );
}

// ─── Challan View ─────────────────────────────────────────────────────────────

const CHALLAN_TABS: { id: ChallanTab; label: string; icon: React.ElementType }[] = [
  { id: "call",      label: "Call Info",     icon: Phone     },
  { id: "caller",    label: "Caller Info",   icon: User      },
  { id: "complaint", label: "Complaint",     icon: FileText  },
  { id: "incident",  label: "Incident",      icon: MapPin    },
  { id: "vip",       label: "VIP",           icon: Star      },
  { id: "dispatch",  label: "Dispatch / Zone", icon: Zap     },
];

function ChallanView({
  challan, setChallan, activeTab, setActiveTab, intake, onSubmit, onDownloadPDF,
}: {
  challan: ChallanState;
  setChallan: React.Dispatch<React.SetStateAction<ChallanState>>;
  activeTab: ChallanTab;
  setActiveTab: (t: ChallanTab) => void;
  intake: IntakeState;
  onSubmit: () => void;
  onDownloadPDF: () => void;
}) {
  const upd = <K extends keyof ChallanState>(k: K, v: ChallanState[K]) =>
    setChallan(p => ({ ...p, [k]: v }));

  const tabIds = CHALLAN_TABS.map(t => t.id);
  const tabIdx = tabIds.indexOf(activeTab);

  const textarea = (value: string, onChange: (v: string) => void, placeholder: string, rows = 3) => (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border rounded text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors resize-none font-sans"
    />
  );

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Complaint Challan</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
              {challan.runningSerial} &nbsp;·&nbsp; {intake.callSerial} {challan.id && `(Editing ${challan.id})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-border text-slate-600 dark:text-slate-400 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3 h-3" /> PDF
            </button>
            <button
              onClick={onSubmit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-blue-600 transition-colors"
            >
              <CheckCircle className="w-3 h-3" /> Submit Challan
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border overflow-x-auto">
          {CHALLAN_TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const hasVipDot = tab.id === "vip" && (challan.vipStatus || challan.vipCaller);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all",
                  active
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20",
                ].join(" ")}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
                {hasVipDot && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Tab panel */}
        <div className="bg-card border border-t-0 border-border rounded-b-xl p-5 shadow-sm" style={{ minHeight: "340px" }}>

          {/* Call Info */}
          {activeTab === "call" && (
            <div>
              <SectionHead icon={Phone} title="Call Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Running Serial Number">
                  <TextInput value={challan.runningSerial} readOnly className="text-slate-400 dark:text-slate-500 cursor-default bg-slate-50 dark:bg-slate-900/10" />
                </Field>
                <Field label="Call Serial Number">
                  <TextInput value={intake.callSerial} readOnly className="text-slate-400 dark:text-slate-500 cursor-default bg-slate-50 dark:bg-slate-900/10" />
                </Field>
                <Field label="Timestamp">
                  <TextInput value={intake.timestamp} readOnly className="text-slate-400 dark:text-slate-500 cursor-default bg-slate-50 dark:bg-slate-900/10" />
                </Field>
                <Field label="CLI / Phone Number">
                  <TextInput
                    value={intake.cli || "Not captured"}
                    readOnly
                    className="text-slate-400 dark:text-slate-500 cursor-default bg-slate-50 dark:bg-slate-900/10"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Caller Info */}
          {activeTab === "caller" && (
            <div className="flex flex-col gap-4">
              <SectionHead icon={User} title="Caller Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Caller Name">
                  <TextInput
                    value={challan.callerName || intake.customerName}
                    onChange={e => upd("callerName", e.target.value)}
                    placeholder="Full name"
                    className="font-sans"
                  />
                </Field>
                <Field label="">
                  <div className="pt-5">
                    <Toggle checked={challan.vipCaller} onChange={v => upd("vipCaller", v)} label="VIP Caller Flag" />
                  </div>
                </Field>
              </div>
              <Field label="Caller Address">
                {textarea(
                  challan.callerAddress || intake.address,
                  v => upd("callerAddress", v),
                  "Full address…"
                )}
              </Field>
            </div>
          )}

          {/* Complaint Info */}
          {activeTab === "complaint" && (
            <div className="flex flex-col gap-4">
              <SectionHead icon={FileText} title="Complaint Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Complaint Category">
                  <SelectInput
                    value={challan.category}
                    onChange={v => upd("category", v)}
                    options={COMPLAINT_CATEGORIES}
                    placeholder="Select category…"
                  />
                </Field>
                <Field label="Unlisted Complaint Type">
                  <TextInput
                    value={challan.unlistedComplaint}
                    onChange={e => upd("unlistedComplaint", e.target.value)}
                    placeholder="Describe if not in category list"
                    className="font-sans"
                  />
                </Field>
              </div>
              <Field label="Complaint Details">
                {textarea(
                  challan.details,
                  v => upd("details", v),
                  "Verbatim description of the complaint as reported by the caller. Include all relevant details, timeline, and prior context mentioned…",
                  6
                )}
              </Field>
            </div>
          )}

          {/* Incident Info */}
          {activeTab === "incident" && (
            <div className="flex flex-col gap-4">
              <SectionHead icon={MapPin} title="Incident Information" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Incident Address">
                  {textarea(
                    challan.incidentAddress,
                    v => upd("incidentAddress", v),
                    "Exact location of the reported incident…"
                  )}
                </Field>
                <Field label="Nearest Police Station">
                  <SelectInput
                    value={challan.policeStation}
                    onChange={v => upd("policeStation", v)}
                    options={POLICE_STATIONS}
                    placeholder="Select police station…"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* VIP Info */}
          {activeTab === "vip" && (
            <div className="flex flex-col gap-4">
              <SectionHead icon={Star} title="VIP Information" warning />
              {!challan.vipStatus && !challan.vipCaller && (
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-slate-50 dark:bg-slate-900/10 border border-border rounded-lg text-xs text-slate-500">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                  Enable VIP flag to activate VIP data entry fields
                </div>
              )}
              <Toggle checked={challan.vipStatus} onChange={v => upd("vipStatus", v)} label="Mark as VIP Complaint" />
              {challan.vipStatus && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="VIP Person Name">
                      <TextInput
                        value={challan.vipName}
                        onChange={e => upd("vipName", e.target.value)}
                        placeholder="Official name / rank / designation"
                        className="font-sans"
                      />
                    </Field>
                    <Field label="VIP Address / Office">
                      <TextInput
                        value={challan.vipAddress}
                        onChange={e => upd("vipAddress", e.target.value)}
                        placeholder="Residential or official address"
                        className="font-sans"
                      />
                    </Field>
                  </div>
                  <div className="flex items-center gap-2.5 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-700 dark:text-amber-400">
                    <Star className="w-3 h-3 flex-shrink-0 fill-amber-500 text-amber-500" />
                    VIP complaint flagged — supervisor notification triggered upon challan submission
                  </div>
                </>
              )}
            </div>
          )}

          {/* Dispatch / Zone */}
          {activeTab === "dispatch" && (
            <div className="flex flex-col gap-5">
              <SectionHead icon={Zap} title="Dispatch & Zone Assignment" />
              <Field label="Primary Zone">
                <SelectInput
                  value={challan.primaryZone}
                  onChange={v => upd("primaryZone", v)}
                  options={PRIMARY_ZONES}
                  placeholder="Select primary dispatch zone…"
                />
              </Field>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-2 gap-5">
                <Field label="Secondary Zones">
                  <MultiSelectInput
                    values={challan.secondaryZones}
                    onChange={v => upd("secondaryZones", v)}
                    options={SECONDARY_ZONES}
                    placeholder="Select secondary zones…"
                  />
                </Field>
                <Field label="WOP Zone Name">
                  <MultiSelectInput
                    values={challan.wopZones}
                    onChange={v => upd("wopZones", v)}
                    options={WOP_ZONES}
                    placeholder="Select WOP zones…"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Tab nav footer */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-border">
            <button
              onClick={() => { if (tabIdx > 0) setActiveTab(tabIds[tabIdx - 1]); }}
              disabled={tabIdx === 0}
              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-0"
            >
              ← {tabIdx > 0 ? CHALLAN_TABS[tabIdx - 1].label : ""}
            </button>
            <div className="flex gap-1.5 items-center">
              {tabIds.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`rounded-full transition-all ${t === activeTab ? "w-4 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"}`}
                />
              ))}
            </div>
            <button
              onClick={() => { if (tabIdx < tabIds.length - 1) setActiveTab(tabIds[tabIdx + 1]); }}
              disabled={tabIdx === tabIds.length - 1}
              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-0"
            >
              {tabIdx < tabIds.length - 1 ? CHALLAN_TABS[tabIdx + 1].label : ""} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Supervisor View ──────────────────────────────────────────────────────────

function SupervisorView({
  complaints, stats,
  searchTerm, setSearchTerm,
  filterDateFrom, setFilterDateFrom,
  filterTaker, setFilterTaker,
  filterCenter, setFilterCenter,
  onViewComplaint,
  onRefresh,
  onExport,
}: {
  complaints: MockComplaint[];
  stats: { total: number; pending: number; escalated: number; resolved: number };
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (v: string) => void;
  filterTaker: string;
  setFilterTaker: (v: string) => void;
  filterCenter: string;
  setFilterCenter: (v: string) => void;
  onViewComplaint: (c: MockComplaint) => void;
  onRefresh: () => void;
  onExport: () => void;
}) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Supervisor Dashboard</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider font-mono">
            Complaint oversight & reporting
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-border text-slate-600 dark:text-slate-400 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary-foreground/90 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-duration-1000" id="refresh-icon" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Today"    value={stats.total}     icon={ClipboardList}  color="blue"    />
        <StatCard label="Pending"        value={stats.pending}   icon={Clock}          color="amber"   />
        <StatCard label="Escalated"      value={stats.escalated} icon={AlertTriangle}  color="red"     />
        <StatCard label="Resolved"       value={stats.resolved}  icon={CheckCircle}    color="emerald" />
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl mb-4 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-slate-50 dark:bg-slate-900/40">
          <Filter className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Search & Filters</span>
        </div>
        <div className="p-4 grid grid-cols-5 gap-3">
          {/* Search */}
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Name, complaint ID, or CLI…"
              className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border rounded text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Date from */}
          <input
            type="date"
            value={filterDateFrom}
            onChange={e => setFilterDateFrom(e.target.value)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800/40 border border-border rounded text-xs text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          />

          {/* Taker filter */}
          <SelectInput
            value={filterTaker}
            onChange={setFilterTaker}
            options={COMPLAINT_TAKERS}
            placeholder="All Takers"
          />

          {/* Center filter */}
          <SelectInput
            value={filterCenter}
            onChange={setFilterCenter}
            options={SERVICE_CENTERS}
            placeholder="All Centers"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              {complaints.length} record{complaints.length !== 1 ? "s" : ""} found
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> VIP
              <Flag className="w-2.5 h-2.5 text-orange-500 ml-2" /> Repeat Caller
            </div>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Last sync: 09:35:42</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50/20 dark:bg-slate-900/10">
                {["Complaint ID", "CLI", "Customer", "Category", "Zone", "Taker", "Time", "Status", ""].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr
                  key={c.id}
                  className="border-b border-border/40 hover:bg-primary/5 transition-colors group"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] text-primary font-semibold">{c.id}</span>
                      {c.vip && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      {c.repeatCaller && <Flag className="w-2.5 h-2.5 text-orange-500 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">{c.cli}</td>
                  <td className="px-4 py-3 text-xs text-foreground font-medium whitespace-nowrap">{c.customer}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">{c.category}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{c.zone?.split(" — ")[0] || c.zone}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {c.taker?.replace("Agent ", "")}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {c.timestamp?.slice(11)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => onViewComplaint(c)}
                      className="flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">
                    No complaints match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole]                 = useState<Role>("taker");
  const [view, setView]                 = useState<View>("intake");
  const [syncStatus, setSyncStatus]     = useState<SyncStatus>("online");
  const [pendingSync, setPendingSync]   = useState(3);
  const [currentTime, setCurrentTime]   = useState(new Date());
  const [activeCLI, setActiveCLI]       = useState("");
  const [connecting, setConnecting]     = useState(false);
  const [dialingActive, setDialingActive] = useState(false);
  const [challanTab, setChallanTab]     = useState<ChallanTab>("call");
  const [complaints, setComplaints]     = useState<MockComplaint[]>(INITIAL_COMPLAINTS);

  // Active theme state
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("cms-theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("cms-theme", theme);
  }, [theme]);

  const [intake, setIntake] = useState<IntakeState>({
    cli: "",
    customerName: "",
    address: "",
    callType: "",
    repeatCaller: false,
    callSerial: "CS-20240115-0892",
    timestamp: "2024-01-15 09:35:42",
  });

  const [challan, setChallan] = useState<ChallanState>({
    runningSerial: "RN-2024-0089",
    callerName: "", callerAddress: "", vipCaller: false,
    category: "", unlistedComplaint: "", details: "",
    incidentAddress: "", policeStation: "",
    vipStatus: false, vipName: "", vipAddress: "",
    primaryZone: "", secondaryZones: [], wopZones: [],
  });

  const [searchTerm, setSearchTerm]         = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("2024-01-15");
  const [filterTaker, setFilterTaker]       = useState("");
  const [filterCenter, setFilterCenter]     = useState("");

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const simulateIncomingCall = () => {
    const contacts = [
      { cli: "021-4521098", name: "Muhammad Tariq", address: "St. 4, Block B, Central District" },
      { cli: "021-3317642", name: "Sana Mirza", address: "Flat 202, Sector 11-A, North Division" },
      { cli: "021-7789012", name: "Rehana Siddiqui", address: "House 52, Lane 3, South Sector" },
    ];
    const item = contacts[Math.floor(Math.random() * contacts.length)];
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setActiveCLI(item.cli);
      const now = new Date();
      const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);
      const serial = `CS-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      setIntake({
        cli: item.cli,
        customerName: item.name,
        address: item.address,
        callType: CALL_TYPES[Math.floor(Math.random() * CALL_TYPES.length)],
        repeatCaller: Math.random() > 0.5,
        callSerial: serial,
        timestamp: timeStr,
      });
      toast.success(`Incoming call connected from ${item.cli}`);
    }, 1400);
  };

  const handleOutboundCall = () => {
    if (!intake.cli || dialingActive) return;
    setDialingActive(true);
    toast.info(`Dialing outbound call to ${intake.cli}...`);
    setTimeout(() => {
      setDialingActive(false);
      toast.success(`Outbound call to ${intake.cli} connected.`);
    }, 3500);
  };

  const handleSaveToQueue = () => {
    if (!intake.cli || !intake.customerName) {
      toast.error("Please ensure Caller Name and CLI are filled in.");
      return;
    }
    const newId = `CMP-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint: MockComplaint = {
      id: newId,
      cli: intake.cli,
      customer: intake.customerName,
      timestamp: intake.timestamp,
      category: intake.callType || "General Inquiry",
      status: "Pending",
      zone: "Zone A — Central District",
      taker: "Agent Sarah Mahmood",
      vip: false,
      repeatCaller: intake.repeatCaller,
      address: intake.address,
      details: "Initial intake captured. Pending full challan details.",
      policeStation: "Central Police Station",
      primaryZone: "Zone A — Central District",
      secondaryZones: [],
      wopZones: [],
    };
    setComplaints(prev => [newComplaint, ...prev]);
    setPendingSync(p => p + 1);
    toast.success(`Intake saved to local queue as ${newId}`);
  };

  const handleClearIntake = () => {
    setIntake({
      cli: "",
      customerName: "",
      address: "",
      callType: "",
      repeatCaller: false,
      callSerial: `CS-${Date.now().toString().slice(-8)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
    toast.info("Intake form cleared.");
  };

  const handleOpenChallanFromIntake = () => {
    setChallan({
      runningSerial: `RN-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      callerName: intake.customerName,
      callerAddress: intake.address,
      vipCaller: intake.repeatCaller,
      category: intake.callType,
      unlistedComplaint: "",
      details: "",
      incidentAddress: intake.address,
      policeStation: "Central Police Station",
      vipStatus: false,
      vipName: "",
      vipAddress: "",
      primaryZone: "Zone A — Central District",
      secondaryZones: [],
      wopZones: [],
    });
    setChallanTab("caller");
    setView("challan");
    toast.info("Transferred intake data to new Challan.");
  };

  const handleSubmitChallan = () => {
    if (!challan.callerName || !challan.category) {
      toast.error("Please fill in the caller name and complaint category.");
      return;
    }

    if (challan.id) {
      // Edit existing
      setComplaints(prev => prev.map(c => {
        if (c.id === challan.id) {
          return {
            ...c,
            customer: challan.callerName,
            address: challan.callerAddress,
            category: challan.category,
            details: challan.details,
            vip: challan.vipStatus,
            policeStation: challan.policeStation,
            primaryZone: challan.primaryZone,
            secondaryZones: challan.secondaryZones,
            wopZones: challan.wopZones,
          };
        }
        return c;
      }));
      toast.success(`Challan ${challan.id} updated successfully!`);
    } else {
      // Create new
      const newId = `CMP-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      const newComplaint: MockComplaint = {
        id: newId,
        cli: intake.cli || "021-0000000",
        customer: challan.callerName,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        category: challan.category,
        status: "Pending",
        zone: challan.primaryZone,
        taker: "Agent Sarah Mahmood",
        vip: challan.vipStatus,
        repeatCaller: challan.vipCaller,
        address: challan.callerAddress,
        details: challan.details,
        policeStation: challan.policeStation,
        primaryZone: challan.primaryZone,
        secondaryZones: challan.secondaryZones,
        wopZones: challan.wopZones,
      };
      setComplaints(prev => [newComplaint, ...prev]);
      toast.success(`New Challan submitted successfully as ${newId}!`);
    }
    setView(role === "supervisor" ? "dashboard" : "intake");
  };

  const handleViewDetails = (c: MockComplaint) => {
    setChallan({
      id: c.id,
      runningSerial: `RN-2024-${c.id.split('-').pop()}`,
      callerName: c.customer,
      callerAddress: c.address || "",
      vipCaller: c.repeatCaller,
      category: c.category,
      unlistedComplaint: "",
      details: c.details || "",
      incidentAddress: c.address || "",
      policeStation: c.policeStation || "Central Police Station",
      vipStatus: c.vip,
      vipName: c.vip ? c.customer : "",
      vipAddress: c.vip ? c.address : "",
      primaryZone: c.primaryZone || "Zone A — Central District",
      secondaryZones: c.secondaryZones || [],
      wopZones: c.wopZones || [],
    });
    // Set intake to match this complaint's CLI
    setIntake(prev => ({
      ...prev,
      cli: c.cli,
      customerName: c.customer,
      address: c.address || "",
      timestamp: c.timestamp,
    }));
    setChallanTab("complaint");
    setView("challan");
    toast.info(`Loaded complaint ${c.id} into Challan View.`);
  };

  const handleDownloadPDF = () => {
    toast.success("Mock PDF Generated & Downloaded!");
  };

  const handleExportReport = () => {
    toast.success("Supervisor report exported successfully to Excel/CSV.");
  };

  const handleRefresh = () => {
    const icon = document.getElementById("refresh-icon");
    if (icon) {
      icon.classList.add("animate-spin");
      setTimeout(() => icon.classList.remove("animate-spin"), 1000);
    }
    handleSync();
    toast.info("Dashboard data re-synchronized with central server.");
  };

  const handleSync = () => {
    if (pendingSync === 0) return;
    setSyncStatus("syncing");
    setTimeout(() => {
      setPendingSync(0);
      setSyncStatus("online");
      toast.success("Local queue synchronized successfully.");
    }, 2200);
  };

  const filteredComplaints = complaints.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q
      || c.customer.toLowerCase().includes(q)
      || c.id.toLowerCase().includes(q)
      || c.cli.includes(q);
    const matchTaker = !filterTaker || c.taker === filterTaker;
    return matchSearch && matchTaker;
  });

  const stats = {
    total:     complaints.length,
    pending:   complaints.filter(c => c.status === "Pending").length,
    escalated: complaints.filter(c => c.status === "Escalated").length,
    resolved:  complaints.filter(c => c.status === "Resolved").length,
  };

  const SyncIcon = syncStatus === "syncing" ? RefreshCw : syncStatus === "offline" ? WifiOff : Wifi;
  const syncColor = { online: "text-emerald-500", offline: "text-amber-500", syncing: "text-blue-500" }[syncStatus];
  const syncLabel = { online: "LOCAL NET", offline: "OFFLINE", syncing: "SYNCING" }[syncStatus];

  return (
    <div
      className="h-screen flex flex-col bg-background text-foreground overflow-hidden transition-colors duration-200"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Toaster position="top-right" richColors />

      {/* Incoming call overlay */}
      {connecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-5 shadow-2xl">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
                <PhoneIncoming className="w-7 h-7 text-emerald-500" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/25 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 font-semibold">Incoming Call</p>
              <p className="text-base font-mono text-foreground animate-pulse">Connecting…</p>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">CLI capture in progress</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="flex-shrink-0 h-11 flex items-center justify-between px-4 border-b border-border bg-card z-10">
        {/* Left: brand + status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="rounded-md bg-primary flex items-center justify-center"
              style={{ width: "22px", height: "22px" }}
            >
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-widest">CSCMS</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden lg:block tracking-wide">
              Customer Service Complaint Management System
            </span>
          </div>

          <div className="w-px h-3.5 bg-border" />

          <div className="flex items-center gap-1.5">
            <SyncIcon className={`w-3 h-3 ${syncColor} ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            <span className={`text-[10px] font-mono font-semibold tracking-wider ${syncColor}`}>
              {syncLabel}
            </span>
          </div>

          {pendingSync > 0 && (
            <button
              onClick={handleSync}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-600 dark:text-amber-400 text-[10px] font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <Database className="w-2.5 h-2.5" />
              {pendingSync} queued
            </button>
          )}
        </div>

        {/* Right: theme toggle + time + role + user */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
            {currentTime.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            {" "}
            <span className="text-slate-400 dark:text-slate-500">{currentTime.toLocaleTimeString("en-GB")}</span>
          </span>

          {/* Role switcher (demo control) */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 border border-border rounded-md p-0.5">
            <button
              onClick={() => { setRole("taker"); if (view === "dashboard") setView("intake"); }}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${role === "taker" ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
            >
              Taker
            </button>
            <button
              onClick={() => { setRole("supervisor"); setView("dashboard"); }}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${role === "supervisor" ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}
            >
              Supervisor
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center">
              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">
                {role === "taker" ? "SM" : "SV"}
              </span>
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 hidden md:block font-semibold">
              {role === "taker" ? "Agent Sarah M." : "Supervisor"}
            </span>
          </div>

          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-44 flex-shrink-0 border-r border-border bg-card flex flex-col py-2">
          <nav className="flex flex-col gap-0.5 px-1.5 flex-1">
            {role === "taker" ? (
              <>
                <NavItem icon={Phone}         label="New Intake"        active={view === "intake"}   onClick={() => setView("intake")}   />
                <NavItem icon={ClipboardList} label="Complaint Challan" active={view === "challan"}  onClick={() => setView("challan")}  />
              </>
            ) : (
              <>
                <NavItem icon={LayoutDashboard} label="Dashboard"       active={view === "dashboard"} onClick={() => setView("dashboard")} />
                <NavItem icon={ClipboardList}   label="Challan View"    active={view === "challan"}   onClick={() => setView("challan")}  />
                <NavItem icon={Phone}           label="Intake Form"     active={view === "intake"}    onClick={() => setView("intake")}   />
              </>
            )}
          </nav>
          <div className="px-1.5 pt-2 border-t border-border flex flex-col gap-0.5">
            <NavItem icon={Bell}   label="Alerts"   badge={2} />
            <NavItem icon={LogOut} label="Sign Out" danger />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background text-foreground">
          {view === "intake" && (
            <IntakeView
              intake={intake}
              setIntake={setIntake}
              activeCLI={activeCLI}
              dialingActive={dialingActive}
              onSimulateCall={simulateIncomingCall}
              onOutboundCall={handleOutboundCall}
              onSave={handleSaveToQueue}
              onDismissCall={() => setActiveCLI("")}
              onClear={handleClearIntake}
              onOpenChallan={handleOpenChallanFromIntake}
            />
          )}
          {view === "challan" && (
            <ChallanView
              challan={challan}
              setChallan={setChallan}
              activeTab={challanTab}
              setActiveTab={setChallanTab}
              intake={intake}
              onSubmit={handleSubmitChallan}
              onDownloadPDF={handleDownloadPDF}
            />
          )}
          {view === "dashboard" && (
            <SupervisorView
              complaints={filteredComplaints}
              stats={stats}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterDateFrom={filterDateFrom}
              setFilterDateFrom={setFilterDateFrom}
              filterTaker={filterTaker}
              setFilterTaker={setFilterTaker}
              filterCenter={filterCenter}
              setFilterCenter={setFilterCenter}
              onViewComplaint={handleViewDetails}
              onRefresh={handleRefresh}
              onExport={handleExportReport}
            />
          )}
        </main>
      </div>
    </div>
  );
}
