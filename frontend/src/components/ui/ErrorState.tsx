"use client";

const M: React.CSSProperties = { fontFamily: "'Space Mono', monospace" };
const S: React.CSSProperties = { fontFamily: "Inter, sans-serif" };

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  if (compact) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", border: "1px solid var(--border)",
        background: "var(--bg-alt)",
      }}>
        <span style={{ ...M, fontSize: 9, color: "var(--signal)", letterSpacing: "0.08em" }}>
          ⚠ {message ?? "ERREUR_API"}
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              ...M, fontSize: 9, padding: "3px 8px",
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--fg-muted)", cursor: "pointer", letterSpacing: "0.06em",
              transition: "border-color 0.1s, color 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
          >
            RÉESSAYER
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: 40,
      background: "var(--bg)",
    }}>
      <div style={{
        width: 40, height: 40,
        border: "1px solid var(--signal)",
        display: "flex", alignItems: "center", justifyContent: "center",
        ...M, fontSize: 18, color: "var(--signal)",
      }}>
        !
      </div>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ ...S, fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>
          Erreur de chargement
        </span>
        <span style={{ ...S, fontSize: 12, color: "var(--fg-muted)", maxWidth: 300, lineHeight: 1.6 }}>
          {message ?? "Impossible de contacter le serveur. Vérifiez votre connexion."}
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            ...M, fontSize: 10, padding: "8px 20px", letterSpacing: "0.1em",
            background: "transparent", border: "1px solid var(--border)",
            color: "var(--fg-muted)", cursor: "pointer",
            transition: "border-color 0.1s, color 0.1s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-muted)"; }}
        >
          RÉESSAYER
        </button>
      )}
    </div>
  );
}
