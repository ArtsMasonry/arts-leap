/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

function money(n: number | undefined) {
  const v = typeof n === "number" ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function toDate(d: any): Date | null {
  if (!d) return null;
  // Firestore Timestamp has .toDate()
  if (typeof d.toDate === "function") return d.toDate();
  // fallback if seconds/nanoseconds shape
  if (typeof d.seconds === "number") return new Date(d.seconds * 1000);
  return null;
}

export default function EstimateViewPage({ params }: { params: { id: string } }) {
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

  const items: any[] = useMemo(() => Array.isArray(est?.items) ? est!.items : [], [est]);
  const subtotal = useMemo(() => est?.subtotal ?? items.reduce((s, it) => s + ((+it.qty || 0) * (+it.unitPrice || 0)), 0), [est, items]);
  const tax = useMemo(() => est?.tax ?? 0, [est]);
  const total = useMemo(() => est?.total ?? (subtotal + tax), [subtotal, tax, est]);
  const createdAt = useMemo(() => toDate(est?.createdAt), [est]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!est) return <main style={{ padding: 24 }}>Not found.</main>;

  const status: string = est.status === "approved" ? "approved" : "draft";
  const badgeBg = status === "approved" ? "#e6ffed" : "#f2f2f2";
  const badgeColor = status === "approved" ? "#03643a" : "#555";

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "24px auto",
        padding: 24,
        background: "white",
        color: "#111",
        borderRadius: 12,
        border: "1px solid #eee",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{est.title || "Estimate"}</h1>
          <div style={{ marginTop: 6, color: "#555" }}>
            <div style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 999,
              background: badgeBg,
              color: badgeColor,
              fontSize: 12,
              border: "1px solid #ddd",
              marginRight: 8,
            }}>
              {status === "approved" ? "Approved" : "Draft"}
            </div>
            {createdAt ? (
              <span><strong>Date:</strong> {createdAt.toLocaleDateString()}</span>
            ) : null}
          </div>
          <div style={{ marginTop: 4, color: "#555" }}>
            <strong>Customer:</strong> {est.customer || est.customerName || "—"}
          </div>
          <div style={{ marginTop: 2, color: "#777", fontSize: 12 }}>
            <strong>ID:</strong> {est.id}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
          <Link
            href={`/estimates/${id}/edit`}
            style={{
              textDecoration: "none",
              border: "1px solid #ccc",
              padding: "6px 10px",
              borderRadius: 8,
              background: "white",
            }}
          >
            Edit
          </Link>
          <button onClick={() => window.print()}>Print</button>
          <Link
            href="/estimates"
            style={{
              textDecoration: "none",
              border: "1px solid #ccc",
              padding: "6px 10px",
              borderRadius: 8,
              background: "white",
            }}
          >
            Back to list
          </Link>
        </div>
      </div>

      {/* Items table */}
      <div style={{ marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Description</th>
              <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Qty</th>
              <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Unit Price</th>
              <th style={{ textAlign: "right", padding: 8, borderBottom: "1px solid #ddd" }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 12, color: "#777", textAlign: "center" }}>
                  No items yet.
                </td>
              </tr>
            ) : (
              items.map((it, i) => {
                const qty = Number(it.qty) || 0;
                const unit = Number(it.unitPrice) || 0;
                const line = typeof it.lineTotal === "number" ? it.lineTotal : qty * unit;
                return (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>{it.description || "—"}</td>
                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{qty}</td>
                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{money(unit)}</td>
                    <td style={{ padding: 8, textAlign: "right", borderBottom: "1px solid #f0f0f0" }}>{money(line)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {est.notes ? (
        <div style={{ marginTop: 16 }}>
          <strong>Notes</strong>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{est.notes}</div>
        </div>
      ) : null}

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 16, fontSize: 16 }}>
        <div>Subtotal: <strong>{money(subtotal)}</strong></div>
        <div>Tax: <strong>{money(tax)}</strong></div>
        <div>Total: <strong>{money(total)}</strong></div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          button, a[href] { display: none !important; }
          body { background: white; }
          main { border: none; box-shadow: none; }
        }
      `}</style>
    </main>
  );
}
