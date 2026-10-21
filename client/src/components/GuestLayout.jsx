import { Link, Outlet } from 'react-router-dom';
import Logo from './Logo';

/**
 * Public shell for unauthenticated flows (guest complaint filing).
 * The resident and officer portals keep their own layouts — this one only
 * provides branding, an escape route, and a width-constrained content well
 * so the guest wizard never stretches past the viewport.
 */
export default function GuestLayout() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <Link to="/" className="inline-flex min-w-0 items-center" aria-label="eSumbong home">
          <Logo size="md" />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Log In
          </Link>
          <Link
            to="/"
            aria-label="Cancel and return home"
            title="Cancel"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-lg leading-none text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ✕
          </Link>
        </div>
      </header>

      <div className="bg-red-50 py-1 text-center text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <span aria-hidden="true">🚨</span> Emergency? Call the Barangay Hotline:{' '}
        <a href="tel:+639205115666" className="font-semibold underline">
          0920 511 5666
        </a>
      </div>

      <main className="mx-auto w-full max-w-4xl min-w-0 p-4 pb-24 md:p-6 md:pb-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
