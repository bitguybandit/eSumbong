import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import Logo from '../../components/Logo';

// --- Icons ---
function IconMail({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
    </svg>
  );
}
function IconLock({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function IconEye({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" d="m3 3 18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
      <path d="M9.9 5.3A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.3 17.3 0 0 1-3 3.9M6.6 6.6C3.8 8.6 2 12 2 12s3.5 7 10 7a10.3 10.3 0 0 0 4.4-1" />
    </svg>
  );
}
function IconArrow({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
function IconShield({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
    </svg>
  );
}
function IconQueue({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h9" />
      <circle cx="18" cy="18" r="2.5" />
    </svg>
  );
}
function IconLogs({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
      <path strokeLinecap="round" d="M9 13h6M9 17h4" />
    </svg>
  );
}
function IconCheck({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4 10-10" />
    </svg>
  );
}

export default function OfficerLogin() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { session } = await signIn(email.trim(), password);
      // Confirm the account actually holds the barangay officer role before
      // letting it into the operational dashboard.
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const roleType = res.data?.profile?.role_type;
      if (roleType === 'officer') {
        navigate('/officer', { replace: true });
      } else {
        await signOut().catch(() => {});
        setError('Access denied. Please use the resident portal.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Brand top bar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div className="leading-tight">
              <span className="rounded-full bg-blue-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Official Use
              </span>
              <div className="text-xs text-slate-500">Republic of the Philippines • City Local Government</div>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Barangay San Jose • Officer Desk
          </span>
        </div>

        <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-12">
          {/* Left: form */}
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  <IconLock className="h-3.5 w-3.5" />
                  🔒 Official Staff Access
                </span>
                <span className="text-xs text-slate-400">Form OPS-2024-SI</span>
              </div>

              <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Barangay Officer Portal
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                Sign in to access the complaint queue and process citizen reports.
              </p>

              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p className="text-xs leading-relaxed text-slate-600">
                  Restricted access. This portal is for authorized Barangay Officers with
                  pre-provisioned credentials only.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="label" htmlFor="email">
                    Official Email Address
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
                      className="input pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.sdelacruz@iloilo.gov.ph"
                    />
                  </div>
                  <p className="mt-1 pl-1 text-xs text-slate-400">gov.ph domain</p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="label" htmlFor="password">
                      Password
                    </label>
                    <button type="button" className="text-xs font-semibold text-blue-700 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <IconLock />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      className="input pl-10 pr-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800"
                >
                  {busy ? 'Signing in…' : 'Sign In to Dashboard'}
                  {!busy && <IconArrow />}
                </button>
              </form>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <span className="text-xs text-slate-400">
                Credentials are provisioned by the Barangay Secretary.
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <IconShield className="h-3.5 w-3.5" />
                RA 10173 (Data Privacy Act of 2012) Encrypted
              </span>
            </div>
          </div>

          {/* Right: operations panel */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-blue-50 p-6 sm:p-8 lg:col-span-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-200/50 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-teal-200/50 blur-xl" />

            <div className="relative z-10 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                <span className="h-2 w-2 rounded-full bg-blue-700" />
                Barangay San Jose, Iloilo City
              </span>

              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Case Management Dashboard
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  The officer workspace for triaging citizen reports from receipt through
                  verified resolution, with every action recorded.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-lg bg-white/80 p-3.5 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                    <IconQueue className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Complaint Queue</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Review incoming reports by status, category and date so nothing waits
                      unassigned in the queue.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-white/80 p-3.5 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <IconLogs className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Action Logs</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Every validation, referral and resolution is timestamped and attributed,
                      keeping closures verifiable.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-white/80 p-3.5 shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                    <IconShield className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Restricted Access</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      Resident accounts are rejected here and redirected to the citizen portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center justify-between border-t border-blue-100 pt-4 text-xs text-slate-500">
              <span>Barangay San Jose Community Project</span>
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <IconCheck className="h-3.5 w-3.5 text-teal-600" />
                Officer Access Verified
              </span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Western Institute of Technology · BS in Information Technology · Academic software project
        </p>
      </div>
    </div>
  );
}
