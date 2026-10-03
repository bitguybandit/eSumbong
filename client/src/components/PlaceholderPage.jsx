import { Link } from 'react-router-dom';

/**
 * Generic blank placeholder used by the static legal/support routes
 * (/help, /terms, /privacy). Intentionally minimal — content is added later.
 */
export default function PlaceholderPage({ title, note = 'This page is intentionally blank for now.' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{note}</p>
      <Link to="/" className="mt-6 text-sm font-semibold text-blue-700 hover:underline">
        ← Back to eSumbong
      </Link>
    </div>
  );
}
