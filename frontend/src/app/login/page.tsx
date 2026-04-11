'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Fake login — no real authentication
    localStorage.setItem('prelegal_authed', '1');
    router.push('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#032147]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-[#209dd7] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <span className="text-[#032147] font-bold text-2xl tracking-tight">Prelegal</span>
        </div>

        <h1 className="text-xl font-semibold text-[#032147] mb-1">Welcome back</h1>
        <p className="text-[#888888] text-sm mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#032147] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#209dd7] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#032147] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#209dd7] focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#753991] hover:bg-[#5f2c75] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-[#888888] text-xs mt-6">
          Don&apos;t have an account?{' '}
          <button
            onClick={handleSubmit}
            className="text-[#209dd7] hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
