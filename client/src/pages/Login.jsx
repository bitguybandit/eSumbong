import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Logo from '../components/Logo';

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
function IconPerson({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}
function IconClock({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 2" />
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

// Supabase answers a wrong password and an unknown email with the same
// "Invalid login credentials" text, but it uses dedicated codes for
// unconfirmed or banned accounts — showing those verbatim would let anyone
// probe which emails are registered. Every credential/account-state failure
// is collapsed onto one message; rate limiting is left alone because it says
// nothing about the account.
const UNIFORM_LOGIN_ERROR = 'Invalid email or password.';
const CREDENTIAL_ERROR_CODES = new Set([
  'invalid_credentials',
  'email_not_confirmed',
  'phone_not_confirmed',
  'user_not_found',
  'user_banned',
]);

function loginErrorMessage(err) {
  if (CREDENTIAL_ERROR_CODES.has(err?.code)) return UNIFORM_LOGIN_ERROR;
  if (/invalid login credentials/i.test(err?.message || '')) return UNIFORM_LOGIN_ERROR;
  return err?.message || 'Unable to sign in. Please try again.';
}

export default function Login() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { session } = await signIn(email.trim(), password);
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const roleType = res.data?.profile?.role_type;
      if (roleType === 'officer') {
        navigate('/officer', { replace: true });
      } else if (roleType === 'resident') {
        navigate('/resident', { replace: true });
      } else {
        await signOut().catch(() => {});
        setError('This account has no valid application role. Contact the Barangay Secretary.');
      }
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const emailField = (
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
      <p className="mt-0.5 hidden pl-1 text-xs text-slate-400 md:block dark:text-slate-500">Registered email associated with your resident profile</p>
    </div>
  );

  const passwordField = (
    <div>
      <div className="flex items-center justify-between">
        <label className="label" htmlFor="password">
          Password
        </label>
        <Link to="/forgot-password" className="text-xs font-semibold text-blue-700 hover:underline">
          Forgot password?
        </Link>
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
          className="input h-12 pl-10 pr-11"
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
  );

  const errorBox = error && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">{error}</div>
  );

  const submitButton = (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900"
    >
      {busy ? 'Signing in…' : 'Sign In'}
      {!busy && <IconArrow />}
    </button>
  );

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 px-4 py-5 md:py-8 dark:bg-slate-950">
      <div className="w-full max-w-5xl">
        {/* Brand top bar */}
        <div className="mb-3 flex items-center justify-between gap-3 bg-transparent">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="shrink-0 overflow-hidden bg-transparent">
              <Logo size="md" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex items-center leading-tight md:block">
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                Barangay San Jose
              </span>
              <div className="hidden text-xs text-slate-500 md:mt-0.5 md:block dark:text-slate-400">
                Republic of the Philippines • City Local Government
              </div>
            </div>
          </div>
        </div>

        {/* ===== Resident layout ===== */}
        <div className="grid w-full max-w-5xl grid-cols-1 items-stretch overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 md:grid-cols-2">
          {/* Left: form */}
          <div className="flex flex-col justify-between p-5 sm:p-8 lg:p-10">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                  <IconLock className="h-3.5 w-3.5" />
                  Citizen Authentication Portal
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl dark:text-white">Welcome back</h1>
              <p className="mt-1 text-[13px] leading-snug text-slate-500 dark:text-slate-400">
                Sign in to access your submitted reports and check updates from the Barangay Officer.
              </p>

              {/* Desktop-only explainer — mobile gets the compact note above the email field */}
              <div className="mt-4 hidden items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] leading-snug text-slate-600 md:flex dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="5" y="11" width="14" height="9" rx="1.5" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                <span>
                  Your account is used to track submitted reports. To file a complaint without
                  registering, choose the guest option below.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="mt-2 space-y-3 md:mt-3 md:space-y-2.5">
                {errorBox}
                <p className="text-[11px] leading-snug text-slate-500 md:hidden dark:text-slate-400">
                  Your account keeps your reports in one place — or continue as a guest below.
                </p>
                {emailField}
                {passwordField}
                {submitButton}
              </form>

              <p className="mt-1 text-center text-[11px] text-slate-400 md:text-xs dark:text-slate-500">
                For your security, we do not disclose whether an email is registered.
              </p>

              <div className="my-2 flex items-center gap-3 md:my-1.5">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">or</span>
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              <Link
                to="/submit-complaint?guest=true"
                className="flex w-full flex-col items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-center transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-500 dark:hover:bg-slate-800"
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Continue Without Registering</span>
                <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Submit a complaint anonymously without creating an account.
                </span>
              </Link>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <div>
                Don&apos;t have an account?
                <Link to="/register" className="ml-1 font-bold text-blue-800 hover:underline dark:text-blue-400">
                  Register
                </Link>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <IconShield className="h-3.5 w-3.5" />
                Data Privacy Act of 2012 Encrypted
              </span>
            </div>
          </div>

          {/* Right: trust panel */}
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-blue-50 to-teal-50 p-6 sm:p-8 lg:p-10 dark:from-slate-900 dark:to-slate-800/40">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-200/50 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-teal-200/50 blur-xl" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-700" />
                Barangay San Jose, Iloilo City
              </span>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Direct &amp; Transparent Local Governance
                </h2>
                <p className="mt-1.5 text-[13px] leading-snug text-slate-600 dark:text-slate-300">
                  eSumbong connects residents directly with the designated Barangay Officer,
                  ensuring every municipal concern is heard, timestamped, and addressed with
                  genuine accountability.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5 rounded-lg bg-white/80 p-3 shadow-sm dark:bg-slate-800/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                    <IconPerson className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Direct Officer Review</h3>
                    <p className="text-xs leading-snug text-slate-600 dark:text-slate-300">
                      All submissions route straight to the Barangay Officer&apos;s verified desk
                      without bureaucratic delays or departmental hand-offs.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg bg-white/80 p-3 shadow-sm dark:bg-slate-800/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                    <IconShield className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">Whistleblower &amp; Privacy Guard</h3>
                    <p className="text-xs leading-snug text-slate-600 dark:text-slate-300">
                      Full compliance with Republic Act 10173. Your identity remains protected
                      whether logged in or filing as a guest.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg bg-white/80 p-3 shadow-sm dark:bg-slate-800/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300">
                    <IconClock className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900 dark:text-white">48-Hour Acknowledgment Pilot Target</h3>
                    <p className="text-xs leading-snug text-slate-600 dark:text-slate-300">
                      Track status changes in real time with our live reference ID logging system.
                    </p>
                  </div>
                </div>
                              <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M9 12h.01M15 12h.01" />
                  </svg>
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    Community Notice
                  </p>
                  <h3 className="mt-0.5 text-[13px] font-semibold text-slate-900 dark:text-white">
                    Barangay Hall Open: Mon – Fri, 8AM – 5PM
                  </h3>
                  <p className="text-xs leading-snug text-slate-600 dark:text-slate-300">
                    San Jose Hotline: (+63) 920 835 6781
                  </p>
                </div>
              </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex items-center justify-between border-t border-blue-100 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <span>Barangay San Jose Community Project</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
