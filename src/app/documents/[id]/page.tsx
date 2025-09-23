import Link from "next/link";

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Document</h1>
      <p className="text-gray-600 mt-2">
        ID: <span className="font-mono">{id}</span>
      </p>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        <p className="text-gray-700">
          This is a placeholder for the document detail screen.
        </p>
        <p className="text-gray-700 mt-2">
          Next: we can render the document based on its type (Estimate, Contract, etc.) and wire the PDF.
        </p>
      </div>

      <div className="mt-4">
        <Link href="/documents" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
          ← Back to Documents
        </Link>
      </div>
    </main>
  );
}
