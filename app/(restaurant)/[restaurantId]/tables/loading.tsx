// app/(restaurant)/[restaurantId]/tables/loading.tsx
export default function TablesLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 mb-6 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
