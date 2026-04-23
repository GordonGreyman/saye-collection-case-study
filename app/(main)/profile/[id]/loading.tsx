export default function ProfileLoading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-12 w-80 bg-surface rounded mb-4" />
      <div className="h-4 w-2/3 bg-surface rounded mb-8" />

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="break-inside-avoid mb-4 h-56 bg-surface rounded-xl border border-white/5" />
        ))}
      </div>
    </div>
  )
}
