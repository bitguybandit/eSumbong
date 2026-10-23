import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

const MIN_LENGTH = 8;

function IconLock() {
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
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // Supabase turns the emailed link into a temporary recovery session; until
  // that exists there is nothing to update, so the form stays gated.
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setHasSession(Boolean(data.session));
      setChecking(false);
    });

    // The PKCE/implicit callback can land after the first getSession() call, so
    // also wait for the recovery event itself.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true);
        setChecking(false);
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage('Password updated. Redirecting to sign in…');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err?.message || 'Unable to update your password. Please try again.');
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
            Create New Password
          </h1>
          <p className="mt-1 text-[13px] leading-snug text-slate-500 dark:text-slate-400">
            Choose a password of at least {MIN_LENGTH} characters for your resident account.
          </p>

          {checking ? (
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400" role="status">
              Verifying your reset link…
            </p>
          ) : !hasSession ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
                This password reset link is invalid or has expired. Request a new one to continue.
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900"
              >
                Request a New Link
              </Link>
            </div>
          ) : (
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
                <label className="label" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IconLock />
                  </span>
                  <input
                    id="new-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="input h-12 pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <IconLock />
                  </span>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="input h-12 pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(message)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}

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
