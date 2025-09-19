/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function EstimatesList() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "estimates"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEstimates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1>Estimates</h1>
      <Link href="/estimates/new">+ New Estimate</Link>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {estimates.map((e) => (
            <li key={e.id}>
              <Link href={`/estimates/${e.id}`}>
                {e.customerName || "Untitled"} ({e.status})
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
