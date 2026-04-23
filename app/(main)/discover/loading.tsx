export default function DiscoverLoading() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-surface rounded-xl h-48 border border-white/5"
          />
        ))}
      </div>
    </div>
  )
}
