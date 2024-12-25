// app/(restaurant)/layout.tsx
import Link from "next/link";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/menu"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Menu
            </Link>
            <Link
              href="/tables"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Tables
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
