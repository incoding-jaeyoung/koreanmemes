export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-pulse">
      <div className="h-48 bg-white/5 rounded-2xl" />
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-white/5 rounded-full" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-40 bg-white/5 rounded" />
            <div className="h-4 w-60 bg-white/5 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
