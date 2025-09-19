// app/estimates/loading.tsx
export default function LoadingEstimates() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
