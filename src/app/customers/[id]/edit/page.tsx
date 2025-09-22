/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

type PageProps = { params: { id: string } };

type Customer = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

export default function EditCustomerPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load existing customer
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
        const data = snap.data() as any;
        if (!alive) return;
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
        });
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

  const onChange =
    (k: keyof Customer) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return "Please enter a valid email.";
    return null;
  };

  const onSave = async () => {
    setError(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "customers", id), {
        name: form.name.trim(),
        email: form.email?.trim() || "",
        phone: form.phone?.trim() || "",
        address: form.address?.trim() || "",
        updatedAt: serverTimestamp(),
      });
      router.push("/customers");
    } catch (e: any) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const ok = window.confirm(
      "Delete this customer? This cannot be undone (estimates will still reference the old ID)."
    );
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "customers", id));
      router.push("/customers");
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Edit Customer</h1>
        <Link href="/customers" style={{ textDecoration: "none" }}>
          ← Back to Customers
        </Link>
      </div>

      {error ? (
        <div style={{ color: "#a40000", background: "#ffecec", padding: 10, borderRadius: 10, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          <div>Name *</div>
          <input value={form.name} onChange={onChange("name")} />
        </label>

        <label>
          <div>Email</div>
          <input value={form.email} onChange={onChange("email")} inputMode="email" />
        </label>

        <label>
          <div>Phone</div>
          <input value={form.phone} onChange={onChange("phone")} inputMode="tel" />
        </label>

        <label>
          <div>Address</div>
          <textarea rows={3} value={form.address} onChange={onChange("address")} />
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              background: "#111",
              color: "white",
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={onDelete}
            style={{
              background: "#ffecec",
              color: "#a40000",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #f3c0c0",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <style>{`
        input, textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
        }
        input:focus, textarea:focus { border-color: #999; }
        label > div { margin-bottom: 4px; font-weight: 600; }
      `}</style>
    </main>
  );
}

