"use client";

import { useEffect, useState } from "react";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Art’s Leap — Fresh Start</h1>
      <p className="mt-2 text-sm opacity-70">
        Frontend is up. Backend health is below:
      </p>
      <HealthCheck />
    </main>
  );
}

function HealthCheck() {
  const [status, setStatus] = useState<null | string>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    fetch(url + "/health")
      .then((r) => r.json())
      .then((j) => setStatus(j.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="mt-6 rounded-xl border p-4">
      <div>
        API status: <strong>{status ?? "checking..."}</strong>
      </div>
    </div>
  );
}
