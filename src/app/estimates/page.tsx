// app/estimates/page.tsx
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic"; // ensure server renders fresh

export default async function EstimatesPage() {
  const snap = await getDocs(collection(db, "estimates"));
  const estimates = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Recent Estimates</h1>

      {estimates.length === 0 ? (
        <p className="text-gray-600">No estimates found.</p>
      ) : (
        <ul className="space-y-2">
          {estimates.map((est) => (
            <li
              key={est.id}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <div>
                <p className="font-medium">
                  {est.title || "Untitled Estimate"}
                </p>
                <p className="text-sm text-gray-500">
                  {est.status || "Draft"}
                </p>
              </div>
              <Link
                href={`/estimates/${est.id}`}
                className="text-blue-600 hover:underline"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
