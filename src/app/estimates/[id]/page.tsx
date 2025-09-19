/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EstimateView() {
  const params = useParams();
  const { id } = params as { id: string };
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!id) return;
      const ref = doc(db, "estimates", id);
      const snap = await getDoc(ref);
      if (snap.exists()) setEstimate({ id: snap.id, ...snap.data() });
      setLoading(false);
    };
    fetchEstimate();
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (!estimate) return <p>Estimate not found.</p>;

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1>Estimate for {estimate.customerName}</h1>
      <p>Status: {estimate.status}</p>
      <pre>{JSON.stringify(estimate, null, 2)}</pre>
    </main>
  );
}
