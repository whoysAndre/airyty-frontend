export function ListingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-gray-200 mb-3 overflow-hidden">
        <div className="w-full h-full animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3.5 bg-gray-200 rounded-full w-1/2" />
          <div className="h-3.5 bg-gray-200 rounded-full w-10" />
        </div>
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
        <div className="h-3.5 bg-gray-200 rounded-full w-1/4 mt-1" />
      </div>
    </div>
  )
}
