/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // watch auth first
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  // listen to ALL customers (no filter, no index needed)
  useEffect(() => {
    if (!user) return;
    const col = collection(db, "customers");
    const unsub = onSnapshot(
      col,
      (snap) => {
        const toMs = (v: any) => (v?.toMillis ? v.toMillis() : 0);
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as any))
          .sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
        setCustomers(items);
        setLastError(null);
      },
      (err) => setLastError(err.message || String(err))
    );
    return () => unsub();
  }, [user]);

  const addCustomer = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      setLastError(null);
      await addDoc(collection(db, "customers"), {
        name: name.trim(),
        note: note.trim(),
        createdAt: serverTimestamp(),
        uid: user?.uid ?? null,
      });
      setName("");
      setNote("");
    } catch (e: any) {
      setLastError(e?.message || String(e));
      alert("Could not save. Check Firestore rules & try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Art’s Leap – mini demo</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Sign in, add a customer, watch it appear below (stored in Firestore).
      </p>

      {!user ? (
        <button
          onClick={async () => {
            try {
              await signInWithPopup(auth, googleProvider);
            } catch (e: any) {
              const { signInWithRedirect } = await import("firebase/auth");
              await signInWithRedirect(auth, googleProvider);
            }
          }}
        >
          Sign in with Google
        </button>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span>Hi, {user.displayName || user.email}</span>
          <button onClick={() => signOut(auth)}>Sign out</button>
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      {loading ? (
        <p>Loading…</p>
      ) : user ? (
        <>
          {lastError ? (
            <p style={{ color: "crimson" }}>Error: {lastError}</p>
          ) : null}

          <h2>Add customer</h2>
          <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
            <input
              placeholder="Customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              placeholder="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button onClick={addCustomer} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <h2 style={{ marginTop: 24 }}>Customers</h2>
          <ul>
            {customers.map((c) => (
              <li key={c.id}>
                <strong>{c.name}</strong>
                {c.note ? ` — ${c.note}` : ""}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Sign in to add/view customers.</p>
      )}
    </main>
  );
}
