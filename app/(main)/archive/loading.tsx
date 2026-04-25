export default function ArchiveLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-2.5 w-20 bg-surface rounded mb-3.5" />
      <div className="h-14 w-80 bg-surface rounded mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl h-48 border border-white/5" />
        ))}
      </div>
    </div>
  )
}
