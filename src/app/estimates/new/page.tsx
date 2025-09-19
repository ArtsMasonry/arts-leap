/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function NewEstimate() {
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const saveEstimate = async () => {
    if (!customerName.trim()) return;
    const ref = await addDoc(collection(db, "estimates"), {
      customerName: customerName.trim(),
      description: description.trim(),
      status: "draft",
      createdAt: serverTimestamp(),
    });
    router.push(`/estimates/${ref.id}`);
  };

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1>New Estimate</h1>
      <input
        placeholder="Customer name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />
      <button onClick={saveEstimate}>Save</button>
    </main>
  );
}
