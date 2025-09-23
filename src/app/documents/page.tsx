import React, { Suspense } from "react";
import DocumentsClient from "./DocumentsClient";

// server-only exports live here (NOT in a client file)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-600">Loading…</p>
        </main>
      }
    >
      <DocumentsClient />
    </Suspense>
  );
}
