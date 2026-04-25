"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet, Upload, Check, AlertCircle, Loader2,
  Download, FolderPlus, ArrowRight, X,
} from "lucide-react";
import { createList } from "@/lib/lists";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

type Step = "idle" | "uploading" | "matching" | "review" | "enriched";

const STEPS: { key: Step; label: string }[] = [
  { key: "uploading", label: "Upload" },
  { key: "matching", label: "Matching" },
  { key: "review", label: "Review" },
  { key: "enriched", label: "Enriched" },
];

const MOCK_PREVIEW: Array<{
  name: string; url: string; status: "found" | "not-found"; confidence: number;
}> = [
  { name: "Acme Industries",       url: "acme-industries.com",     status: "found",     confidence: 98 },
  { name: "Bordeaux Logistics",    url: "bordeaux-logistics.fr",   status: "found",     confidence: 95 },
  { name: "Polymer Tech SAS",      url: "polymertech.fr",          status: "found",     confidence: 92 },
  { name: "Régale Foods",          url: "regalefoods.fr",          status: "found",     confidence: 88 },
  { name: "Atlas Composants",      url: "atlas-comp.com",          status: "found",     confidence: 84 },
  { name: "Nordique Marine",       url: "nordique-marine.com",     status: "found",     confidence: 81 },
  { name: "Studio Brittany",       url: "studio-brittany.fr",      status: "not-found", confidence: 0  },
  { name: "Thermal Group",         url: "thermalgroup.eu",         status: "found",     confidence: 79 },
  { name: "Vins de Provence Co.",  url: "vinsprovence.fr",         status: "found",     confidence: 77 },
  { name: "Médic Express",         url: "medic-express.fr",        status: "not-found", confidence: 0  },
];

export default function ImportsPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [filename, setFilename] = useState<string | null>(null);
  const [matchProgress, setMatchProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [listName, setListName] = useState("Imported targets · " + new Date().toLocaleDateString("en-US"));
  const [error, setError] = useState<string | null>(null);

  const startFlow = (name: string) => {
    setError(null);
    setFilename(name);
    setStep("uploading");
    // simulated upload
    setTimeout(() => {
      setStep("matching");
      setMatchProgress(0);
      let p = 0;
      const tick = () => {
        p += Math.floor(Math.random() * 8) + 4;
        if (p >= 100) {
          setMatchProgress(100);
          setTimeout(() => setStep("review"), 250);
          return;
        }
        setMatchProgress(p);
        setTimeout(tick, 180);
      };
      tick();
    }, 900);
  };

  const onFile = (file: File) => {
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setError("Unsupported file type. Please upload .xlsx or .csv.");
      return;
    }
    startFlow(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  const reset = () => {
    setStep("idle");
    setFilename(null);
    setMatchProgress(0);
    setError(null);
  };

  const finishAndCreateList = () => {
    const list = createList(listName.trim() || "Imported targets");
    if (typeof window !== "undefined") {
      localStorage.setItem("ema_active_list", list.id);
      window.dispatchEvent(new Event("ema_active_list_changed"));
    }
    router.push("/pipeline");
  };

  const totalRows = MOCK_PREVIEW.length;
  const foundRows = MOCK_PREVIEW.filter((r) => r.status === "found").length;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "var(--bg)" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px 64px" }}>
        {/* Title */}
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ ...S, fontSize: 22, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
            Import &amp; Enrich
          </h1>
          <p style={{ ...S, fontSize: 13, color: "var(--fg-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
            Upload an Excel file with company URLs and we&apos;ll match and enrich them with 25+ data points.
          </p>
        </header>

        {/* Stepper */}
        <Stepper currentStep={step} />

        {/* Body */}
        <div style={{ marginTop: 28 }}>
          {step === "idle" && (
            <UploadZone
              dragOver={dragOver}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              error={error}
            />
          )}

          {step === "idle" && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          )}

          {step === "uploading" && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Loader2 size={22} style={{ color: "var(--fg)" }} className="imp-spin" />
                <div>
                  <div style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--fg)" }}>
                    Uploading {filename}…
                  </div>
                  <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                    Reading file and validating columns.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === "matching" && (
            <Card>
              <div style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--fg)", marginBottom: 12 }}>
                Matching companies…
              </div>
              <div style={{ ...M, fontSize: 11, color: "var(--fg-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
                {Math.floor((matchProgress / 100) * totalRows)} / {totalRows} companies — {matchProgress}%
              </div>
              <div style={{ height: 6, background: "var(--bg-alt)", overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{
                  height: "100%", width: `${matchProgress}%`,
                  background: "var(--fg)",
                  transition: "width 0.18s linear",
                }} />
              </div>
            </Card>
          )}

          {step === "review" && (
            <>
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--fg)" }}>
                      Match preview
                    </div>
                    <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                      {foundRows} of {totalRows} companies matched. Review before enrichment.
                    </div>
                  </div>
                  <button
                    onClick={() => setStep("enriched")}
                    style={primaryButton}
                  >
                    Enrich {foundRows} matched companies
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div style={{ marginTop: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 200px 110px 90px",
                    padding: "8px 12px",
                    background: "var(--bg-alt)", borderBottom: "1px solid var(--border)",
                    ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    <span>Company</span>
                    <span>URL</span>
                    <span>Status</span>
                    <span style={{ textAlign: "right" }}>Confidence</span>
                  </div>
                  {MOCK_PREVIEW.map((r) => (
                    <div key={r.name} style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 200px 110px 90px",
                      padding: "8px 12px",
                      borderBottom: "1px solid var(--border)",
                      ...S, fontSize: 12, color: "var(--fg)",
                    }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                      <span style={{ ...M, fontSize: 11, color: "var(--fg-muted)" }}>{r.url}</span>
                      <span>
                        {r.status === "found" ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--up)" }}>
                            <Check size={11} /> Found
                          </span>
                        ) : (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--down)" }}>
                            <AlertCircle size={11} /> Not found
                          </span>
                        )}
                      </span>
                      <span style={{ textAlign: "right", ...M, fontSize: 11, color: r.status === "found" ? "var(--fg-muted)" : "var(--fg-dim)" }}>
                        {r.confidence > 0 ? `${r.confidence}%` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}>
                <button onClick={reset} style={secondaryButton}>
                  <X size={12} /> Cancel and upload another file
                </button>
              </div>
            </>
          )}

          {step === "enriched" && (
            <>
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 18,
                    background: "rgba(34,197,94,0.10)", border: "1px solid var(--up)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={18} style={{ color: "var(--up)" }} />
                  </div>
                  <div>
                    <div style={{ ...S, fontSize: 15, fontWeight: 600, color: "var(--fg)" }}>
                      Successfully enriched {foundRows} of {totalRows} companies
                    </div>
                    <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                      Firmographics, ownership, financials, headcount and contacts have been added.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    onClick={() => alert("Mock download — connect backend to enable real .xlsx export.")}
                    style={secondaryButton}
                  >
                    <Download size={12} /> Download enriched .xlsx
                  </button>
                </div>
              </Card>

              <Card>
                <div style={{ ...S, fontSize: 14, fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>
                  Save as a new list
                </div>
                <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)", marginBottom: 12 }}>
                  Create a new list in My Lists with these {foundRows} matched companies.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    style={{
                      ...S, flex: 1, height: 34, padding: "0 10px",
                      background: "var(--bg)", border: "1px solid var(--border)",
                      color: "var(--fg)", fontSize: 13, outline: "none",
                    }}
                  />
                  <button onClick={finishAndCreateList} style={primaryButton}>
                    <FolderPlus size={12} /> Save as list
                  </button>
                </div>
              </Card>

              <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}>
                <button onClick={reset} style={secondaryButton}>
                  Import another file
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .imp-spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Stepper({ currentStep }: { currentStep: Step }) {
  const order: Step[] = ["uploading", "matching", "review", "enriched"];
  const currentIdx = currentStep === "idle" ? -1 : order.indexOf(currentStep);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const last = i === STEPS.length - 1;
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center", flex: last ? 0 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "var(--fg)" : active ? "var(--bg-raise)" : "var(--bg-alt)",
                border: `1px solid ${done || active ? "var(--fg)" : "var(--border)"}`,
                color: done ? "var(--bg)" : "var(--fg-muted)",
                ...M, fontSize: 10, fontWeight: 700,
                flexShrink: 0,
              }}>
                {done ? <Check size={12} /> : i + 1}
              </div>
              <span style={{
                ...S, fontSize: 12,
                fontWeight: active ? 600 : 400,
                color: done || active ? "var(--fg)" : "var(--fg-muted)",
                whiteSpace: "nowrap",
              }}>
                {s.label}
              </span>
            </div>
            {!last && (
              <div style={{
                flex: 1, height: 1, margin: "0 12px",
                background: done ? "var(--fg)" : "var(--border)",
                minWidth: 24,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function UploadZone({
  dragOver, onDragOver, onDragLeave, onDrop, onClick, error,
}: {
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  error: string | null;
}) {
  return (
    <>
      <div
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? "var(--fg)" : "var(--border)"}`,
          background: dragOver ? "var(--bg-hover)" : "var(--bg-raise)",
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        <div style={{
          width: 52, height: 52, margin: "0 auto 16px",
          borderRadius: 26,
          background: "var(--bg-alt)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FileSpreadsheet size={22} style={{ color: "var(--fg-muted)" }} />
        </div>
        <div style={{ ...S, fontSize: 15, fontWeight: 500, color: "var(--fg)", marginBottom: 4 }}>
          Drag and drop your Excel file here
        </div>
        <div style={{ ...S, fontSize: 12, color: "var(--fg-muted)" }}>
          or <span style={{ color: "var(--fg)", textDecoration: "underline" }}>click to browse</span>
        </div>
        <div style={{
          ...S, fontSize: 11, color: "var(--fg-dim)",
          marginTop: 14, fontStyle: "italic",
          maxWidth: 460, margin: "14px auto 0", lineHeight: 1.5,
        }}>
          A column containing only website addresses (URLs) is mandatory. Keep your file simple with one sheet and one website URL column.
        </div>
        <div style={{
          marginTop: 12,
          display: "inline-flex", alignItems: "center", gap: 4,
          ...M, fontSize: 9, color: "var(--fg-dim)", letterSpacing: "0.1em",
        }}>
          <Upload size={9} /> .XLSX · .XLS · .CSV
        </div>
      </div>
      {error && (
        <div style={{
          marginTop: 12, padding: "8px 12px",
          background: "rgba(220,38,38,0.06)",
          border: "1px solid rgba(220,38,38,0.4)",
          ...S, fontSize: 12, color: "var(--down)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-raise)",
      border: "1px solid var(--border)",
      padding: "16px 18px",
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

const primaryButton: React.CSSProperties = {
  ...S, fontSize: 12, fontWeight: 500,
  height: 32, padding: "0 14px",
  background: "var(--fg)", color: "var(--bg)",
  border: "none", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
};

const secondaryButton: React.CSSProperties = {
  ...S, fontSize: 12, fontWeight: 500,
  height: 32, padding: "0 14px",
  background: "transparent", color: "var(--fg-muted)",
  border: "1px solid var(--border)", cursor: "pointer",
  display: "inline-flex", alignItems: "center", gap: 6,
};
