/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { db, auth, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

type Item = { description: string; qty: number; unitPrice: number };

export default function EstimatesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [customer, setCustomer] = useState("");
  const [title, setTitle] = useState("Estimate");
  const [items, setItems] = useState<Item[]>([
    { description: "", qty: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // list of saved estimates
  const [estimates, setEstimates] = useState<any[]>([]);

  // auth first
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // load estimates (company-wide, newest first)
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "estimates"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEstimates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
    });
    return () => unsub();
  }, [user]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
      0
    );
    const taxRate = 0; // adjust later if you want tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [items]);

  const setItem = (i: number, patch: Partial<Item>) => {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  const addRow = () => setItems((prev) => [...prev, { description: "", qty: 1, unitPrice: 0 }]);
  const removeRow = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const saveEstimate = async () => {
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

      await addDoc(collection(db, "estimates"), {
        customer: customer.trim(),
        title: title.trim() || "Estimate",
        items: cleanItems,
        notes: notes.trim(),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        status: "draft",
        createdAt: serverTimestamp(),
      });

      // reset the form
      setCustomer("");
      setTitle("Estimate");
      setItems([{ description: "", qty: 1, unitPrice: 0 }]);
      setNotes("");
      alert("Estimate saved!");
    } catch (e) {
      console.error(e);
      alert("Could not save estimate. Check rules and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main style={{ padding: 16 }}>Loading…</main>;

  if (!user) {
    return (
      <main style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
        <h1>Estimates</h1>
        <p style={{ color: "#666" }}>
          Please sign in to create and view estimates.
        </p>
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
        <h1>Estimates</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
                  gridTemplateColumns: "1fr 100px 140px 80px",
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
                  ${(it.qty || 0) * (it.unitPrice || 0)}
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
          <div>Subtotal: <strong>${totals.subtotal.toFixed(2)}</strong></div>
          <div>Tax: <strong>${totals.tax.toFixed(2)}</strong></div>
          <div>Total: <strong>${totals.total.toFixed(2)}</strong></div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={saveEstimate} disabled={saving}>
            {saving ? "Saving…" : "Save estimate"}
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ marginTop: 24 }}>
        <h2>Recent estimates</h2>
             <div style={{ marginTop: 24 }}>
        <h2>Recent estimates</h2>
        <ul>
          {estimates.map((e) => (
            <li key={e.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span>
                <strong>{e.customer}</strong> — {e.title || "Estimate"} —{" "}
                <em>${(e.total ?? 0).toFixed?.(2) ?? e.total}</em>
              </span>
              <a href={`/estimates/${e.id}`} style={{ textDecoration: "underline" }}>
                View
              </a>
            </li>
          ))}
        </ul>
      </div>

      </div>
    </main>
  );
}
