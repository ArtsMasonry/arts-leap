// Server-only detail page: /documents/{type}/{id}
// No Firebase yet — just a safe placeholder that parses the URL.

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SupportedType = "ESTIMATE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE";

function normalizeType(input: string | undefined): SupportedType | null {
  if (!input) return null;
  // accept `change-order` or `change_order`, normalize to CHANGE_ORDER
  const t = input.toUpperCase().replace("-", "_") as SupportedType;
  const allowed: SupportedType[] = ["ESTIMATE", "CONTRACT", "CHANGE_ORDER", "INVOICE"];
  return allowed.includes(t) ? t : null;
}

export default function DocumentDetailPage({
  params,
}: {
  params: { type: string; id: string };
}) {
  const type = normalizeType(params.type);
  const id = params.id || "";

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Document</h1>

      {!type || !id ? (
        <p className="mt-3 text-red-700">
          Invalid path: <code className="font-mono">/documents/{params.type}/{params.id}</code>
        </p>
      ) : (
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="grid gap-2 text-sm text-gray-800">
            <div><span className="font-medium">Type:</span> {type}</div>
            <div><span className="font-medium">ID:</span> <span className="font-mono break-all">{id}</span></div>
            <div className="text-gray-600 mt-2">
              (Placeholder — we’ll render real {type.toLowerCase().replace("_", " ")} data here next.)
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
