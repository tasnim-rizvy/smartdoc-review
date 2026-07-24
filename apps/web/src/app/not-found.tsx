import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">404</h2>
      <p className="mt-2 text-muted-foreground">Page not found</p>
      <Link href="/" className="mt-4 text-blue-600 hover:underline">
        Go home
      </Link>
    </main>
  );
}
