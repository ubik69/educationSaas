"use client";

// Replaces the framework's builtin global-error boundary. Must render its own
// <html>/<body> because it sits above the root layout.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#08090a",
          color: "#f4f4f5",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "0 1.25rem" }}>
          <p
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.72rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#71717a",
            }}
          >
            Application error
          </p>
          <h1
            style={{
              marginTop: "0.75rem",
              fontSize: "1.75rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            Something broke at the root.
          </h1>
          <p style={{ marginTop: "1rem", color: "#a1a1aa" }}>
            Please reload the application.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              height: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              backgroundColor: "#34d399",
              color: "#000",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
