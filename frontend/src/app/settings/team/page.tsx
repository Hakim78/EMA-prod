"use client";

import { useState, useMemo } from "react";
import { Trash2, Plus, X, AlertTriangle, Send } from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

type Role = "Admin" | "Member";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActive: string;
  initials: string;
  color: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Hakim Djaalal",    email: "hakim.djaalalom@gmail.com",  role: "Admin",  lastActive: "Active now",   initials: "HD", color: "#4F46E5" },
  { id: "2", name: "Zakaria Khchiche", email: "zakaria@edrcf.com",          role: "Admin",  lastActive: "1 hour ago",   initials: "ZK", color: "#10B981" },
  { id: "3", name: "Léa Martin",       email: "lea.martin@edrcf.com",       role: "Member", lastActive: "2 days ago",   initials: "LM", color: "#F59E0B" },
  { id: "4", name: "Tom Bertrand",     email: "tom.bertrand@edrcf.com",     role: "Member", lastActive: "5 days ago",   initials: "TB", color: "#EC4899" },
  { id: "5", name: "Sophie Petit",     email: "sophie.petit@edrcf.com",     role: "Member", lastActive: "Pending",      initials: "SP", color: "#0EA5E9" },
];

const TOTAL_SEATS = 10;

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);

  const setRole = (id: string, role: Role) => {
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const remove = (id: string) => {
    setMembers((p) => p.filter((m) => m.id !== id));
    setRemoving(null);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ ...S, fontSize: 16, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
            Team members
          </h2>
          <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "4px 0 0" }}>
            <span style={{ ...M, fontSize: 11, color: "var(--fg)" }}>{members.length}</span> of {TOTAL_SEATS} seats used
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          style={{
            ...S, fontSize: 12, fontWeight: 500,
            height: 32, padding: "0 14px",
            background: "var(--fg)", color: "var(--bg)",
            border: "none", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          <Plus size={12} /> Invite members
        </button>
      </div>

      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "auto 1.5fr 1fr 130px 110px 50px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          <span style={{ width: 30 }} />
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Last active</span>
          <span />
        </div>

        {members.map((m) => (
          <div key={m.id} style={{
            display: "grid",
            gridTemplateColumns: "auto 1.5fr 1fr 130px 110px 50px",
            gap: 12, padding: "10px 16px",
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15,
              background: m.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              ...M, fontSize: 11, color: "#fff", fontWeight: 700,
            }}>
              {m.initials}
            </div>
            <div>
              <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)" }}>{m.name}</div>
            </div>
            <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {m.email}
            </div>
            <select
              value={m.role}
              onChange={(e) => setRole(m.id, e.target.value as Role)}
              style={{
                ...S, fontSize: 12, height: 28, padding: "0 8px",
                background: "var(--bg)", border: "1px solid var(--border)",
                color: "var(--fg)", outline: "none", cursor: "pointer",
              }}
            >
              <option>Admin</option>
              <option>Member</option>
            </select>
            <span style={{ ...M, fontSize: 11, color: m.lastActive === "Active now" ? "var(--up)" : "var(--fg-muted)" }}>
              {m.lastActive}
            </span>
            <button
              onClick={() => setRemoving(m)}
              title="Before removing a user, make sure to download or share any important lists"
              style={{
                background: "transparent", border: "none",
                cursor: "pointer", color: "var(--fg-dim)",
                padding: 4, display: "flex", alignItems: "center",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--down)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-dim)")}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <p style={{ ...S, fontSize: 11, color: "var(--fg-dim)", fontStyle: "italic", marginTop: 12, lineHeight: 1.5 }}>
        Need more seats? <a href="mailto:billing@edrcf.com" style={{ color: "var(--fg)", textDecoration: "underline" }}>Contact your account manager</a>.
      </p>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={(emails) => {
        // Mock: just append emails
        const existing = new Set(members.map((m) => m.email));
        const fresh = emails.filter((e) => !existing.has(e));
        const newMembers: Member[] = fresh.map((email, i) => ({
          id: String(Date.now() + i),
          name: email.split("@")[0],
          email,
          role: "Member" as Role,
          lastActive: "Pending",
          initials: email.slice(0, 2).toUpperCase(),
          color: ["#4F46E5","#0EA5E9","#10B981","#F59E0B","#EF4444","#8B5CF6","#EC4899","#14B8A6"][i % 8],
        }));
        setMembers((p) => [...p, ...newMembers]);
        setInviteOpen(false);
      }} />}

      {removing && <RemoveModal member={removing} onCancel={() => setRemoving(null)} onConfirm={() => remove(removing.id)} />}
    </>
  );
}

// ─── INVITE MODAL ────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (emails: string[]) => void }) {
  const [text, setText] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [message, setMessage] = useState("");

  const emails = useMemo(() => {
    return text
      .split(/[,;\s\n]+/)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  }, [text]);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.4)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 520, zIndex: 1000,
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{
          padding: "12px 16px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h3 style={{ ...S, fontSize: 14, fontWeight: 600, margin: 0, color: "var(--fg)" }}>Invite team members</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-muted)", padding: 4, display: "flex" }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: 16 }}>
          <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Email addresses
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="paste@emails.here, separated@by-comma.com or new lines"
            rows={5}
            style={{
              ...S, width: "100%", padding: "8px 10px",
              background: "var(--bg)", border: "1px solid var(--border)",
              color: "var(--fg)", fontSize: 13, outline: "none", resize: "vertical",
            }}
          />
          <p style={{ ...S, fontSize: 11, marginTop: 6, color: emails.length > 0 ? "var(--up)" : "var(--fg-dim)" }}>
            {emails.length} valid email{emails.length !== 1 ? "s" : ""} detected
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Default role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                style={{
                  ...S, width: "100%", height: 34, padding: "0 10px",
                  background: "var(--bg)", border: "1px solid var(--border)",
                  color: "var(--fg)", fontSize: 13, outline: "none", cursor: "pointer",
                }}
              >
                <option>Member</option>
                <option>Admin</option>
              </select>
            </div>
          </div>

          <label style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: 12, marginBottom: 6 }}>
            Personal message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Welcome to the team!"
            rows={2}
            style={{
              ...S, width: "100%", padding: "8px 10px",
              background: "var(--bg)", border: "1px solid var(--border)",
              color: "var(--fg)", fontSize: 13, outline: "none", resize: "vertical",
            }}
          />
        </div>

        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onClose} style={{
            ...S, fontSize: 12, padding: "6px 14px",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--fg-muted)", cursor: "pointer",
          }}>Cancel</button>
          <button
            onClick={() => onInvite(emails)}
            disabled={emails.length === 0}
            style={{
              ...S, fontSize: 12, fontWeight: 500, padding: "6px 14px",
              background: emails.length > 0 ? "var(--fg)" : "var(--bg-alt)",
              color: emails.length > 0 ? "var(--bg)" : "var(--fg-dim)",
              border: "none", cursor: emails.length > 0 ? "pointer" : "not-allowed",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <Send size={11} /> Send {emails.length > 0 ? `${emails.length} ` : ""}invitation{emails.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── REMOVE MODAL ────────────────────────────────────────────────────────────

function RemoveModal({
  member, onCancel, onConfirm,
}: {
  member: Member;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.4)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 440, zIndex: 1000,
        background: "var(--bg-raise)", border: "1px solid var(--border)",
        padding: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18, flexShrink: 0,
            background: "rgba(220,38,38,0.10)", border: "1px solid var(--down)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={16} style={{ color: "var(--down)" }} />
          </div>
          <div>
            <h3 style={{ ...S, fontSize: 14, fontWeight: 600, margin: 0, color: "var(--fg)" }}>
              Remove {member.name}?
            </h3>
            <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
              Before removing a user, make sure to download or share any important lists. This action cannot be undone.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onCancel} style={{
            ...S, fontSize: 12, padding: "6px 14px",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--fg-muted)", cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            ...S, fontSize: 12, fontWeight: 500, padding: "6px 14px",
            background: "var(--down)", color: "#fff",
            border: "none", cursor: "pointer",
          }}>
            Remove user
          </button>
        </div>
      </div>
    </>
  );
}
