import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl p-10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-green-700 animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
