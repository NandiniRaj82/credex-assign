export default function NotFound() {
  return (
    <div
      style={{
        background: "var(--color-bg-base)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 80,
            margin: "0 0 16px",
            lineHeight: 1,
          }}
        >
          🔍
        </p>
        <h1
          style={{
            fontSize: 28,
            marginBottom: 12,
            color: "var(--color-text-primary)",
          }}
        >
          Audit not found
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 16,
            marginBottom: 32,
            maxWidth: 400,
          }}
        >
          This audit link may have expired or the ID is incorrect. Run a new
          audit — it only takes 2 minutes.
        </p>
        <a
          href="/audit"
          className="btn btn-primary"
          id="not-found-cta"
          style={{ textDecoration: "none", display: "inline-flex" }}
        >
          Run a new audit →
        </a>
      </div>
    </div>
  );
}
