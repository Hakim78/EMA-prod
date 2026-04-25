"use client";

import ContactUnlockButton, { type UnlockedContact } from "./ContactUnlockButton";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

export interface KeyContact {
  id: string;
  name: string;
  role: string;
  verified: boolean;
}

interface Props {
  contacts: KeyContact[];
  companyName?: string;
}

const MOCK_DOMAINS = ["acme-corp.com", "polymer-tech.fr", "atlas-comp.com"];

export default function ContactsSection({ contacts, companyName }: Props) {
  const fakeUnlock = async (c: KeyContact): Promise<UnlockedContact> => {
    await new Promise((r) => setTimeout(r, 700));
    const domain = MOCK_DOMAINS[c.id.charCodeAt(0) % MOCK_DOMAINS.length];
    const local = c.name.toLowerCase().replace(/\s+/g, ".");
    return {
      email: `${local}@${domain}`,
      phone: c.verified ? "+33 1 " + Math.floor(10 + Math.random() * 89) + " " + Math.floor(10 + Math.random() * 89) + " " + Math.floor(10 + Math.random() * 89) + " " + Math.floor(10 + Math.random() * 89) : undefined,
    };
  };

  return (
    <section style={{ marginTop: 18 }}>
      <header style={{ marginBottom: 10 }}>
        <h3 style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
          Key Contacts
        </h3>
        <p style={{ ...M, fontSize: 9, color: "var(--fg-dim)", margin: "2px 0 0", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          430M+ verified professionals · sourced from public records & social signals
        </p>
      </header>

      <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)" }}>
        {contacts.map((c, i) => (
          <div key={c.id} style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 12, padding: "10px 14px", alignItems: "center",
            borderBottom: i === contacts.length - 1 ? "none" : "1px solid var(--border)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15, flexShrink: 0,
              background: hashColor(c.name),
              display: "flex", alignItems: "center", justifyContent: "center",
              ...M, fontSize: 11, color: "#fff", fontWeight: 700,
            }}>
              {initials(c.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...S, fontSize: 13, fontWeight: 500, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.name}
              </div>
              <div style={{ ...S, fontSize: 11, fontStyle: "italic", color: "var(--fg-muted)", marginTop: 2 }}>
                {c.role}{companyName && ` · ${companyName}`}
              </div>
            </div>
            <ContactUnlockButton
              contactId={c.id}
              verified={c.verified}
              onUnlock={() => fakeUnlock(c)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function hashColor(s: string): string {
  const colors = ["#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ─── DEFAULT MOCK CONTACTS ───────────────────────────────────────────────────

export const DEFAULT_KEY_CONTACTS: KeyContact[] = [
  { id: "k1", name: "Pierre Lambert",   role: "CEO & Founder",          verified: true  },
  { id: "k2", name: "Élodie Marchand",  role: "CFO",                    verified: true  },
  { id: "k3", name: "Jean-Marc Petit",  role: "Head of M&A",            verified: false },
  { id: "k4", name: "Camille Dubois",   role: "Head of Strategy",       verified: true  },
];
