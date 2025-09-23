// Minimal, server-only page to prove the route works.
// No Suspense, no client components, no Firestore.

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SupportedType = "ESTIMATE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE";

function parseKey(docKey: string): { type: SupportedType | null; id: string | null } {
  try {
    const decoded = decodeURIComponent(docKey || "");
    const idx = decoded.indexOf(":");
    if (idx === -1) return { type: null, id: null };
    const type = decoded.slice(0, idx).toUpperCase() as SupportedType;
    const id = decoded.slice(idx + 1);
    return { type, id };
  } catch {
    return { type: null, id: null };
  }
}

export default function DocumentDetailServer({
  params,
}: {
  params: { docKey: string };
}) {
  const { type, id } = parseKey(params.docKey);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Document (Server Only)</h1>
      {!type || !id ? (
        <p className="mt-3 text-red-700">
          Invalid document key: <code className="font-mono">{params.docKey}</code>
        </p>
      ) : (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="grid gap-2 text-sm text-gray-800">
            <div>
              <span className="font-medium">Type:</span>{" "}
              <span>{type}</span>
            </div>
            <div>
              <span className="font-medium">ID:</span>{" "}
              <span className="font-mono">{id}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <a href="/documents" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
          ← Back to Documents
        </a>
      </div>
    </main>
  );
}
