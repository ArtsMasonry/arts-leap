// Minimal server-only page to prove /documents works.
// No client components, no imports, no Firebase.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocumentsPage() {
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Documents</h1>
      <p style={{ marginTop: 8, color: "#475569" }}>
        Route OK. This is a minimal placeholder. We’ll re-add the list after this confirms.
      </p>
      <a href="/" style={{ display: "inline-block", marginTop: 16, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 12, textDecoration: "none", color: "#111827" }}>
        ? Back Home
      </a>
    </main>
  );
}
