import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo';
import StatusBadge from '../components/StatusBadge';
import api from '../lib/api';
import { ENTRY_TYPE_META, formatDateTime } from '../lib/constants';
import useReveal, { useRevealAll } from '../hooks/useReveal';

const TRACK_ENTRY_META = {
  status_change: { label: 'Status Updated', icon: '🔄' },
  action: { label: 'Action Taken', icon: '🛠️' },
  contact: { label: 'Contact Made', icon: '📞' },
};

const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Submit',
    desc: 'File a report with a photo and location. Choose whether to submit openly or anonymously.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5 12-12Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.5 5.5 4 4" />
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Track',
    desc: "Monitor your complaint's progress with a private tracking ID given upon submission.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Resolution',
    desc: 'See the action taken by the barangay with recorded notes and resolution proof.',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: 'Pinpoint Location',
    desc: 'Tag your report on an interactive map so the officer knows exactly where the issue is.',
    iconClass: 'bg-blue-50 text-blue-700',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Anonymous Reporting',
    desc: 'Submit sensitive complaints without revealing your identity to the officer.',
    iconClass: 'bg-teal-50 text-teal-700',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path strokeLinecap="round" d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
  {
    title: 'Status Notifications',
    desc: 'Receive real-time alerts when your complaint status changes — no need to keep checking.',
    iconClass: 'bg-amber-50 text-amber-700',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 2 5 2 5H4s2-1 2-5Z" />
        <path strokeLinecap="round" d="M10 20a2 2 0 0 0 4 0" />
      </svg>
    ),
  },
  {
    title: 'Full Audit Trail',
    desc: 'Every action taken on your complaint is timestamped and logged for full accountability.',
    iconClass: 'bg-teal-50 text-teal-700',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5" />
        <path strokeLinecap="round" d="M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    title: 'Direct Officer Review',
    desc: 'Complaints go straight to the designated Barangay Officer — no bureaucratic hand-offs.',
    iconClass: 'bg-blue-50 text-blue-700',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 15a2 2 0 0 1-2 2H8l-4 3V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10Z" />
      </svg>
    ),
  },
  {
    title: 'Privacy Protected',
    desc: 'Compliant with the Data Privacy Act of 2012 (RA 10173). Your data stays safe.',
    iconClass: 'bg-amber-50 text-amber-700',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

const LIFECYCLE_STEPS = ['Submitted', 'Under Review', 'Referred', 'Resolved', 'Closed'];

const METRICS = [
  { value: '48h', label: 'First Response Target' },
  { value: '100%', label: 'Audit Trail Coverage' },
  { value: 'RA 10173', label: 'Data Privacy Compliant' },
];

const FAQS = [
  {
    q: 'Do I need an account to submit a complaint?',
    a: 'No. You can submit a complaint as a guest by clicking "Continue Without Registering" on the landing page. You will receive a unique Tracking ID to check the status of your report at any time.',
  },
  {
    q: 'Can I report anonymously?',
    a: 'Yes. If you are logged in, you can toggle "Submit Anonymously" on the complaint form. Your identity will not be visible to the Barangay Officer. If you are a guest, you are already anonymous by default.',
  },
  {
    q: 'How do I track my complaint?',
    a: 'After submitting, you will receive a Tracking ID in the format ES-2026-XXXX. Enter it in the "Track your complaint" section on the landing page to see real-time updates, the officer\'s actions, and the resolution status.',
  },
  {
    q: 'What happens after I submit a complaint?',
    a: 'Your complaint goes through a transparent lifecycle: Submitted → Under Review → Referred → Resolved → Closed. A Barangay Officer reviews it, validates the details, refers it to the appropriate office, and logs every action taken. You will see each step on your tracking page.',
  },
  {
    q: 'Who reviews my complaint?',
    a: 'A designated Barangay Officer — a single unified role responsible for reviewing, validating, categorizing, referring, and resolving complaints. There are no middlemen or departmental hand-offs.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. eSumbong is compliant with the Data Privacy Act of 2012 (RA 10173). Your contact details are visible only to the designated Barangay Officer. Anonymous complaints do not store any identifying information.',
  },
  {
    q: 'What types of complaints can I submit?',
    a: 'You can report Broken Streetlights, Clogged Drainage, Illegal Dumping / Garbage, Noise Complaints, Potholes / Road Damage, Stray Animals, and other community concerns. For emergencies, please call the Barangay Hotline directly at (033) 337-0812.',
  },
  {
    q: 'Can I submit a complaint on my phone?',
    a: 'Yes. eSumbong is fully responsive and works on mobile phones, tablets, and desktop computers. You can submit a complaint, attach a photo, and pin your location from any device.',
  },
];

// Sections tracked by the landing nav scroll-spy (ids must exist in the markup).
const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'How it works', id: 'how' },
  { label: 'Features', id: 'features' },
  { label: 'Track', id: 'track' },
  { label: 'FAQ', id: 'faq' },
];

// --- Icons ---

function IconLock({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path strokeLinecap="round" d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconPin({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6.5-5.4 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10" r="2.4" />
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
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState('');
  const [trackBusy, setTrackBusy] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const headerRef = useReveal();
  const stepRefs = useRevealAll(PROCESS_STEPS.length);
  const featuresHeaderRef = useReveal();
  const featureRefs = useRevealAll(FEATURES.length);
  const lifecycleRef = useReveal();
  const metricsHeaderRef = useReveal();
  const metricRefs = useRevealAll(METRICS.length);
  const faqHeaderRef = useReveal();
  const faqListRef = useReveal();
  const trackRef = useReveal();
  const infoCardsRef = useReveal();
  const ctaRef = useReveal();
  const trackSectionRef = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTrack = () => {
    if (trackSectionRef.current) {
      trackSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  async function runTrack(id) {
    setTrackBusy(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const res = await api.get(`/complaints/track/${encodeURIComponent(id)}`);
      setTrackResult(res.data);
      // The public payload carries category_id only, so resolve the label once.
      if (res.data?.category_id && Object.keys(categoryMap).length === 0) {
        api
          .get('/categories')
          .then(({ data }) => {
            const map = {};
            (data || []).forEach((c) => {
              map[c.id] = c.name;
            });
            setCategoryMap(map);
          })
          .catch(() => {});
      }
    } catch (err) {
      setTrackError(
        err.status === 404
          ? 'No complaint found with that Tracking ID. Please check and try again.'
          : err.message
      );
    } finally {
      setTrackBusy(false);
    }
  }

  function handleTrack(e) {
    e.preventDefault();
    const id = trackingId.trim();
    if (!id) {
      setTrackError('Please enter your Tracking ID.');
      return;
    }
    runTrack(id);
  }

  // Deep link support (e.g. /?id=ES-2026-0008#track after a guest submission).
  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    setTrackingId(id);
    runTrack(id);
    // Let the result markup settle before bringing the section into view.
    const timer = setTimeout(() => {
      document.getElementById('track')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Scroll-spy: highlights the nav link for the section currently filling most
  // of the viewport. The observer stays subscribed so the highlight follows
  // both scroll directions; shares are recomputed on each callback because
  // these sections are taller than the viewport, so a single entry's
  // intersectionRatio can never reach the 40% mark on its own.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(Boolean);
    if (!sections.length || typeof IntersectionObserver === 'undefined') return undefined;

    const lastId = NAV_LINKS[NAV_LINKS.length - 1].id;

    const syncActiveSection = () => {
      // At the bottom of the page the CTA owns the viewport, so keep the last
      // nav-linked section highlighted instead of leaving the nav unstyled.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 50) {
        setActiveSection(lastId);
        return;
      }

      let best = null;
      let bestShare = 0;
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        const share = Math.max(0, visible) / window.innerHeight;
        if (share >= 0.4 && share > bestShare) {
          bestShare = share;
          best = section.id;
        }
      });

      if (best) setActiveSection(best);
    };

    const observer = new IntersectionObserver(syncActiveSection, {
      threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    });
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen scroll-smooth bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="inline-flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="flex items-center">
            <div className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.id);
                  }}
                  aria-current={activeSection === link.id ? 'location' : undefined}
                  className={
                    activeSection === link.id
                      ? 'whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 lg:px-3.5'
                      : 'whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900 lg:px-3.5'
                  }
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/login"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900 lg:px-3.5"
              >
                Submit
              </Link>
              <Link
                to="/login"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900 lg:px-3.5"
              >
                Login
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 md:hidden"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </nav>

          <Link
            to="/login"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-blue-800 text-white hover:bg-blue-900 md:inline-flex"
            aria-label="Login"
          >
            <IconPerson />
          </Link>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 text-xs font-extrabold text-white">
              eS
            </div>
            <span className="font-extrabold tracking-tight text-slate-900">eSumbong</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer links */}
        <div className="flex flex-col gap-1 px-4 py-6">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              scrollToTop();
            }}
            className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
          >
            Home
            <svg
              className="h-4 w-4 text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
          {[
            { label: 'How it works', href: '#how' },
            { label: 'Features', href: '#features' },
            { label: 'FAQ', href: '#faq' },
            { label: 'Track', href: '#track' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
            >
              {link.label}
              <svg
                className="h-4 w-4 text-slate-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </a>
          ))}
          {[
            { label: 'Submit', to: '/login' },
            { label: 'Login', to: '/login' },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
            >
              {link.label}
              <svg
                className="h-4 w-4 text-slate-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Drawer footer with Sign In CTA */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-4">
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600"
          >
            Sign In
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </aside>

      {/* Hero */}
      <section id="home" className="landing-hero relative overflow-hidden px-6 pb-24 pt-36">
        <div className="landing-hero-bg" />
        <div className="landing-hero-grid" />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-12">
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

            <Link
              to="/submit-complaint?guest=true"
              className="mt-3 inline-block text-xs font-medium text-slate-500 transition hover:text-blue-800 hover:underline"
            >
              or continue without registering →
            </Link>

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
              <div className="relative h-72">
                <img
                  src="/bhall.jpg"
                  alt="Barangay San Isidro Assistance Center"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/85 via-blue-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="mb-1 inline-block rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
                    Official Desk
                  </span>
                  <p className="text-base font-semibold leading-tight">Barangay San Jose Assistance Center</p>
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
      <section id="how" className="landing-how relative scroll-mt-16 px-6 py-28">
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <div ref={headerRef} className="reveal mb-16 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#1E40AF]">
              Civic Process
            </span>
            <h2 className="mt-4 text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold leading-tight tracking-tight text-slate-900">
              How eSumbong Works
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[1.05rem] text-slate-500">
              A transparent and direct path from community observation to official barangay action.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {PROCESS_STEPS.map((s, i) => (
              <div
                key={s.n}
                ref={stepRefs[i]}
                style={{ transitionDelay: `${i * 100}ms` }}
                className="reveal group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl"
              >
                {/* Top gradient accent bar that expands on hover */}
                <div className="absolute left-0 right-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-700 to-teal-600 transition-transform duration-500 group-hover:scale-x-100" />

                {/* Step number watermark */}
                <div className="absolute right-6 top-6 text-5xl font-extrabold leading-none text-slate-100 transition-colors duration-300 group-hover:text-blue-100">
                  {s.n}
                </div>

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 text-blue-700 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  {s.icon}
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features that Matter */}
      <section id="features" className="landing-features relative scroll-mt-16 overflow-hidden px-6 py-28">
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <div ref={featuresHeaderRef} className="reveal mb-16 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF4FF] px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#1E40AF]">
              Built for the Community
            </span>
            <h2 className="mt-4 text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold leading-tight tracking-tight text-slate-900">
              Features that Matter
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[1.05rem] text-slate-500">
              Designed with residents and barangay officers in mind — fast, private, and accountable.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                ref={featureRefs[i]}
                className="reveal group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${f.iconClass}`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint Lifecycle */}
      <section id="lifecycle" className="px-6 py-28">
        <div className="mx-auto max-w-[1180px]">
          <div
            ref={lifecycleRef}
            className="landing-lifecycle-card reveal relative overflow-hidden rounded-[28px] p-10 sm:px-12 sm:py-14"
          >
            <div className="relative z-10">
              {/* Section label */}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-widest text-white/90 ring-1 ring-inset ring-white/15 backdrop-blur">
                Complaint Lifecycle
              </span>

              {/* Title */}
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                From Submission to Closure
              </h2>

              {/* Description */}
              <p className="mt-3 max-w-2xl text-base text-white/70">
                Every complaint goes through a transparent, verifiable lifecycle.
              </p>

              {/* Flow row */}
              <div className="mt-10 flex flex-col gap-3 md:flex-row md:items-center">
                {LIFECYCLE_STEPS.map((name, i) => (
                  <Fragment key={name}>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center backdrop-blur transition hover:-translate-y-1 hover:bg-white/10">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                        STEP {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">{name}</div>
                    </div>
                    {i < LIFECYCLE_STEPS.length - 1 && (
                      <>
                        <div className="hidden text-2xl text-white/30 md:block">→</div>
                        <div className="block text-2xl text-white/30 md:hidden">↓</div>
                      </>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Targets */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-[1180px]">
          <div ref={metricsHeaderRef} className="reveal mb-16 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#0D9488]">
              Pilot Targets
            </span>
            <h2 className="mt-4 text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold leading-tight tracking-tight text-slate-900">
              Built to Deliver
            </h2>
            <p className="mx-auto mt-4 max-w-[620px] text-[1.05rem] text-slate-500">
              Our pilot metrics — measured, transparent, and verified.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {METRICS.map((m, i) => (
              <div
                key={m.label}
                ref={metricRefs[i]}
                className="landing-metric-card reveal group relative overflow-hidden rounded-[18px] border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="bg-gradient-to-br from-blue-700 to-teal-600 bg-clip-text text-5xl font-extrabold leading-none tracking-tight text-transparent">
                  {m.value}
                </div>
                <div className="mt-3 text-sm font-medium text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track */}
      <section id="track" ref={trackSectionRef} className="landing-track relative scroll-mt-16 px-6 py-28">
        <div className="mx-auto max-w-[1180px]">
          <div
            ref={trackRef}
            className="reveal relative mx-auto max-w-[780px] overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.14),0_4px_12px_-4px_rgba(15,23,42,0.04)] sm:px-10"
          >
            {/* Top gradient accent line */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-teal-600 to-blue-800" />

            {/* Icon tile */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 text-teal-600 shadow-[0_8px_20px_-8px_rgba(13,148,136,0.3)]">
              <IconSearch className="h-6 w-6" />
            </div>

            {/* Title */}
            <h2 className="text-center text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-tight text-slate-900">
              Track your complaint
            </h2>

            {/* Description */}
            <p className="mx-auto mb-8 mt-3 max-w-[460px] text-center text-[0.95rem] leading-relaxed text-slate-500">
              Check real-time updates and actions from the Barangay Officer using your issued ticket code.
            </p>

            {/* Search form */}
            <form onSubmit={handleTrack} className="mx-auto flex max-w-[560px] flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-[0.95rem] top-1/2 -translate-y-1/2 text-slate-400">
                  <IconPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your Tracking ID (e.g. ES-2026-XXXX)"
                  className="w-full rounded-xl border-[1.5px] border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
              </div>
              <button
                type="submit"
                disabled={trackBusy}
                className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-800 px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(30,64,175,0.25)] transition hover:-translate-y-px hover:bg-blue-700 disabled:opacity-60"
              >
                <IconSearch className="h-4 w-4" />
                {trackBusy ? 'Checking…' : 'Track Status'}
              </button>
            </form>

            {/* Helper text */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <IconLock className="h-3 w-3" />
              Codes are generated automatically when a submission is finalized.
            </div>

            {trackError && (
              <p className="mx-auto mt-6 max-w-[560px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {trackError}
              </p>
            )}

            {trackResult && (
              <div className="mx-auto mt-10 max-w-2xl space-y-4 text-left">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tracking ID
                    </div>
                    <div className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                      {trackResult.tracking_id}
                    </div>
                    {trackResult.category_id && (
                      <div className="mt-1 text-sm text-slate-500">
                        {categoryMap[trackResult.category_id] || 'Uncategorized'}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-slate-400">
                      Submitted {formatDateTime(trackResult.submitted_at)}
                    </div>
                  </div>
                  <StatusBadge status={trackResult.status} className="shrink-0" />
                </div>

                {trackResult.description && (
                  <p className="mt-4 whitespace-pre-line border-t border-slate-100 pt-4 text-sm text-slate-600">
                    {trackResult.description}
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">Status Timeline</h3>
                {trackResult.action_log_entries?.length > 0 ? (
                  <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                    {trackResult.action_log_entries.map((entry, i) => {
                      const meta =
                        TRACK_ENTRY_META[entry.type] ||
                        ENTRY_TYPE_META[entry.type] ||
                        { label: entry.type, icon: '•' };
                      const isLast = i === trackResult.action_log_entries.length - 1;
                      return (
                        <li key={i} className="relative">
                          <span
                            className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                              isLast ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {meta.icon}
                          </span>
                          <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
                          {entry.text && (
                            <div className="whitespace-pre-line text-sm text-slate-600">
                              {entry.text}
                            </div>
                          )}
                          <div className="mt-0.5 text-xs text-slate-400">
                            {formatDateTime(entry.created_at)}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-400">No status updates yet.</p>
                )}
              </div>
            </div>
          )}
          </div>

          {/* Info cards */}
          <div ref={infoCardsRef} className="reveal mt-16 grid gap-5 lg:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:border-blue-800/20 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EFF4FF] text-[#1E40AF]">
                <IconPolicy />
              </span>
              <div>
                <h4 className="mb-1.5 text-sm font-bold text-slate-900">Data Privacy Statement</h4>
                <p className="text-[0.82rem] leading-relaxed text-slate-500">
                  All submitted citizen details and evidence are held under the Republic Act 10173 (Data
                  Privacy Act of 2012). Your contact info is visible solely to the designated Barangay
                  Officer for resolution purposes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:border-blue-800/20 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#EFF4FF] text-[#1E40AF]">
                <IconPhone />
              </span>
              <div>
                <h4 className="mb-1.5 text-sm font-bold text-slate-900">Barangay Hall Direct Desk</h4>
                <p className="text-[0.82rem] leading-relaxed text-slate-500">
                  For emergencies or physical filing, please visit the Barangay San Isidro Hall along
                  Central Avenue or call the Officer hotdesk directly at (033) 329-0144.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 bg-white px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div ref={faqHeaderRef} className="reveal mb-14 text-center">
            <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-700">
              Common Questions
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-500">
              Everything you need to know about reporting and tracking complaints with eSumbong.
            </p>
          </div>

          <div ref={faqListRef} className="reveal space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-900 sm:text-base">{faq.q}</span>
                  <span
                    className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-slate-500">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-28">
        <div className="mx-auto max-w-[1180px]">
          <div
            ref={ctaRef}
            className="landing-cta-card reveal relative overflow-hidden rounded-[28px] px-6 py-16 text-center sm:px-12"
          >
            <div className="landing-cta-grid" />

            <div className="relative z-10">
              <h2 className="mx-auto max-w-3xl text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold leading-tight tracking-tight text-white">
                Be part of making our barangay cleaner, safer, and more responsive.
              </h2>

              <p className="mx-auto mt-5 max-w-[580px] text-base leading-relaxed text-white/70">
                Your neighborhood reports help barangay officials prioritize streetlights, drainage
                declogging, and safety patrols where our residents need them most.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)]"
                >
                  File a Complaint Now
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={scrollToTrack}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-6 py-3.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                >
                  Track Existing Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 border-b border-white/10 px-6 pb-7 pt-12 text-center md:flex-row md:text-left">
          <div>
            <div className="text-sm font-semibold text-white">eSumbong Civic Action Portal</div>
            <p className="mt-1 text-xs text-white/45">
              Pilot project for Barangay San Jose, Iloilo City. RA 10173 Data Privacy Act Compliant.
            </p>
          </div>
          <div className="flex items-center gap-6 text-[0.82rem] font-medium text-white/60">
            <span className="cursor-pointer transition hover:text-white">Privacy Policy</span>
            <span className="cursor-pointer transition hover:text-white">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
