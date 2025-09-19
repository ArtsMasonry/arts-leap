// app/estimates/[id]/page.tsx
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic"; // ensure server renders fresh

interface PageProps {
  params: { id: string };
}

export default async function EstimateDetail({ params }: PageProps) {
  const ref = doc(db, "estimates", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Estimate not found</h1>
        <p className="text-gray-600 mt-2">ID: {params.id}</p>
      </div>
    );
  }

  const data = snap.data() as any;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Estimate: {data.title || "Untitled"}
      </h1>

      <div className="grid gap-2">
        <p><span className="font-semibold">Status:</span> {data.status || "Draft"}</p>
        <p><span className="font-semibold">Customer:</span> {data.customer || "N/A"}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Line Items</h2>
        <pre className="bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(data.items || [], null, 2)}
        </pre>
      </div>
    </div>
  );
}
