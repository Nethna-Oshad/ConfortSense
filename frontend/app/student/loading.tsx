export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-[#16294A]" />
      <div className="h-4 w-72 rounded bg-[#0E1C30]" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-[#0E1C30]" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-[#0E1C30]" />
    </div>
  );
}
