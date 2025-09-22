/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

type PageProps = { params: { id: string } };

type Customer = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
};

type Estimate = {
  id: string;
  title?: string;
  status?: string;
  total?: number;
  createdAt?: any;
};

function formatMoney(n?: number) {
  if (typeof n !== "number") return "$0.00";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
function formatWhen(ts?: any) {
  try {
    if (!ts || typeof ts.toDate !== "function") return "";
    const d = ts.toDate() as Date;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}
function StatusPill({ value }: { value?: string }) {
  const text = value ?? "—";
  const styles: Record<string, { bg: string; color: string }> = {
    draft: { bg: "#f3f4f6", color: "#374151" },
    sent: { bg: "#e0f2fe", color: "#075985" },
    approved: { bg: "#dcfce7", color: "#166534" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = styles[text] || styles.draft;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}
function fullAddress(c?: Customer | null) {
  if (!c) return "";
  const parts = [
    c.address?.trim(),
    [c.city, c.state].filter(Boolean).join(", ").trim(),
    c.zip?.trim(),
  ].filter(Boolean);
  return parts.join(" • ");
}

export default function CustomerDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEst, setLoadingEst] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load customer
  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const snap = await getDoc(doc(db, "customers", id));
        if (!snap.exists()) {
          setError("Customer not found.");
          setLoading(false);
          return;
        }
        if (!alive) return;
        setCustomer((snap.data() as any) || null);
        setLoading(false);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load customer.");
        setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [id]);

  // Live list of this customer's estimates
  useEffect(() => {
    const q = query(
      collection(db, "estimates"),
      where("customerId", "==", id),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Estimate[];
        setEstimates(rows);
        setLoadingEst(false);
      },
      () => setLoadingEst(false)
    );
    return () => unsub();
  }, [id]);

  const estCount = useMemo(() => estimates.length, [estimates]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (error)
    return (
      <main style={{ padding: 24 }}>
        <div style={{ color: "#a40000", background: "#ffecec", padding: 12, borderRadius: 10 }}>
          {error}
        </div>
        <div style={{ marginTop: 12 }}>
          <Link href="/customers">← Back to Customers</Link>
        </div>
      </main>
    );

  const name = customer?.name || "(No name)";

  return (
    <main style={{ maxWidth: 1000, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>{name}</h1>
          <div style={{ color: "#666", marginTop: 4 }}>Customer ID: <code>{id}</code></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/customers/${id}/edit`}
            style={{ textDecoration: "none", border: "1px solid #ddd", padding: "8px 12px", borderRadius: 10, background: "white" }}
          >
            Edit
          </Link>
          <Link href="/customers" style={{ textDecoration: "none", padding: "8px 12px" }}>
            ← Back
          </Link>
        </div>
      </div>

      {/* Contact & notes card */}
      <section
        style={{
          background: "white",
          border: "1px solid #eee",
          borderRadius: 14,
          padding: 16,
          display: "grid",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          {fullAddress(customer) ? <div>📍 {fullAddress(customer)}</div> : null}
          {customer?.phone ? <div>📞 {customer.phone}</div> : null}
          {customer?.email ? <div>✉️ {customer.email}</div> : null}
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Notes</div>
          <div
            style={{
              whiteSpace: "pre-wrap",
              background: "#f8fafc",
              border: "1px solid #eef2f7",
              borderRadius: 10,
              padding: 10,
              color: "#333",
              minHeight: 40,
            }}
          >
            {customer?.notes?.trim() ? customer.notes : <span style={{ color: "#777" }}>No notes yet.</span>}
          </div>
        </div>
      </section>

      {/* Estimates */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Estimates</h2>
          <div style={{ color: "#666" }}>{estCount} total</div>
        </div>

        {loadingEst ? (
          <div style={{ padding: 12, color: "#666" }}>Loading estimates…</div>
        ) : estCount === 0 ? (
          <div style={{ background: "white", border: "1px solid #eee", borderRadius: 12, padding: 16, color: "#555" }}>
            No estimates yet for this customer.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {estimates.map((e) => (
              <article key={e.id} style={{ background: "white", border: "1px solid #eee", borderRadius: 14, padding: 14, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 16 }}>{e.title || "Estimate"}</strong>
                  <StatusPill value={e.status} />
                </div>
                <div style={{ color: "#555", fontSize: 14 }}>
                  Total: <strong>{formatMoney(e.total)}</strong>
                </div>
                <div style={{ color: "#777", fontSize: 12 }}>Created: {formatWhen(e.createdAt)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <Link href={`/estimates/${e.id}`} style={{ textDecoration: "none", border: "1px solid #ddd", padding: "6px 10px", borderRadius: 8, background: "white" }}>
                    View
                  </Link>
                  <Link href={`/estimates/${e.id}/edit`} style={{ textDecoration: "none", border: "1px solid #ddd", padding: "6px 10px", borderRadius: 8, background: "white" }}>
                    Edit
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
