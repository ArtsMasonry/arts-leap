"use client";

import Link from "next/link";

export default function DocumentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Document</h1>
      <div className="mt-3 rounded-2xl border bg-white p-4">
        <p className="text-red-700">
          Something went wrong loading this document.
        </p>
        <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
          {error?.message || "Unknown error"}
        </pre>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => reset()}
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            Try again
          </button>
          <Link
            href="/documents"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            ← Back to Documents
          </Link>
        </div>
      </div>
    </main>
  );
}

