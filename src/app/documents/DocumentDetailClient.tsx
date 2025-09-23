"use client";

import Link from "next/link";
import { useMemo } from "react";

type SupportedType = "ESTIMATE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE";

export default function DocumentDetailClient({ docKey }: { docKey: string }) {
  // Be tolerant of weird encodings
  const decodedKey = useMemo(() => {
    try { return decodeURIComponent(docKey); } catch { return docKey; }
  }, [docKey]);

  const [type, id] = useMemo(() => {
    const idx = decodedKey.indexOf(":");
    if (idx === -1) return [null, null] as const;
    const t = decodedKey.slice(0, idx).toUpperCase() as SupportedType;
    const i = decodedKey.slice(idx + 1);
    return [t, i] as const;
  }, [decodedKey]);

  if (!type || !id) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Document</h1>
        <p className="text-gray-700 mt-2">Invalid document key.</p>
        <Link href="/documents" className="inline-block mt-4 rounded-xl border px-4 py-2 hover:bg-gray-50">
          ← Back to Documents
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Document</h1>
      <div className="text-gray-600 mt-1">Parsed OK</div>

      <section className="mt-4 rounded-2xl border bg-white p-4">
        <div className="grid gap-2 text-sm text-gray-700">
          <div><span className="font-medium">Type:</span> {type}</div>
          <div><span className="font-medium">ID:</span> <span className="font-mono">{id}</span></div>
          <div className="text-gray-600 mt-2">
            (Temporary diagnostic component – no Firestore calls yet.)
          </div>
        </div>
      </section>

      <div className="mt-4">
        <Link href="/documents" className="rounded-xl border px-4 py-2 hover:bg-gray-50">
          ← Back to Documents
        </Link>
      </div>
    </main>
  );
}
