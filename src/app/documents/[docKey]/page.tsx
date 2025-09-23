import React, { Suspense } from "react";
import DocumentDetailClient from "../DocumentDetailClient";

// Tell Next/Firebase: do NOT prerender this dynamic page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocumentDetailPage({ params }: { params: { docKey: string } }) {
  return (
    <Suspense
      fallback={
        <main className="p-6">
          <h1 className="text-2xl font-bold">Document</h1>
          <p className="text-gray-600 mt-2">Loading…</p>
        </main>
      }
    >
      <DocumentDetailClient docKey={params.docKey} />
    </Suspense>
  );
}
