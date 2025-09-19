/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

type Item = { description: string; qty: number; unitPrice: number; lineTotal?: number };

function money(n: number | undefined) {
  const v = typeof n === "number" ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function EditEstimatePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [loadingDoc, setLoadingDoc] = useState(true);
  const [title, setTitle] = useState("Estimate");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  // load estimate once
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const ref = doc(db, "estimates", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          alert("Estimate not found.");
          router.push("/estimates");
          return;
        }
        const data = snap.data() as any;
        setTitle(data.title || "Estimate");
        setCustomer(data.customer || "");
        setNotes(data.notes || "");
        setItems(
          (data.items as Item[] | undefined)?.map((it) => ({
            description: it.description ?? "",
            qty: Number(it.qty) || 0,
            unitPrice: Number(it.unitPrice) || 0,
            lineTotal: (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
          })) || [{ description: "", qty: 1, unitPrice: 0 }]
        );
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [user, id, router]);

  const setItem = (i: number, patch: Partial<Item>) => {
    setItems((prev) => {
      const next = [...prev];
      const merged = { ...next[i], ...patch };
      merged.lineTotal =
        (Number(merged.qty) || 0) * (Number(merged.unitPrice) || 0);
      next[i] = merged;
      return next;
    });
  };

  const addRow = () =>
    setItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0 }]);

  const removeRow = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + ((Number(it.qty) || 0) * (Number(it.unitPrice) || 0)),
      0
    );
    const taxRate = 0; // keep 0 for now; we’ll add tax settings later
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  const save = async () => {
    if (!customer.trim()) {
      alert("Add a customer name first.");
      return;
    }
    try {
      setSaving(true);
      const cleanItems = items
        .filter((it) => it.description.trim() || it.qty || it.unitPrice)
        .map((it) => ({
          description: it.description.trim(),
          qty: Number(it.qty) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          lineTotal:
            (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
        }));

      await updateDoc(doc(db, "estimates", id), {
        customer: customer.trim(),
        title: title.trim() || "Estimate",
        items: cleanItems,
        notes: notes.trim(),
        subtotal: Number(totals.subtotal.toFixed(2)),
        tax: Number(totals.tax.toFixed(2)),
        total: Number(totals.total.toFixed(2)),
        updatedAt: serverTimestamp(),
      });

      router.push(`/estimates/${id}`);
    } catch (e) {
      console.error(e);
      alert("Could not save changes. Check rules and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingAuth || loadingDoc) {
    return <main style={{ padding: 24 }}>Loading…</main>;
  }

  if (!user) {
    return (
      <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
        <h1>Edit estimate</h1>
        <p style={{ color: "#666" }}>Please sign in.</p>
        <button
          onClick={async () => {
            try {
              await signInWithPopup(auth, googleProvider);
            } catch {
              const { signInWithRedirect } = await import("firebase/auth");
              await signInWithRedirect(auth, googleProvider);
            }
          }}
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1000, margin: "24px auto", padding: 16 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1>Edit estimate</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href={`/estimates/${id}`} style={{ textDecoration: "none", border: "1px solid #ccc", padding: "6px 10px", borderRadius: 8 }}>
            ← Back
          </Link>
          <span>Hi, {user.displayName || user.email}</span>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "grid", gap: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <input
            placeholder="Customer name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
          <input
            placeholder="Estimate title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <h3 style={{ margin: "8px 0" }}>Line items</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((it, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 140px 100px 80px",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => setItem(i, { description: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={it.qty}
                  onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="Unit price"
                  value={it.unitPrice}
                  onChange={(e) =>
                    setItem(i, { unitPrice: Number(e.target.value) })
                  }
                  step="0.01"
                />
                <div style={{ textAlign: "right" }}>
                  {money((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}
                </div>
                <button onClick={() => removeRow(i)} disabled={items.length === 1}>
                  Remove
                </button>
              </div>
            ))}
            <button onClick={addRow}>+ Add line</button>
          </div>
        </div>

        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, fontSize: 16 }}>
          <div>Subtotal: <strong>{money(totals.subtotal)}</strong></div>
          <div>Tax: <strong>{money(totals.tax)}</strong></div>
          <div>Total: <strong>{money(totals.total)}</strong></div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </main>
  );
}
 