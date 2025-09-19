// app/estimates/new/page.tsx
"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";

export default function NewEstimatePage() {
  const router = useRouter();
  const auth = getAuth();

  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);

      const uid = auth.currentUser?.uid || null;

      const docRef = await addDoc(collection(db, "estimates"), {
        title: title.trim(),
        customer: customer.trim() || null,
        notes: notes.trim() || null,
        status: "Draft",
        items: [], // placeholder for line items
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: uid,
      });

      // go straight to the detail page
      router.push(`/estimates/${docRef.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save estimate.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">New Estimate</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-md px-3 py-2 outline-none"
            placeholder="Patio repair, brick steps, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <input
            type="text"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border rounded-md px-3 py-2 outline-none"
            placeholder="Customer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-md px-3 py-2 outline-none min-h-[120px]"
            placeholder="Scope, site details, etc."
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md border bg-black text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Create Estimate"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/estimates")}
            className="px-4 py-2 rounded-md border"
          >
            Cancel
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
