"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

type Doc = {
  id: string;
  type: "ESTIMATE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE";
  status:
    | "DRAFT"
    | "SENT"
    | "VIEWED"
    | "ACCEPTED"
    | "REJECTED"
    | "SIGNED"
    | "COUNTERSIGNED"
    | "ACTIVE"
    | "COMPLETED"
    | "APPROVED"
    | "PARTIAL"
    | "PAID"
    | "OVERDUE"
    | "VOID";
  number: string;
  title: string;
  customerName: string;
  jobNumber: string | null;
  issueDate: string; // ISO
  total?: number;
};

const MOCK: readonly Doc[] = [
  {
    id: "d1",
    type: "ESTIMATE",
    status: "SENT",
    number: "EST-00123",
    title: "Front walkway",
    customerName: "Johnson Family",
    jobNumber: null,
    issueDate: "2025-09-15",
    total: 6200,
  },
  {
    id: "d2",
    type: "CONTRACT",
    status: "ACTIVE",
    number: "CTR-00045",
    title: "Driveway replacement",
    customerName: "Acme HOA",
    jobNumber: "JOB-0012",
    issueDate: "2025-08-28",
    total: 18250,
  },
  {
    id: "d3",
    type: "INVOICE",
    status: "PAID",
    number: "INV-00101",
    title: "Final invoice",
    customerName: "Johnson Family",
    jobNumber: "JOB-0015",
    issueDate: "2025-09-12",
    total: 6200,
  },
];

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // state
  const [status, setStatus] = useState<string>("");
  const [customer, setCustomer] = useState<string>("");
  const [jobNumber, setJobNumber] = useState<string>("");

  // initialize from URL once
  useEffect(() => {
    setStatus(searchParams.get("status") ?? "");
    setCustomer(searchParams.get("customer") ?? "");
    setJobNumber(searchParams.get("job") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // helper to update URL (and state)
  const setParam = (key: "status" | "customer" | "job", value: string) => {
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.replace(`${pathname}?${sp.toString()}`);
  };

  // dropdown options from data
  const statusOptions = useMemo(() => {
    const s = Array.from(new Set(MOCK.map((d) => d.status))).sort();
    return ["", ...s];
  }, []);
  const customerOptions = useMemo(() => {
    const c = Array.from(new Set(MOCK.map((d) => d.customerName))).sort();
    return ["", ...c];
  }, []);

  // filtered list
  const docs = useMemo(() => {
    return MOCK.filter((d) => {
      const statusOk = status ? d.status === status : true;
      const custOk = customer ? d.customerName === customer : true;
      const jobOk = jobNumber
        ? (d.jobNumber ?? "").toLowerCase().includes(jobNumber.toLowerCase())
        : true;
      return statusOk && custOk && jobOk;
    });
  }, [status, customer, jobNumber]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Documents</h1>
      <p className="text-gray-600 mb-4">
        All documents. Filters persist in the URL now.
      </p>

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Status</label>
            <select
              className="border rounded-xl px-3 py-2 bg-white"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setParam("status", e.target.value);
              }}
            >
              {statusOptions.map((s) => (
                <option key={s || "ALL"} value={s}>
                  {s || "All statuses"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Customer</label>
            <select
              className="border rounded-xl px-3 py-2 bg-white min-w-[220px]"
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                setParam("customer", e.target.value);
              }}
            >
              {customerOptions.map((c) => (
                <option key={c || "ALL"} value={c}>
                  {c || "All customers"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Job #</label>
            <input
              className="border rounded-xl px-3 py-2"
              placeholder="e.g. JOB-0012"
              value={jobNumber}
              onChange={(e) => {
                setJobNumber(e.target.value);
                setParam("job", e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {/* Tiles */}
      {docs.length === 0 ? (
        <div className="text-gray-600">No documents match your filters.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div key={d.id} className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {d.type}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                  {d.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-sm text-gray-500">{d.number}</div>
                <div className="text-base font-semibold">{d.title}</div>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                {d.jobNumber && (
                  <div>
                    Job: <span className="font-medium">{d.jobNumber}</span>
                  </div>
                )}
                <div>Date: {new Date(d.issueDate).toLocaleDateString()}</div>
                <div>
                  Customer: <span className="font-medium">{d.customerName}</span>
                </div>
                {"total" in d && typeof d.total === "number" && (
                  <div>Total: ${d.total.toFixed(2)}</div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button className="text-sm rounded-xl px-3 py-2 border hover:bg-gray-50">
                  Open
                </button>
                <button className="text-sm rounded-xl px-3 py-2 border hover:bg-gray-50">
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
