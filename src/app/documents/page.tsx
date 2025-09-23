// Minimal, server-only placeholder for diagnostics.
// No client imports, no Firebase, no Suspense.

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocumentsPage() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Documents</h1>
      <p className="mt-2 text-gray-700">
        If you’re seeing this page, the /documents route is healthy.
      </p>
      <p className="mt-1 text-gray-600">
        Next, we’ll reintroduce the list client in a tiny, controlled step.
      </p>

      <div className="mt-4">
        <a href="/" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
          ← Back Home
        </a>
      </div>
    </main>
  );
}
