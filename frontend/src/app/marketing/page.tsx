"use client";

import Link from "next/link";
import {
  Sparkles, Activity, Bot, ShieldCheck, Plug, Wand2,
  Check, X, ArrowRight, Star,
} from "lucide-react";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

const FEATURES = [
  { Icon: Sparkles,    title: "AI-native search",       desc: "Describe what you're looking for in plain English. No keyword juggling, no SIC codes." },
  { Icon: Activity,    title: "Intent-to-Sell signals", desc: "Spot companies likely to sell before competitors — founder retirement, PE hold timers, leadership changes." },
  { Icon: Bot,         title: "AI Screener",            desc: "Automated analyst that screens long lists in minutes. Add custom columns with natural language prompts." },
  { Icon: ShieldCheck, title: "Verified contact data",  desc: "430M+ professionals with verified emails and phones. Last-verified timestamps on every record." },
  { Icon: Plug,        title: "CRM integrations",       desc: "HubSpot, Salesforce, Affinity, DealCloud — bidirectional sync, automatic dedup, last-contact awareness." },
  { Icon: Wand2,       title: "Custom enrichment",      desc: "Add any data point with natural language prompts. Your analyst time, but 10x faster." },
];

const COMPARISON_ROWS = [
  { feature: "AI-native search",          inven: "yes", pitchbook: "no",  sourcescrub: "no",  grata: "partial" },
  { feature: "Intent-to-sell signals",    inven: "yes", pitchbook: "no",  sourcescrub: "no",  grata: "no"      },
  { feature: "Hit-rate transparency",     inven: "yes", pitchbook: "no",  sourcescrub: "no",  grata: "no"      },
  { feature: "Pricing transparency",      inven: "yes", pitchbook: "no",  sourcescrub: "no",  grata: "no"      },
  { feature: "Lower-mid market coverage", inven: "yes", pitchbook: "partial", sourcescrub: "partial", grata: "partial" },
];

const LOGOS = ["BlackRock", "KKR", "Carlyle", "Apollo", "TPG", "Bain Capital", "Permira", "EQT"];

export default function MarketingPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh" }}>
      {/* Top bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        height: 56, padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26,
            background: "var(--fg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 4,
          }}>
            <span style={{ ...M, fontSize: 12, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.04em" }}>Ed</span>
          </div>
          <span style={{ ...S, fontSize: 14, fontWeight: 600 }}>EdRCF</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <a href="#features"   style={navLink}>Product</a>
          <a href="#solutions"  style={navLink}>Solutions</a>
          <a href="#compare"    style={navLink}>Compare</a>
          <a href="#pricing"    style={navLink}>Pricing</a>
          <Link href="/auth/login" style={{ ...navLink, color: "var(--fg)" }}>Sign in</Link>
          <Link href="/auth/register" style={primaryCta}>Book a demo</Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={heroSection}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", marginBottom: 24,
            background: "var(--bg-raise)",
            border: "1px solid var(--border)",
            ...M, fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            <Sparkles size={11} /> AI-native deal sourcing
          </div>

          <h1 style={{
            ...S, fontSize: 56, fontWeight: 700, lineHeight: 1.05,
            color: "var(--fg)", letterSpacing: "-0.02em",
            margin: "0 0 18px",
          }}>
            Find M&amp;A targets others miss
          </h1>

          <p style={{ ...S, fontSize: 18, color: "var(--fg-muted)", lineHeight: 1.55, maxWidth: 640, margin: "0 auto 32px" }}>
            AI-native deal sourcing for private equity, M&amp;A advisors, and corporate development teams. Search 16M+ companies, surface intent-to-sell signals, and enrich contacts on demand.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/register" style={primaryCta}>
              Book a demo <ArrowRight size={13} />
            </Link>
            <Link href="/" style={secondaryCta}>
              Get started for free
            </Link>
          </div>

          <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 28 }}>
            Trusted by 1,000+ private equity firms, investment banks, and consulting teams.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "0 24px" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
          background: "var(--bg-raise)", border: "1px solid var(--border)",
        }}>
          {[
            { val: "16M+",   lab: "Companies tracked" },
            { val: "430M+",  lab: "Professional contacts" },
            { val: "93%",    lab: "Top-result accuracy" },
            { val: "10×",    lab: "Faster sourcing" },
          ].map((s, i) => (
            <div key={s.lab} style={{
              padding: "26px 22px",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
              textAlign: "center",
            }}>
              <div style={{ ...S, fontSize: 36, fontWeight: 700, lineHeight: 1, color: "var(--fg)", letterSpacing: "-0.02em" }}>
                {s.val}
              </div>
              <div style={{ ...M, fontSize: 9, color: "var(--fg-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8 }}>
                {s.lab}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LOGO WALL */}
      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
          <p style={{ ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 22 }}>
            Trusted by industry leaders
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
          }}>
            {LOGOS.map((logo) => (
              <div key={logo} style={{
                height: 60,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-raise)",
                border: "1px solid var(--border)",
                ...S, fontSize: 14, fontWeight: 600,
                color: "var(--fg-muted)",
                letterSpacing: "-0.01em",
              }}>
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "60px 24px", background: "var(--bg-raise)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ ...S, fontSize: 36, fontWeight: 700, color: "var(--fg)", margin: 0, letterSpacing: "-0.02em" }}>
              Everything you need to find your next deal
            </h2>
            <p style={{ ...S, fontSize: 16, color: "var(--fg-muted)", marginTop: 12, maxWidth: 580, margin: "12px auto 0", lineHeight: 1.5 }}>
              From thesis to longlist to enriched contacts — in one platform.
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
          }}>
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                padding: "20px 22px",
              }}>
                <div style={{
                  width: 32, height: 32, marginBottom: 14,
                  background: "var(--bg-raise)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} style={{ color: "var(--fg)" }} />
                </div>
                <h3 style={{ ...S, fontSize: 16, fontWeight: 600, color: "var(--fg)", margin: 0 }}>{title}</h3>
                <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginTop: 8, lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ ...S, fontSize: 32, fontWeight: 700, color: "var(--fg)", margin: 0, letterSpacing: "-0.02em" }}>
              How we compare
            </h2>
            <p style={{ ...S, fontSize: 14, color: "var(--fg-muted)", marginTop: 10 }}>
              EdRCF vs the legacy deal-sourcing tools.
            </p>
          </div>

          <div style={{ background: "var(--bg-raise)", border: "1px solid var(--border)" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
              gap: 0, padding: "14px 18px",
              background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
              ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              <span>Feature</span>
              <span style={{ textAlign: "center", color: "var(--fg)", fontWeight: 700 }}>EdRCF</span>
              <span style={{ textAlign: "center" }}>PitchBook</span>
              <span style={{ textAlign: "center" }}>Sourcescrub</span>
              <span style={{ textAlign: "center" }}>Grata</span>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.feature} style={{
                display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                gap: 0, padding: "12px 18px", alignItems: "center",
                borderBottom: i === COMPARISON_ROWS.length - 1 ? "none" : "1px solid var(--border)",
                ...S, fontSize: 13, color: "var(--fg)",
              }}>
                <span>{row.feature}</span>
                <span style={{ textAlign: "center" }}><Mark v={row.inven} highlight /></span>
                <span style={{ textAlign: "center" }}><Mark v={row.pitchbook} /></span>
                <span style={{ textAlign: "center" }}><Mark v={row.sourcescrub} /></span>
                <span style={{ textAlign: "center" }}><Mark v={row.grata} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ padding: "60px 24px", background: "var(--bg-raise)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 18 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} size={14} fill="var(--fg)" stroke="var(--fg)" />
            ))}
          </div>
          <blockquote style={{
            ...S, fontSize: 22, fontWeight: 500, lineHeight: 1.45,
            color: "var(--fg)", margin: 0, letterSpacing: "-0.01em",
          }}>
            &ldquo;EdRCF has become my most valuable tool when searching for strategic buyers and acquisition targets. What used to take an analyst hours to compile can now be completed in minutes.&rdquo;
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: "#0EA5E9",
              display: "flex", alignItems: "center", justifyContent: "center",
              ...M, fontSize: 12, color: "#fff", fontWeight: 700,
            }}>
              MD
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ ...S, fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>Marc Dupont</div>
              <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>M&amp;A Advisor</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ ...S, fontSize: 32, fontWeight: 700, color: "var(--fg)", margin: 0, letterSpacing: "-0.02em" }}>
              Simple, transparent pricing
            </h2>
            <p style={{ ...S, fontSize: 14, color: "var(--fg-muted)", marginTop: 10 }}>
              No hidden fees. No discount theater. Volume discounts available beyond 25 seats.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <PricingCard
              name="Starter"
              price="Contact sales"
              desc="For solo searchers and small advisors."
              features={["1 seat", "5,000 companies/month", "100 contact unlocks", "1 CRM integration"]}
            />
            <PricingCard
              name="Professional"
              price="$10,000"
              priceSuffix="/ user / year"
              desc="For PE firms and M&A advisors."
              features={["5+ seats", "Unlimited search", "1,000 contact credits/year", "All CRM integrations", "AI Screener", "Intent-to-Sell signals"]}
              featured
            />
            <PricingCard
              name="Enterprise"
              price="Contact sales"
              desc="For institutional teams with API access."
              features={["Custom seat count", "API access", "Dedicated CSM", "SOC 2 compliance", "Custom data sources"]}
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 24px", background: "var(--bg-raise)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...S, fontSize: 36, fontWeight: 700, color: "var(--fg)", margin: 0, letterSpacing: "-0.02em" }}>
            Ready to find your next deal?
          </h2>
          <p style={{ ...S, fontSize: 16, color: "var(--fg-muted)", marginTop: 12 }}>
            Join 1,000+ teams that source 10× faster with EdRCF.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/auth/register" style={primaryCta}>
              Book a demo <ArrowRight size={13} />
            </Link>
            <Link href="/" style={secondaryCta}>
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "48px 24px 24px", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, background: "var(--fg)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
                  <span style={{ ...M, fontSize: 12, fontWeight: 700, color: "var(--bg)", letterSpacing: "0.04em" }}>Ed</span>
                </div>
                <span style={{ ...S, fontSize: 14, fontWeight: 600 }}>EdRCF</span>
              </div>
              <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.6 }}>
                AI-native deal sourcing for the modern M&amp;A team.
              </p>
            </div>
            <FooterCol title="Product" links={[
              { label: "Search",            href: "/" },
              { label: "Lists",             href: "/pipeline" },
              { label: "Imports",           href: "/imports" },
              { label: "API",               href: "/settings/api" },
            ]} />
            <FooterCol title="Solutions" links={[
              { label: "Private Equity",        href: "#" },
              { label: "M&A Advisors",          href: "#" },
              { label: "Corporate Development", href: "#" },
              { label: "Search Funds",          href: "#" },
            ]} />
            <FooterCol title="Resources" links={[
              { label: "Documentation",  href: "/settings/api" },
              { label: "Changelog",      href: "#" },
              { label: "Customer Stories", href: "#" },
              { label: "Compare",        href: "#compare" },
            ]} />
            <FooterCol title="Company" links={[
              { label: "About",          href: "#" },
              { label: "Careers",        href: "#" },
              { label: "Contact",        href: "#" },
              { label: "Privacy",        href: "#" },
            ]} />
          </div>
          <div style={{
            paddingTop: 24, borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            ...M, fontSize: 10, color: "var(--fg-dim)", letterSpacing: "0.06em",
          }}>
            <span>© 2026 EdRCF. All rights reserved.</span>
            <span>
              <a href="#" style={footerLink}>Privacy</a>
              <span style={{ margin: "0 10px" }}>·</span>
              <a href="#" style={footerLink}>Terms</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Mark({ v, highlight }: { v: string; highlight?: boolean }) {
  if (v === "yes") return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 10, background: highlight ? "var(--up)" : "var(--bg-alt)" }}>
      <Check size={12} style={{ color: highlight ? "#fff" : "var(--up)" }} />
    </span>
  );
  if (v === "no") return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 10, background: "var(--bg-alt)" }}>
      <X size={12} style={{ color: "var(--down)" }} />
    </span>
  );
  return (
    <span style={{ ...M, fontSize: 9, padding: "2px 6px", background: "var(--bg-alt)", color: "var(--fg-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
      Partial
    </span>
  );
}

function PricingCard({
  name, price, priceSuffix, desc, features, featured,
}: {
  name: string;
  price: string;
  priceSuffix?: string;
  desc: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div style={{
      background: "var(--bg-raise)",
      border: featured ? "2px solid var(--fg)" : "1px solid var(--border)",
      padding: "26px 24px",
      position: "relative",
    }}>
      {featured && (
        <span style={{
          position: "absolute", top: -10, right: 16,
          padding: "3px 8px",
          background: "var(--fg)", color: "var(--bg)",
          ...M, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          Most popular
        </span>
      )}
      <h3 style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)", margin: 0 }}>{name}</h3>
      <div style={{ marginTop: 10, marginBottom: 6 }}>
        <span style={{ ...S, fontSize: 32, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em" }}>{price}</span>
        {priceSuffix && <span style={{ ...S, fontSize: 13, color: "var(--fg-muted)", marginLeft: 6 }}>{priceSuffix}</span>}
      </div>
      <p style={{ ...S, fontSize: 12, color: "var(--fg-muted)", margin: "8px 0 18px", lineHeight: 1.5 }}>{desc}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", display: "flex", flexDirection: "column", gap: 8 }}>
        {features.map((f) => (
          <li key={f} style={{ ...S, fontSize: 12, color: "var(--fg)", display: "flex", alignItems: "flex-start", gap: 8 }}>
            <Check size={12} style={{ color: "var(--up)", marginTop: 3, flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/auth/register"
        style={{
          display: "block", textAlign: "center",
          ...S, fontSize: 12, fontWeight: 500,
          padding: "9px 14px",
          background: featured ? "var(--fg)" : "transparent",
          color: featured ? "var(--bg)" : "var(--fg)",
          border: featured ? "none" : "1px solid var(--border)",
          textDecoration: "none",
        }}
      >
        Get started
      </Link>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 style={{ ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px" }}>
        {title}
      </h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} style={{ ...S, fontSize: 12, color: "var(--fg-muted)", textDecoration: "none" }}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────

const navLink: React.CSSProperties = {
  ...S, fontSize: 13, color: "var(--fg-muted)", textDecoration: "none",
};

const primaryCta: React.CSSProperties = {
  ...S, fontSize: 13, fontWeight: 500,
  height: 36, padding: "0 16px",
  background: "var(--fg)", color: "var(--bg)",
  textDecoration: "none",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
};

const secondaryCta: React.CSSProperties = {
  ...S, fontSize: 13, fontWeight: 500,
  height: 36, padding: "0 16px",
  background: "transparent", color: "var(--fg)",
  border: "1px solid var(--border)", textDecoration: "none",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
};

const footerLink: React.CSSProperties = {
  color: "var(--fg-dim)", textDecoration: "none",
};

const heroSection: React.CSSProperties = {
  background: "radial-gradient(80% 60% at 50% 0%, var(--bg-raise) 0%, var(--bg) 70%)",
};
