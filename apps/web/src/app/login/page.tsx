import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">SmartDoc Review</h1>
        <p className="mt-2 text-muted-foreground">AI-powered document Q&A</p>
      </div>
      <LoginForm />
      <p className="mt-4 text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </main>
  );
}
