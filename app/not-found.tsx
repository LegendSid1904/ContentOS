import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="font-display text-6xl font-bold text-tx-1">404</h1>
      <p className="text-tx-2">This page does not exist.</p>
      <Link
        href="/"
        className="btn btn-primary btn-md"
      >
        Go Home
      </Link>
    </main>
  );
}
