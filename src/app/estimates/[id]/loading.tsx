// app/estimates/[id]/loading.tsx
export default function LoadingEstimate() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-7 w-60 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
      <div className="h-5 w-56 bg-gray-100 rounded animate-pulse" />
      <div className="h-32 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}
