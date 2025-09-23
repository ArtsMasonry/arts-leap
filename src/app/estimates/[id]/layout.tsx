// Server layout for the [id] segment under /estimates.
// This covers /estimates/[id] and /estimates/[id]/edit.
export function generateStaticParams() {
  // Do not pre-render any IDs for GitHub Pages static export
  return [];
}

export default function EstimateIdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
