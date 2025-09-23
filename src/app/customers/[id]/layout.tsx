// Server layout for the [id] segment so static export works.
// This covers BOTH /customers/[id] AND /customers/[id]/edit pages.
export function generateStaticParams() {
  // Do not pre-render any IDs for GitHub Pages static export
  return [];
}

export default function CustomerIdLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
