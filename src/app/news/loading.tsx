export default function NewsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6 animate-pulse">
      <div className="h-48 bg-white/5 rounded-2xl" />
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-white/5 rounded-lg" />
        <div className="h-10 w-64 bg-white/5 rounded-lg" />
      </div>
      <div className="space-y-0 border-t border-white/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center px-4 py-3 border-b border-white/5 gap-4">
            <div className="flex-1 h-4 bg-white/5 rounded" />
            <div className="w-20 h-4 bg-white/5 rounded hidden md:block" />
            <div className="w-10 h-4 bg-white/5 rounded hidden md:block" />
            <div className="w-14 h-4 bg-white/5 rounded hidden md:block" />
            <div className="w-14 h-4 bg-white/5 rounded hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
