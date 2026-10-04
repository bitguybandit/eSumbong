import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Submit',
    desc: 'File a report with photo and location. Choose whether to submit openly or anonymously.',
    tag: 'Add photos & landmark',
    tagColor: 'text-blue-700',
    icon: '📷',
  },
  {
    n: '02',
    title: 'Track',
    desc: "Monitor your complaint's progress with a private ticket ID given upon submission.",
    tag: 'Live progress checkpoints',
    tagColor: 'text-teal-600',
    icon: '🔄',
  },
  {
    n: '03',
    title: 'Resolution',
    desc: 'See the action taken by the barangay with recorded notes and resolution proof.',
    tag: 'Official closure documentation',
    tagColor: 'text-blue-700',
    icon: '✅',
  },
];

// --- Icons ---
function IconShield({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
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
function IconPlus({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
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
function IconLock({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
function IconPin({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function IconSearch({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" d="m21 21-4.35-4.35" />
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
function IconPolicy({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
      <path strokeLinecap="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}
function IconPhone({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5c0 8 7 15 15 15l2-3-4-2-2 1a11 11 0 0 1-5-5l1-2-2-4-3 2Z" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');

  function handleTrack(e) {
    e.preventDefault();
    const id = trackingId.trim();
    if (id) navigate(`/resident/track?id=${encodeURIComponent(id)}`);
  }

  return (
    <div className="min-h-screen scroll-smooth bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="inline-flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/" className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
              Home
            </Link>
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900">
              Submit
            </Link>
            <a href="#track" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900">
              Track
            </a>
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900">
              Login
            </Link>
          </nav>

          <Link
            to="/login"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-800 text-white hover:bg-blue-900"
            aria-label="Login"
          >
            <IconPerson />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 -top-24 h-96 w-96 rounded-full bg-blue-100 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-teal-100 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-8 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                <IconShield className="h-3.5 w-3.5" />
                Data Privacy Act Compliant (RA 10173)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <IconEyeOff className="h-3.5 w-3.5 text-teal-600" />
                Privacy First • Anonymous Options Available
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Report. Track. Resolve.
              <br />
              <span className="text-blue-800">Help improve our barangay.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Directly connects residents to the Barangay Officer for swift, accountable action.
              Every report is reviewed with care and confidentiality.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900"
              >
                <IconPlus />
                Submit a Complaint
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              Already have an account?
              <Link to="/login" className="inline-flex items-center gap-0.5 font-semibold text-blue-800 hover:underline">
                Login
                <IconArrow className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-100">
              <div className="relative h-72 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/85 via-blue-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="mb-1 inline-block rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                    Official Desk
                  </span>
                  <p className="text-base font-semibold leading-tight">Barangay San Isidro Assistance Center</p>
                  <p className="text-xs text-blue-100">Open weekdays 8:00 AM – 5:00 PM</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800">
                    <IconPerson className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Barangay Officer</div>
                    <div className="text-xs text-slate-500">Assigned public complaints reviewer</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  On Duty
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Civic Process</span>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">How eSumbong Works</h2>
          <p className="mt-2 text-slate-600">
            A transparent and direct path from community observation to official barangay action.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PROCESS_STEPS.map((s) => (
            <div key={s.n} className="flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-2xl">{s.icon}</span>
                <span className="text-2xl font-extrabold text-blue-100">{s.n}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              <div className={`mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold ${s.tagColor}`}>
                {s.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Track */}
      <section id="track" className="scroll-mt-16 bg-blue-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-800">
            <IconSearch className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Track your complaint</h2>
          <p className="mx-auto mt-2 max-w-xl text-slate-600">
            Check real-time updates and actions from the Barangay Officer using your issued ticket code.
          </p>
          <form onSubmit={handleTrack} className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <IconPin />
              </span>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your Tracking ID (e.g. ES-2026-XXXX)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-blue-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
            >
              <IconSearch />
              Track Status
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
            <IconLock className="h-3.5 w-3.5" />
            Codes are generated automatically when a submission is finalized.
          </div>
        </div>
      </section>

      {/* Compliance cards */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-800">
              <IconPolicy />
            </span>
            <div>
              <h4 className="font-semibold text-slate-900">Data Privacy Statement</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                All submitted citizen details and evidence are held under the Republic Act 10173 (Data
                Privacy Act of 2012). Your contact info is visible solely to the designated Barangay
                Officer for resolution purposes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <IconPhone />
            </span>
            <div>
              <h4 className="font-semibold text-slate-900">Barangay Hall Direct Desk</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                For emergencies or physical filing, please visit the Barangay San Isidro Hall along
                Central Avenue or call the Officer hotdesk directly at (033) 329-0144.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:px-8 md:text-left">
          <div>
            <div className="text-sm font-semibold text-slate-900">eSumbong Civic Action Portal</div>
            <p className="mt-1 text-xs text-slate-500">
              Pilot project for Barangay San Isidro, Iloilo City. RA 10173 Data Privacy Act Compliant.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span className="cursor-pointer hover:text-blue-800">Privacy Policy</span>
            <span className="cursor-pointer hover:text-blue-800">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
