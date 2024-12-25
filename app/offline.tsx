// app/offline.tsx
export default function Offline() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">You are offline</h1>
        <p className="text-gray-600">
          Please check your internet connection and try again
        </p>
      </div>
    </div>
  );
}
