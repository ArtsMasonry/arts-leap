"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

type Doc = {
  id: string;
  type: "ESTIMATE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE";
  status:
    | "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED"
    | "SIGNED" | "COUNTERSIGNED" | "ACTIVE" | "COMPLETED"
    | "APPROVED" | "PARTIAL" | "PAID" | "OVERDUE" | "VOID";
  number: string;
  title: string;
  customerName: string;
  jobNumber: string | null;
  issueDate: string; // ISO
  total?: number;
};

const MOCK: readonly Doc[] = [
  { id: "d1", type: "ESTIMATE", status: "SENT", number: "EST-00123", title: "Front walkway", customerName: "Johnson Family", jobNumber: null, issueDate: "2025-09-15", total: 6200 },
  { id: "d2", type: "CONTRACT", status: "ACTIVE", number: "CTR-00045", title: "Driveway replacement", customerName: "Acme HOA", jobNumber: "JOB-0012", issueDate: "2025-08-28", total: 18250 },
  { id: "d3", type: "INVOICE", status: "PAID", number: "INV-00101", title: "Final invoice", customerName: "Johnson Family", jobNumber: "JOB-0015", issueDate: "2025-09-12", total: 6200 },
];

function typeBadgeClass(t: Doc["type"]) {
  switch (t) {
    case "ESTIMATE": return "bg-blue-100 text-blue-800";
    case "CONTRACT": return "bg-emerald-100 text-emerald-800";
    case "CHANGE_ORDER": return "bg-amber-100 text-amber-800";
    case "INVOICE": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
function statusBadgeClass(s: Doc["status"]) {
  switch (s) {
    case "DRAFT": return "bg-gray-100 text-gray-700";
    case "SENT": return "bg-sky-100 text-sky-800";
    case "VIEWED": return "bg-indigo-100 text-indigo-800";
    case "ACCEPTED": return "bg-emerald-100 text-emerald-800";
    case "REJECTED": return "bg-rose-100 text-rose-800";
    case "SIGNED": return "bg-green-100 text-green-800";
    case "COUNTERSIGNED": return "bg-green-100 text-green-800";
    case "ACTIVE": return "bg-lime-100 text-lime-800";
    case "COMPLETED": return "bg-teal-100 text-teal-800";
    case "APPROVED": return "bg-amber-100 text-amber-900";
    case "PARTIAL": return "bg-yellow-100 text-yellow-800";
    case "PAID": return "bg-emerald-100 text-emerald-900";
    case "OVERDUE": return "bg-red-100 text-red-800";
    case "VOID": return "bg-zinc-100 text-zinc-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function DocumentsClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState<string>("");
  const [customer, setCustomer] = useState<string>("");
  const [jobNumber, setJobNumber] = useState<string>("");

  // initialize from URL once
  useEffect(() => {
    setStatus(searchParams.get("status") ?? "");
    setCustomer(searchParams.get("customer") ?? "");
    setJobNumber(searchParams.get("job") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setParam = (key: "status" | "customer" | "job", value: string) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) sp.set(key, value); else sp.delete(key);
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const statusOptions = useMemo(
    () => ["", ...Array.from(new Set(MOCK.map(d => d.status))).sort()],
    []
  );
  const customerOptions = useMemo(
    () => ["", ...Array.from(new Set(MOCK.map(d => d.customerName))).sort()],
    []
  );

  const docs = useMemo(() => MOCK.filter(d => {
    const statusOk = status ? d.status === status : true;
    const custOk = customer ? d.customerName === customer : true;
    const jobOk = jobNumber ? (d.jobNumber ?? "").toLowerCase().includes(jobNumber.toLowerCase()) : true;
    return statusOk && custOk && jobOk;
  }), [status, customer, jobNumber]);

  return (
    <main className="p-0 md:p-6">
      <h1 className="text-2xl font-bold px-4 md:px-0">Documents</h1>
      <p className="text-gray-600 mb-4 px-4 md:px-0">All documents. Filters persist in the URL.</p>

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between px-4 md:px-0">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Status</label>
            <select
              className="border rounded-xl px-3 py-2 bg-white"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setParam("status", e.target.value); }}
            >
              {statusOptions.map(s => (
                <option key={s || "ALL"} value={s}>{s || "All statuses"}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Customer</label>
            <select
              className="border rounded-xl px-3 py-2 bg-white min-w-[220px]"
              value={customer}
              onChange={(e) => { setCustomer(e.target.value); setParam("customer", e.target.value); }}
            >
              {customerOptions.map(c => (
                <option key={c || "ALL"} value={c}>{c || "All customers"}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Job #</label>
            <input
              className="border rounded-xl px-3 py-2"
              placeholder="e.g. JOB-0012"
              value={jobNumber}
              onChange={(e) => { setJobNumber(e.target.value); setParam("job", e.target.value); }}
            />
          </div>
        </div>
      </div>

      {/* Tiles */}
      {docs.length === 0 ? (
        <div className="text-gray-600 px-4 md:px-0">No documents match your filters.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
          {docs.map(d => (
            <div key={d.id} className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${typeBadgeClass(d.type)}`}>{d.type.replace("_"," ")}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeClass(d.status)}`}>{d.status}</span>
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-500">{d.number}</div>
                <div className="text-base font-semibold">{d.title}</div>
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                {d.jobNumber && <div>Job: <span className="font-medium">{d.jobNumber}</span></div>}
                <div>Date: {new Date(d.issueDate).toLocaleDateString()}</div>
                <div>Customer: <span className="font-medium">{d.customerName}</span></div>
                {"total" in d && typeof d.total === "number" && <div>Total: ${d.total.toFixed(2)}</div>}
              </div>
              <div className="mt-4 flex gap-2">
                {/* Open now navigates to /documents/[id] */}
                <Link
                  href={`/documents/${d.id}`}
                  className="text-sm rounded-xl px-3 py-2 border hover:bg-gray-50"
                >
                  Open
                </Link>
                {/* PDF is a stub for now */}
                <button
                  className="text-sm rounded-xl px-3 py-2 border text-gray-400 cursor-not-allowed"
                  title="PDF preview coming soon"
                  disabled
                >
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
