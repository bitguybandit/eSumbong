import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

function IconMail() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage('Check your email for a password reset link.');
    } catch (err) {
      setError(err?.message || 'Unable to send the reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand top bar — same treatment as the login page */}
        <div className="mb-3 flex items-center gap-2.5 md:gap-3">
          <div className="shrink-0 overflow-hidden bg-transparent">
            <Logo size="md" className="h-8 w-auto object-contain" />
          </div>
          <div className="leading-tight">
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
              Barangay San Jose
            </span>
            <div className="mt-0.5 hidden text-xs text-slate-500 md:block dark:text-slate-400">
              Republic of the Philippines • City Local Government
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-xl sm:p-8 dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="mt-1 text-[13px] leading-snug text-slate-500 dark:text-slate-400">
            Enter the email address registered to your resident profile and we will send you a
            secure link to choose a new password.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400">
                {message}
              </div>
            )}

            <div>
              <label className="label" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <IconMail />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input h-12 pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-1 text-center text-[11px] text-slate-400 dark:text-slate-500">
            For your security, we do not disclose whether an email is registered.
          </p>

          <div className="mt-4 border-t border-slate-100 pt-3 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <Link to="/login" className="font-bold text-blue-800 hover:underline dark:text-blue-400">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
