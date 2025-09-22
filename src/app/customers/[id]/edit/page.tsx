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
  city?: string;
  state?: string;
  zip?: string;
};

export default function EditCustomerPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
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
          city: data.city ?? "",
          state: data.state ?? "",
          zip: data.zip ?? "",
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
        city: form.city?.trim() || "",
        state: form.state?.trim() || "",
        zip: form.zip?.trim() || "",
        updatedAt: serverTimestamp(),
      });
      router.push(`/customers/${id}`);
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
        <Link href={`/customers/${id}`} style={{ textDecoration: "none" }}>
          ← Back to Customer
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
          <div>Street Address</div>
          <input value={form.address} onChange={onChange("address")} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 10 }}>
          <label>
            <div>City</div>
            <input value={form.city} onChange={onChange("city")} />
          </label>
          <label>
            <div>State</div>
            <input value={form.state} onChange={onChange("state")} />
          </label>
          <label>
            <div>ZIP</div>
            <input value={form.zip} onChange={onChange("zip")} />
          </label>
        </div>

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
