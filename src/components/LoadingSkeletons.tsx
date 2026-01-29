/**
 * Loading skeleton components for lazy-loaded sections
 */

export function ServicesSkeleton() {
  return (
    <div className="bg-[#C4C4C4]">
      <div className="py-20">
        <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-10">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-300 rounded w-1/3 mx-auto"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="bg-[#C4C4C4] py-20">
      <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-10">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-300 rounded w-1/3 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-[#C4C4C4]">
      <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-10 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="bg-white rounded-lg p-8 space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded w-5/6"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
  );
}
