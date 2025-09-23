import DocumentsClient from "./DocumentsClient";

// Do not prerender; render fresh each time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DocumentsPage() {
  return <DocumentsClient />;
}
