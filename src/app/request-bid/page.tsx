/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  budget?: string;
};

export default function RequestBidPage() {
  const [form, setForm] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    budget: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ leadId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (k: keyof LeadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return "Please enter a valid email.";
    if (!form.phone.trim()) return "Please enter a phone number.";
    if (!form.description.trim()) return "Please tell us about the project.";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    try {
      // 1) Upsert a customer (by email)
      let customerId: string | null = null;
      const existing = await getDocs(
        query(collection(db, "customers"), where("email", "==", form.email.trim().toLowerCase()))
      );
      if (!existing.empty) {
        customerId = existing.docs[0].id;
      } else {
        const c = await addDoc(collection(db, "customers"), {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          createdAt: serverTimestamp(),
          // simple tag to know this came from a lead form
          source: "request-bid",
        });
        customerId = c.id;
      }

      // 2) Create a lead record
      const lead = await addDoc(collection(db, "leads"), {
        customerId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        budget: (form.budget || "").trim(),
        status: "new", // new | contacted | scheduled | closed
        createdAt: serverTimestamp(),
      });

      // 3) Show success message
      setDone({ leadId: lead.id });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
        <h1>Thanks! 🎉</h1>
        <p>Your request has been received. We’ll get back to you shortly.</p>
        <p style={{ color: "#555" }}>
          Reference ID: <code>{done.leadId}</code>
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <Link href="/estimates" style={{ textDecoration: "none" }}>
            Go to Estimates
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1>Request a Bid</h1>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Tell us a bit about your project and we’ll reach out to schedule a visit and provide a bid.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        <label>
          <div>Name *</div>
          <input value={form.name} onChange={onChange("name")} />
        </label>

        <label>
          <div>Email *</div>
          <input type="email" value={form.email} onChange={onChange("email")} />
        </label>

        <label>
          <div>Phone *</div>
          <input value={form.phone} onChange={onChange("phone")} />
        </label>

        <label>
          <div>Address</div>
          <input value={form.address} onChange={onChange("address")} />
        </label>

        <label>
          <div>Project description *</div>
          <textarea rows={5} value={form.description} onChange={onChange("description")} />
        </label>

        <label>
          <div>Budget (optional)</div>
          <input value={form.budget} onChange={onChange("budget")} placeholder="$" />
        </label>

        {error ? (
          <div style={{ color: "#b00020", background: "#ffecec", padding: 8, borderRadius: 8 }}>
            {error}
          </div>
        ) : null}

        <button onClick={handleSubmit} disabled={submitting} style={{ marginTop: 8 }}>
          {submitting ? "Submitting…" : "Submit request"}
        </button>

        <div style={{ color: "#777", fontSize: 12 }}>
          * required fields
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
        input:focus, textarea:focus {
          border-color: #999;
        }
        label > div { margin-bottom: 4px; font-weight: 600; }
      `}</style>
    </main>
  );
}
