export function ProviderCardSkeleton() {
  return (
    <div className="bg-cream-raised border border-hairline rounded-[6px] overflow-hidden">
      <div className="flex gap-0">
        <div className="flex-shrink-0 w-[80px] min-h-[120px] skeleton border-r border-hairline" />
        <div className="flex-1 px-4 py-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="h-5 w-48 skeleton rounded-[3px]" />
            <div className="h-3 w-20 skeleton rounded-[3px]" />
          </div>
          <div className="flex gap-2">
            <div className="h-4 w-20 skeleton rounded-[3px]" />
            <div className="h-4 w-16 skeleton rounded-[3px]" />
            <div className="h-4 w-14 skeleton rounded-[3px]" />
          </div>
          <div className="h-3.5 w-24 skeleton rounded-[3px]" />
          <div className="flex gap-1.5 mt-1">
            <div className="h-4 w-16 skeleton rounded-[2px]" />
            <div className="h-4 w-20 skeleton rounded-[2px]" />
            <div className="h-4 w-14 skeleton rounded-[2px]" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="h-3 w-28 skeleton rounded-[3px]" />
            <div className="h-4 w-20 skeleton rounded-[3px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-cream-raised border border-hairline rounded-[6px] p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 skeleton rounded-[6px]" />
        <div className="h-3 w-16 skeleton rounded-[3px]" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-36 skeleton rounded-[3px]" />
        <div className="h-4 w-full skeleton rounded-[3px]" />
        <div className="h-4 w-3/4 skeleton rounded-[3px]" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-4 w-20 skeleton rounded-[3px]" />
        <div className="h-4 w-16 skeleton rounded-[3px]" />
        <div className="h-4 w-24 skeleton rounded-[3px]" />
      </div>
      <div className="pt-3 border-t border-hairline h-5 w-24 skeleton rounded-[3px]" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="py-10 px-4 text-center space-y-2">
      <div className="h-14 w-24 skeleton rounded-[3px] mx-auto" />
      <div className="h-3 w-28 skeleton rounded-[3px] mx-auto opacity-40" />
    </div>
  );
}

export function IntelCardSkeleton() {
  return (
    <div className="bg-cream-raised border border-hairline rounded-[6px] p-5 space-y-3">
      <div className="h-3 w-20 skeleton rounded-[3px]" />
      <div className="h-5 w-48 skeleton rounded-[3px]" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-full skeleton rounded-[3px]" />
        <div className="h-3.5 w-4/5 skeleton rounded-[3px]" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-4 w-16 skeleton rounded-[3px]" />
        <div className="h-4 w-12 skeleton rounded-[3px]" />
      </div>
    </div>
  );
}
