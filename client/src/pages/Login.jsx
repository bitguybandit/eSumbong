import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Logo from '../components/Logo';

// Role-specific copy & visual identity for the shared /login page.
const ROLE_CONFIG = {
  resident: {
    tab: 'Resident',
    tabIcon: '👤',
    badge: 'CITIZEN PORTAL',
    badgeClass: 'bg-blue-100 text-blue-700',
    heading: 'Welcome back',
    subtitle: 'Sign in to access your submitted reports and check updates from the Barangay Officer.',
    emailLabel: 'Email Address',
    emailHint: 'Registered email associated with your resident profile',
    emailPlaceholder: 'you@example.com',
    button: 'Sign In',
    footer: "Don't have an account?",
    footerLinkLabel: 'Register',
    footerLinkTo: '/register',
  },
  officer: {
    tab: 'Officer',
    tabIcon: '🛡️',
    badge: 'OFFICER PORTAL',
    badgeClass: 'bg-teal-100 text-teal-700',
    heading: 'Officer Login',
    subtitle: 'Sign in to manage, triage, and resolve resident incident reports.',
    emailLabel: 'Official Email Address',
    emailHint: 'gov.ph domain',
    emailPlaceholder: 'officer.sdelacruz@iloilo.gov.ph',
    button: 'Sign In to Officer Portal',
    notice: 'Restricted Access: For authorized Barangay Officers only. Pre-provisioned credentials required.',
    footer: 'Not an assigned barangay officer?',
    footerLinkLabel: 'Return to eSumbong Citizen Portal',
    footerLinkTo: '/',
  },
};

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
function IconBuilding({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16m0 0h4v-7h-4m0 0V9m-8 4h4m-4 4h4" />
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
function IconPhone({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5c0 8 7 15 15 15l2-3-4-2-2 1a11 11 0 0 1-5-5l1-2-2-4-3 2Z" />
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

export default function Login() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('resident');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const cfg = ROLE_CONFIG[role];

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
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const emailField = (
    <div>
      <label className="label" htmlFor="email">
        {cfg.emailLabel}
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
          placeholder={cfg.emailPlaceholder}
        />
      </div>
      <p className="mt-1 pl-1 text-xs text-slate-400">{cfg.emailHint}</p>
    </div>
  );

  const passwordField = (
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
  );

  const errorBox = error && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
  );

  const submitButton = (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900"
    >
      {busy ? 'Signing in…' : cfg.button}
      {!busy && <IconArrow />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* Brand top bar */}
        <div className="mb-6 flex items-center justify-between gap-3">
          {role === 'officer' ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-800 text-white shadow-md">
                  <IconBuilding />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-bold text-slate-900">Republika ng Pilipinas</div>
                  <div className="text-xs text-slate-500">Sistemang Pamahalaang Lokal • Barangay Civic Access</div>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                PSGC Certified Node #0824
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Logo size="md" />
                <div className="leading-tight">
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    Barangay San Jose
                  </span>
                  <div className="text-xs text-slate-500">Republic of the Philippines • City Local Government</div>
                </div>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm sm:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                Official Resident Desk Active
              </span>
            </>
          )}
        </div>

        {/* Role switcher */}
        <div className="mx-auto mb-6 grid w-full max-w-sm grid-cols-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setRole('resident')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
              role === 'resident' ? 'bg-blue-800 text-white shadow-sm' : 'text-slate-500 hover:bg-blue-50'
            }`}
          >
            <span>{ROLE_CONFIG.resident.tabIcon}</span>
            {ROLE_CONFIG.resident.tab}
          </button>
          <button
            type="button"
            onClick={() => setRole('officer')}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
              role === 'officer' ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-500 hover:bg-blue-50'
            }`}
          >
            <span>{ROLE_CONFIG.officer.tabIcon}</span>
            {ROLE_CONFIG.officer.tab}
          </button>
        </div>

        {/* ===== Officer layout (Image 4) ===== */}
        {role === 'officer' ? (
          <div className="mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-2xl border-t-4 border-blue-800 bg-white shadow-xl">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <Logo size="lg" />
                  <div className="leading-tight">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badgeClass}`}>
                      {cfg.badge}
                    </span>
                    <div className="text-xs text-slate-500">Brgy. San Jose, Iloilo City</div>
                  </div>
                </div>

                <h1 className="mt-6 text-2xl font-bold text-slate-900">{cfg.heading}</h1>
                <p className="mt-1 text-sm text-slate-500">{cfg.subtitle}</p>

                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p className="text-xs leading-relaxed text-slate-600">{cfg.notice}</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {errorBox}
                  {emailField}
                  {passwordField}
                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 accent-blue-700"
                      />
                      Keep me signed in
                    </label>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      Auth v2 Node
                    </span>
                  </div>
                  {submitButton}
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <div className="text-sm text-slate-500">
                    {cfg.footer}{' '}
                    <Link to={cfg.footerLinkTo} className="font-semibold text-blue-700 hover:underline">
                      {cfg.footerLinkLabel}
                    </Link>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <IconShield className="h-3.5 w-3.5" />
                    RA 10173 (Data Privacy Act of 2012) Encrypted
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <IconPhone />
                </span>
                <div className="leading-tight">
                  <div className="font-medium">Need credentials provisioned? Contact Barangay Secretary</div>
                  <div className="text-xs text-slate-500">Brgy. Hall: (033) 329-0144</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ===== Resident layout (Image 3) ===== */
          <div className="grid overflow-hidden rounded-2xl bg-white shadow-xl lg:grid-cols-12">
            {/* Left: form */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    <IconLock className="h-3.5 w-3.5" />
                    Citizen Authentication Portal
                  </span>
                  <span className="text-xs text-slate-400">Form SEC-2024-SI</span>
                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back</h1>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Sign in to access your submitted reports and check updates from the Barangay Officer.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {errorBox}
                  {emailField}
                  {passwordField}
                  {submitButton}
                </form>

                <div className="my-5 flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">or</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <Link
                  to="/submit-complaint?guest=true"
                  className="flex w-full flex-col items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-center transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="text-sm font-semibold text-slate-800">Continue Without Registering</span>
                  <span className="mt-0.5 text-xs text-slate-500">
                    Submit a complaint anonymously without creating an account.
                  </span>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
                <div>
                  Don&apos;t have an account?
                  <Link to="/register" className="ml-1 font-bold text-blue-800 hover:underline">
                    Register
                  </Link>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <IconShield className="h-3.5 w-3.5" />
                  Data Privacy Act of 2012 Encrypted
                </span>
              </div>
            </div>

            {/* Right: trust panel */}
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
                    Direct &amp; Transparent Local Governance
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    eSumbong connects residents directly with the designated Barangay Officer,
                    ensuring every municipal concern is heard, timestamped, and addressed with
                    genuine accountability.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-white/80 p-3.5 shadow-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                      <IconPerson className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Direct Officer Review</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        All submissions route straight to the Barangay Officer&apos;s verified desk
                        without bureaucratic delays or departmental hand-offs.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white/80 p-3.5 shadow-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                      <IconShield className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Whistleblower &amp; Privacy Guard</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        Full compliance with Republic Act 10173. Your identity remains protected
                        whether logged in or filing as a guest.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg bg-white/80 p-3.5 shadow-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                      <IconClock className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">48-Hour Acknowledgment Pilot Target</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        Track status changes in real time with our live reference ID logging system.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Community notice */}
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 text-xl text-white">
                      🏛️
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-600">
                        Community Pilot Notice
                      </span>
                      <p className="truncate text-sm font-medium text-slate-900">
                        Barangay Hall Open: Mon - Fri, 8AM - 5PM
                      </p>
                      <p className="text-xs text-slate-500">San Jose Hotline: (02) 8920-1122</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between border-t border-blue-100 pt-4 text-xs text-slate-500">
                <span>Barangay San Jose Community Project</span>
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  <IconCheck className="h-3.5 w-3.5 text-teal-600" />
                  Civic Verified
                </span>
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Western Institute of Technology · BS in Information Technology · Academic software project
        </p>
      </div>
    </div>
  );
}
