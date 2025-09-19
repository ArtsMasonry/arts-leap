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
  query,
  orderBy,
} from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // auth first
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // live customers list
  useEffect(() => {
    if (!user) return;
    const qAll = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qAll, (snap) => {
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
    });
    return () => unsub();
  }, [user]);

  const addCustomer = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await addDoc(collection(db, "customers"), {
        name: name.trim(),
        note: note.trim(),
        createdAt: serverTimestamp(),
      });
      setName("");
      setNote("");
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
            } catch {
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
          <h2>Add customer</h2>
          <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
            <input
              placeholder="Customer name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <input
              placeholder="Note"
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
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
