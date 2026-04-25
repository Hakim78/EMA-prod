"use client";

import { useState } from "react";
import { Check, Trash2, Monitor, Smartphone, AlertTriangle } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const inputStyle: React.CSSProperties = {
  ...S, width: "100%", height: 34, padding: "0 10px",
  background: "var(--bg)", border: "1px solid var(--border)",
  color: "var(--fg)", fontSize: 13, outline: "none",
};

export default function ProfilePage() {
  const [name, setName] = useState("Hakim Djaalal");
  const [company, setCompany] = useState("EdRCF Capital Partners");
  const [role, setRole] = useState("Managing Partner");
  const [phone, setPhone] = useState("+33 6 12 34 56 78");

  const [pwd, setPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  const [notifs, setNotifs] = useState({
    digest: true, signals: true, invites: true, billing: false,
  });

  return (
    <>
      <SectionHeader title="Profile" subtitle="Personal information and how the team sees you." />

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Full name">
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Email" hint="Verified">
            <input value="hakim.djaalalom@gmail.com" readOnly style={{ ...inputStyle, color: "var(--fg-muted)" }} />
          </Field>
          <Field label="Company">
            <input value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Role">
            <input value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button style={primaryBtn}>Save changes</button>
        </div>
      </Card>

      <SectionHeader title="Password" subtitle="Update your password regularly." />

      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Current password">
            <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} style={inputStyle} />
          </Field>
          <div />
          <Field label="New password">
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button style={primaryBtn}>Update password</button>
        </div>
      </Card>

      <SectionHeader title="Notifications" subtitle="What we email you about." />

      <Card>
        <NotifRow label="Daily digest of new matches" checked={notifs.digest}
          onChange={(v) => setNotifs((p) => ({ ...p, digest: v }))} />
        <NotifRow label="Intent-to-sell signals on watchlist" checked={notifs.signals}
          onChange={(v) => setNotifs((p) => ({ ...p, signals: v }))} />
        <NotifRow label="Team invites and mentions" checked={notifs.invites}
          onChange={(v) => setNotifs((p) => ({ ...p, invites: v }))} />
        <NotifRow label="Billing and credit alerts" checked={notifs.billing}
          onChange={(v) => setNotifs((p) => ({ ...p, billing: v }))} last />
      </Card>

      <SectionHeader title="Active sessions" subtitle="Devices currently signed in to your account." />

      <Card noPad>
        <SessionRow Icon={Monitor} device="MacBook Pro · Chrome" location="Paris, FR"
          last="Active now" current />
        <SessionRow Icon={Smartphone} device="iPhone 15 · Safari" location="Lyon, FR"
          last="2 hours ago" />
      </Card>

      <SectionHeader title="Danger zone" subtitle="" />

      <div style={{
        background: "rgba(220,38,38,0.04)",
        border: "1px solid rgba(220,38,38,0.4)",
        padding: "16px 18px", marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertTriangle size={18} style={{ color: "var(--down)", flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--down)" }}>
              Delete this account
            </div>
            <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 4, lineHeight: 1.5 }}>
              Once you delete your account, there is no going back. All your saved lists, team members and CRM sync history will be permanently removed.
            </div>
            <button style={{
              ...S, fontSize: 12, fontWeight: 500,
              height: 32, padding: "0 14px",
              background: "var(--down)", color: "#fff",
              border: "none", cursor: "pointer",
              marginTop: 12,
            }}>
              Delete my account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SHARED ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginTop: 24, marginBottom: 12 }}>
      <h2 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: 0 }}>{title}</h2>
      {subtitle && (
        <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "2px 0 0" }}>{subtitle}</p>
      )}
    </div>
  );
}

function Card({ children, noPad }: { children: React.ReactNode; noPad?: boolean }) {
  return (
    <div style={{
      background: "var(--bg-raise)",
      border: "1px solid var(--border)",
      padding: noPad ? 0 : "16px 18px",
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {label}
        </label>
        {hint && (
          <span style={{ ...M, fontSize: 9, color: "var(--up)", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Check size={9} /> {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function NotifRow({
  label, checked, onChange, last,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <label style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: last ? "none" : "1px solid var(--border)",
      cursor: "pointer", userSelect: "none",
    }}>
      <span style={{ ...S, fontSize: 13, color: "var(--fg)" }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 32, height: 18, padding: 2,
          background: checked ? "var(--fg)" : "var(--border)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center",
          borderRadius: 10, transition: "background 0.15s",
        }}
      >
        <div style={{
          width: 14, height: 14,
          background: checked ? "var(--bg)" : "var(--bg-raise)",
          borderRadius: 7,
          transform: `translateX(${checked ? 14 : 0}px)`,
          transition: "transform 0.15s",
        }} />
      </button>
    </label>
  );
}

function SessionRow({
  Icon, device, location, last, current,
}: {
  Icon: React.ElementType;
  device: string;
  location: string;
  last: string;
  current?: boolean;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr 1fr 1fr auto",
      alignItems: "center", gap: 12,
      padding: "12px 18px",
      borderBottom: "1px solid var(--border)",
    }}>
      <Icon size={16} style={{ color: "var(--fg-muted)" }} />
      <div>
        <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>
          {device}{current && <span style={{ ...M, fontSize: 8, marginLeft: 8, padding: "1px 4px", background: "var(--up)", color: "#fff", letterSpacing: "0.06em" }}>CURRENT</span>}
        </div>
      </div>
      <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>{location}</div>
      <div style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{last}</div>
      <button
        disabled={current}
        style={{
          ...S, fontSize: 11,
          padding: "4px 10px",
          background: "transparent",
          border: "1px solid var(--border)",
          color: current ? "var(--fg-dim)" : "var(--down)",
          cursor: current ? "not-allowed" : "pointer",
          opacity: current ? 0.4 : 1,
        }}
      >
        Revoke
      </button>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  ...S, fontSize: 12, fontWeight: 500,
  height: 32, padding: "0 14px",
  background: "var(--fg)", color: "var(--bg)",
  border: "none", cursor: "pointer",
};
