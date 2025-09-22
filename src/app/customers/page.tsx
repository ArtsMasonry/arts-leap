/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";

type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  createdAt?: any;
};

function fullAddress(c: Customer) {
  const parts = [
    c.address?.trim(),
    [c.city, c.state].filter(Boolean).join(", ").trim(),
    c.zip?.trim(),
  ].filter(Boolean);
  return parts.join(" • ");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Customer[];
      setCustomers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const total = useMemo(() => customers.length, [customers]);

  const onDelete = async (c: Customer) => {
    const ok = window.confirm(`Delete customer "${c.name}"? This cannot be undone.`);
    if (!ok) return;
    await deleteDoc(doc(db, "customers", c.id));
  };

  if (loading) return <main style={{ padding: 24 }}>Loading customers…</main>;

  return (
    <main>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", margin: "8px 0 16px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Customers</h1>
          <div style={{ color: "#666", marginTop: 4 }}>{total} total</div>
        </div>
        <Link
          href="/customers/new"
          style={{
            textDecoration: "none",
            background: "#111",
            color: "white",
            padding: "8px 12px",
            borderRadius: 10,
          }}
        >
          + New Customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            color: "#555",
          }}
        >
          No customers yet. Click <strong>New Customer</strong> to add one.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          {customers.map((c) => (
            <article
              key={c.id}
              style={{
                background: "white",
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 14,
                display: "grid",
                gap: 8,
                boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{c.name || "(No name)"}</h3>
              </div>

              <div style={{ color: "#555", fontSize: 14, display: "grid", gap: 4 }}>
                {fullAddress(c) ? <div>📍 {fullAddress(c)}</div> : null}
                {c.phone ? <div>📞 {c.phone}</div> : null}
                {c.email ? <div>✉️ {c.email}</div> : null}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Link
                  href={`/customers/${c.id}`}
                  style={{
                    textDecoration: "none",
                    border: "1px solid #ddd",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "white",
                  }}
                >
                  View
                </Link>
                <Link
                  href={`/customers/${c.id}/edit`}
                  style={{
                    textDecoration: "none",
                    border: "1px solid #ddd",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "white",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(c)}
                  style={{
                    border: "1px solid #f3c0c0",
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "#ffecec",
                    color: "#a40000",
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
