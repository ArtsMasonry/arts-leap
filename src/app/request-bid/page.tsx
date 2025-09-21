/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

type LeadForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  budget?: string;
};

const MAX_FILES = 3;
const MAX_MB_PER_FILE = 15;
const REDIRECT_MS = 3000; // 3 seconds

export default function RequestBidPage() {
  const [form, setForm] = useState<LeadForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    budget: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ leadId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(() => {
    return files.map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      sizeMB: (f.size / (1024 * 1024)).toFixed(1),
    }));
  }, [files]);

  const onChange =
    (k: keyof LeadForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    const imgs = picked.filter((f) => f.type.startsWith("image/"));
    if (imgs.length !== picked.length) {
      alert("Only image files are allowed.");
    }
    const limited = imgs.slice(0, MAX_FILES);
    const tooBig = limited.find((f) => f.size > MAX_MB_PER_FILE * 1024 * 1024);
    if (tooBig) {
      alert(`Each image must be ≤ ${MAX_MB_PER_FILE}MB.`);
      e.target.value = "";
      return;
    }
    setFiles(limited);
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
      // 1) Upsert a customer (by email, lowercase)
      const emailLc = form.email.trim().toLowerCase();
      let customerId: string | null = null;
      const existing = await getDocs(
        query(collection(db, "customers"), where("email", "==", emailLc))
      );
      if (!existing.empty) {
        customerId = existing.docs[0].id;
      } else {
        const c = await addDoc(collection(db, "customers"), {
          name: form.name.trim(),
          email: emailLc,
          phone: form.phone.trim(),
          address: form.address.trim(),
          createdAt: serverTimestamp(),
          source: "request-bid",
        });
        customerId = c.id;
      }

      // 2) Create the lead without photos first
      const leadRef = await addDoc(collection(db, "leads"), {
        customerId,
        name: form.name.trim(),
        email: emailLc,
        phone: form.phone.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        budget: (form.budget || "").trim(),
        status: "new",
        createdAt: serverTimestamp(),
        photos: [],
      });

      // 3) Optional photos upload
      if (files.length > 0) {
        const storage = getStorage();
        const uploads = files.map(async (file, idx) => {
          const path = `leads/${leadRef.id}/${Date.now()}-${idx}-${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file, { contentType: file.type });
          return await getDownloadURL(storageRef);
        });
        const photoUrls = await Promise.all(uploads);
        await updateDoc(doc(db, "leads", leadRef.id), { photos: photoUrls });
      }

      // 4) Show thanks + trigger redirect
      setDone({ leadId: leadRef.id });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // After success, redirect to public site
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => {
      window.location.href = "https://artsmasonry.com/";
    }, REDIRECT_MS);
    return () => clearTimeout(t);
  }, [done]);

  if (done) {
    return (
      <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
        <h1>Thank you! 🎉</h1>
        <p>Your request has been received. We’ll reach out shortly.</p>
        <p style={{ color: "#555" }}>
          Reference ID: <code>{done.leadId}</code>
        </p>
        <p style={{ marginTop: 12, color: "#777" }}>
          You’ll be redirected to artsmasonry.com in a few seconds…
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1>Request a Bid</h1>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Tell us about your project. You can include up to {MAX_FILES} photos.
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

        <label>
          <div>Photos (up to {MAX_FILES})</div>
          <input type="file" accept="image/*" multiple onChange={onPickFiles} />
          {files.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 8,
                marginTop: 8,
              }}
            >
              {previews.map((p, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 6,
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      borderRadius: 6,
                      marginBottom: 6,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {p.name} — {p.sizeMB}MB
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>
            Allowed: images only. Max {MAX_MB_PER_FILE}MB each.
          </div>
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
