"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * We use a compound key in the URL: /documents/{TYPE}:{id}
 * Example: /documents/ESTIMATE:abc123
 */
type SupportedType = "ESTIMATE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE";

type Estimate = {
  title?: string;
  status?: string;
  total?: number;
  customerName?: string;
  jobNumber?: string | null;
  number?: string;
  createdAt?: any;
};

function formatWhen(ts?: any) {
  try {
    if (!ts || typeof ts.toDate !== "function") return "";
    const d = ts.toDate() as Date;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}
function money(n?: number) {
  return typeof n === "number"
    ? n.toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "";
}

export default function DocumentDetailPage({ params }: { params: { docKey: string } }) {
  const { docKey } = params;

  const [type, id] = useMemo(() => {
    const idx = docKey.indexOf(":");
    if (idx === -1) return [null, null] as const;
    const t = docKey.slice(0, idx).toUpperCase() as SupportedType;
    const i = docKey.slice(idx + 1);
    return [t, i] as const;
  }, [docKey]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [estimate, setEstimate] = useState<Estimate | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!type || !id) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        if (type === "ESTIMATE") {
          const snap = await getDoc(doc(db, "estimates", id));
          if (!snap.exists()) {
            setNotFound(true);
          } else {
            setEstimate((snap.data() as Estimate) ?? null);
          }
          setLoading(false);
          return;
        }

        // other types will be added here later
        setNotFound(true);
        setLoading(false);
      } catch {
        setNotFound(true);
        setLoading(false);
      }
    };
    run();
  }, [type, id]);

  if (!type || !id) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Document</h1>
        <p className="text-gray-700 mt-2">Invalid document key.</p>
        <Link href="/documents" className="inline-block mt-4 rounded-xl border px-4 py-2 hover:bg-gray-50">← Back to Documents</Link>
      </main>
    );
  }

  if (loading) {
    return <main className="p-6">Loading…</main>;
  }

  if (notFound) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Document</h1>
        <p className="text-gray-700 mt-2">No {type.toLowerCase().replace("_"," ")} found for ID <code>{id}</code>.</p>
        <Link href="/documents" className="inline-block mt-4 rounded-xl border px-4 py-2 hover:bg-gray-50">← Back to Documents</Link>
      </main>
    );
  }

  // Render ESTIMATE detail (others later)
  if (type === "ESTIMATE" && estimate) {
    const title = estimate.title || "Estimate";
    const status = (estimate.status || "DRAFT").toString().toUpperCase();
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="text-gray-600 mt-1">Type: Estimate</div>

        <section className="mt-4 rounded-2xl border bg-white p-4">
          <div className="grid gap-2 text-sm text-gray-700">
            <div><span className="font-medium">Status:</span> {status}</div>
            {estimate.number ? <div><span className="font-medium">Number:</span> {estimate.number}</div> : null}
            {estimate.customerName ? <div><span className="font-medium">Customer:</span> {estimate.customerName}</div> : null}
            {estimate.jobNumber ? <div><span className="font-medium">Job #:</span> {estimate.jobNumber}</div> : null}
            <div><span className="font-medium">Created:</span> {formatWhen(estimate.createdAt)}</div>
            {typeof estimate.total === "number" ? (
              <div><span className="font-medium">Total:</span> {money(estimate.total)}</div>
            ) : null}
          </div>
        </section>

        <div className="mt-4">
          <Link href="/documents" className="rounded-xl border px-4 py-2 hover:bg-gray-50">← Back to Documents</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Document</h1>
      <p className="text-gray-700 mt-2">Unsupported type: {type}</p>
      <Link href="/documents" className="inline-block mt-4 rounded-xl border px-4 py-2 hover:bg-gray-50">← Back to Documents</Link>
    </main>
  );
}
