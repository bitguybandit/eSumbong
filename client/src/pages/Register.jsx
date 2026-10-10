import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Logo from '../components/Logo';

// --- Icons ---
function IconPerson({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}
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
function IconShield({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
    </svg>
  );
}
function IconVerified({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}
function IconPolicy({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path strokeLinecap="round" d="M9 12l2 2 4-4" />
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
function IconBell({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Zm4 11a2 2 0 0 0 4 0" />
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

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const { session } = await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
      });

      if (session) {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        navigate(res.data.profile.role_type === 'officer' ? '/officer' : '/resident', {
          replace: true,
        });
      } else {
        setNotice(
          'Account created! Please check your email to confirm your address, then sign in.'
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl">
        {/* Brand top bar */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div className="leading-tight">
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Barangay San Jose
              </span>
              <div className="text-xs text-slate-500">Republic of the Philippines • City Local Government</div>
            </div>
          </div>
        </div>

        <div className="grid w-full items-stretch gap-6 lg:grid-cols-2">
          {/* LEFT: Registration form */}
          <div className="flex flex-col rounded-xl bg-white p-6 shadow-md ring-1 ring-slate-100 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create your Resident Account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Register to track all your community complaints in one place, receive instant status
            notices, and verify resolutions.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {notice && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {notice}
              </div>
            )}

            <div>
              <label className="label" htmlFor="fullName">
                Full Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <IconPerson />
                </span>
                <input
                  id="fullName"
                  required
                  className="input bg-blue-50/60 pl-10 focus:bg-white"
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="Juan Dela Cruz"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="regEmail">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <IconMail />
                </span>
                <input
                  id="regEmail"
                  type="email"
                  required
                  autoComplete="email"
                  className="input bg-blue-50/60 pl-10 focus:bg-white"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="regPassword">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <IconLock />
                </span>
                <input
                  id="regPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="input bg-blue-50/60 pl-10 pr-11 focus:bg-white"
                  value={form.password}
                  onChange={update('password')}
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
              <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                At least 8 characters with letters &amp; numbers
              </p>
            </div>

            <div>
              <label className="label" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <IconLock />
                </span>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="input bg-blue-50/60 pl-10 focus:bg-white"
                  value={form.confirm}
                  onChange={update('confirm')}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-900 hover:shadow-lg"
            >
              {busy ? 'Creating account…' : 'Create Account'}
              {!busy && <IconArrow />}
            </button>
          </form>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>

          {/* Guest access */}
          <div className="mt-6 flex flex-col items-center gap-1 rounded-xl bg-blue-50 p-4 text-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <IconShield className="h-4 w-4" />
              Privacy First
            </span>
            <p className="text-sm text-slate-800">
              Want to submit anonymously?
              <Link to="/login" className="ml-1 font-semibold text-blue-800 hover:underline">
                Continue as Guest
              </Link>
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              Your identity remains undisclosed. You will receive a unique tracking token for
              follow-ups.
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?
            <Link to="/login" className="ml-1 font-semibold text-blue-800 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* RIGHT: Civic trust panel */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-blue-100/70 p-6 shadow-sm sm:p-8">
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-800 to-blue-950 p-4 text-white shadow-xl">
  
              {/* Top Row: Case ID + Status */}
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-200">
                  Case #ES-2026-0042
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-bold text-teal-400">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Resolved
                </span>
              </div>

              {/* Header */}
              <h3 className="mt-4 text-xl font-extrabold tracking-tight text-white">
                Clogged Drainage &amp; Flood Hazard
              </h3>
              <p className="mt-1 text-sm text-blue-300">
                Zone 3, Narra St. <span className="text-blue-500">•</span> Verified Resident Report
              </p>

              {/* Timeline */}
              <div className="relative mt-6 ml-2 space-y-4 border-l border-blue-700/50 pl-6">
                
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-950 bg-blue-500" />
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-white">1. Citizen Submission</p>
                    <p className="text-xs text-blue-300">Sep 24, 8:15 AM</p>
                  </div>
                  <p className="mt-0.5 text-xs text-blue-200">
                    Automated geo-tagging &amp; resident verification logged.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-950 bg-blue-500" />
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-white">2. Dispatched to Quick Response</p>
                    <p className="text-xs text-blue-300">Sep 24, 10:30 AM</p>
                  </div>
                  <p className="mt-0.5 text-xs text-blue-200">
                    Assigned to Kagawad &amp; Tanod Sanitation Unit (Team Delta).
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-blue-950 bg-teal-400" />
                  <div className="flex items-center justify-between text-sm">
                    <p className="flex items-center gap-1.5 font-semibold text-white">
                      3. Cleared &amp; Verified
                      <svg className="h-3.5 w-3.5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </p>
                    <p className="text-xs text-blue-300">Sep 25, 2:48 PM</p>
                  </div>
                  <p className="mt-0.5 text-xs text-blue-200">
                    Culvert unblocked, waste removed, and storm run-off restored.
                  </p>
                </div>
              </div>

              {/* Before / After Comparison */}
              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-center">
                  <p className="flex items-center justify-center gap-1 text-xs font-bold text-red-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                    Before: Blocked
                  </p>
                  <p className="mt-1 text-[10px] text-red-200">
                    Debris &amp; stagnant water
                  </p>
                </div>
                <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 text-center">
                  <p className="flex items-center justify-center gap-1 text-xs font-bold text-teal-400">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    After: Cleared
                  </p>
                  <p className="mt-1 text-[10px] text-teal-200">
                    Free-flowing culvert
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-blue-700/50 pt-3">
                <div className="flex items-center gap-2 text-xs font-medium text-teal-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  Turnaround: 30h 25m <span className="text-blue-300">(Target &lt;48h)</span>
                </div>
                <p className="text-[10px] font-bold tracking-wider text-teal-400">
                  GRASSROOTS GOVERNANCE
                </p>
              </div>

            </div>

            {/* Safety guarantee */}
            <div className="flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-800">
                  <IconPolicy />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Protected Civic Channel</div>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                    Your information is encrypted and strictly accessible only by the authorized
                    Barangay Officer.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
                  <IconClock className="h-4 w-4 shrink-0 text-teal-600" />
                  24/7 Case Tracking
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
                  <IconBell className="h-4 w-4 shrink-0 text-teal-600" />
                  Real-Time In-App Notifications
                </div>
              </div>
            </div>
          </div>

          {/* DPA compliance */}
          <div className="relative z-10 mt-5 flex items-start gap-3 rounded-lg bg-blue-50 p-4">
            <IconPolicy className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Data Privacy Act of 2012 (RA 10173) Compliant
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                Personal records and report evidence collected within this portal are managed with
                rigorous administrative protocols, restricted exclusively to the jurisdiction of the
                Barangay Officer.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
