import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">SmartDoc Review</h1>
        <p className="mt-2 text-muted-foreground">AI-powered document Q&A</p>
      </div>
      <RegisterForm />
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </main>
  );
}
