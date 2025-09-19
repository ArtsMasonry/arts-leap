/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

function money(n: number | undefined) {
  const v = typeof n === "number" ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function EstimateViewPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [est, setEst] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "estimates", id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setEst(snap.exists() ? ({ id: snap.id, ...snap.data() } as any) : null);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [id]);

  const subtotal = useMemo(() => est?.subtotal ?? 0, [est]);
  const tax = useMemo(() => est?.tax ?? 0, [est]);
  const total = useMemo(() => est?.total ?? 0, [est]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!est) return <main style={{ padding: 24 }}>Not found.</main>;

  return (
    <main
      style={{
        maxWidth: 800,
        margin: "24px auto",
        padding: 24,
        background: "white",
        color: "#111",
        borderRadius: 12,
        border: "1px solid #eee",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{est.title || "Estimate"}</h1>
        <button onClick={() => window.print()}>Print</button>
      </div>

      <div style={{ marginTop: 8, color: "#555" }}>
        <div><strong>Customer:</strong> {est.customer}</div>
        {est.createdAt?.toDate && (
          <div>
            <strong>Date:</strong>{" "}
            {est.createdAt.toDate().toLocaleDateString()}
          </div>
        )}
        <div><strong>ID:</strong> {est.id}</div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Description</th>
            <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Qty</th>
            <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Unit</th>
            <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Line Total</th>
          </tr>
        </thead>
        <tbody>
          {(est.items ?? []).map((it: any, i: number) => (
            <tr key={i}>
              <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{it.description}</td>
              <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{it.qty}</td>
              <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{money(it.unitPrice)}</td>
              <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{money(it.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {est.notes ? (
        <div style={{ marginTop: 16 }}>
          <strong>Notes:</strong>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{est.notes}</div>
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 16, fontSize: 16 }}>
        <div>Subtotal: <strong>{money(subtotal)}</strong></div>
        <div>Tax: <strong>{money(tax)}</strong></div>
        <div>Total: <strong>{money(total)}</strong></div>
      </div>

      <style>{`
        @media print {
          button { display: none; }
          body { background: white; }
        }
      `}</style>
    </main>
  );
}
