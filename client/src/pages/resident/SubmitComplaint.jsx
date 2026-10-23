import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import MapPicker from '../../components/MapPicker';
import PhotoUpload from '../../components/PhotoUpload';
import { categoryIcon } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';

// Desktop keeps the combined "Category & Location" step (3 steps total),
// while phones get a dedicated map-only step (4 steps total).
const DESKTOP_STEPS = [
  { key: 'category', label: 'Category & Location' },
  { key: 'details', label: 'Details' },
  { key: 'review', label: 'Review' },
];

const MOBILE_STEPS = [
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'details', label: 'Details' },
  { key: 'review', label: 'Review' },
];

const PHOTO_REQUIRED_ERROR = 'This category requires a photo attachment.';

/** Physical categories carry `requires_photo`; "Other" never requires a photo. */
function categoryRequiresPhoto(categories, categoryId) {
  return Boolean(categories.find((c) => c.id === categoryId)?.requires_photo);
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function WizardHeader({ step, total, label, onBack, onClose }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg px-2 py-1 text-xl text-slate-600 hover:bg-slate-100"
          aria-label="Back"
        >
          ←
        </button>
        <div className="text-sm font-semibold text-blue-600">
          Step {step} of {total} · {label}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-lg text-slate-600 hover:bg-slate-100"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function NextTimeline() {
  const steps = [
    { label: 'Review', desc: 'Our team will review your report within 24-48 hours.' },
    { label: 'Action', desc: 'We will assign the appropriate department to resolve the issue.' },
    { label: 'Resolution', desc: 'You will be notified once the issue is marked as resolved.' },
  ];
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {steps.map((s, i) => (
        <li key={s.label} className="relative">
          <span
            className={`absolute -left-[27px] top-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              i === 0 ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 bg-white text-transparent'
            }`}
          >
            ✓
          </span>
          <div className="text-sm font-semibold text-slate-900">{s.label}</div>
          <div className="text-xs text-slate-500">{s.desc}</div>
        </li>
      ))}
    </ol>
  );
}

function Confirmation({ trackingId, isGuest }) {
  return (
    <div className="mx-auto max-w-md space-y-6 py-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
        ✓
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Thank you!</h1>
        <p className="mt-1 text-sm text-slate-500">Your report has been submitted.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Report ID</div>
        <div className="mt-1.5 rounded-lg bg-blue-50 py-2 text-lg font-bold tracking-wide text-blue-700">
          {trackingId}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            i
          </span>
          <span className="font-semibold text-slate-900">What happens next?</span>
        </div>
        <NextTimeline />
      </div>

      <div className="space-y-2.5">
        <Link
          to={
            isGuest
              ? `/?id=${encodeURIComponent(trackingId)}#track`
              : `/resident/track?id=${trackingId}`
          }
          className="btn-primary w-full"
        >
          ⊕ Track Report
        </Link>
        <Link to={isGuest ? '/' : '/resident'} className="btn-secondary w-full">
          ⌂ Go to Home
        </Link>
      </div>
    </div>
  );
}

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  // Guest mode: an unauthenticated visitor filing a complaint. The public
  // `/submit-complaint` route is guest-only, so deriving this from the route
  // (not just `?guest=true`) keeps mobile/in-app browsers that drop the query
  // string from falling back to resident behavior and sending a token.
  // Guests are already anonymous, so the anonymity toggle is not shown.
  const isGuest =
    pathname.startsWith('/submit-complaint') || searchParams.get('guest') === 'true';
  // Inside the resident portal the flow sits above the fixed bottom tab bar;
  // the public guest route has no tab bar, so the action bar can hug the edge.
  const hasBottomNav = pathname.startsWith('/resident');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const steps = isDesktop ? DESKTOP_STEPS : MOBILE_STEPS;
  const [categories, setCategories] = useState([]);
  const [stepKey, setStepKey] = useState('category');
  const stepIndex = Math.max(0, steps.findIndex((s) => s.key === stepKey));

  const [categoryId, setCategoryId] = useState('');
  const [otherText, setOtherText] = useState('');
  const [position, setPosition] = useState(null);
  const [locationText, setLocationText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [photoMetadata, setPhotoMetadata] = useState(null);
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  function next() {
    setError('');
    if (stepKey === 'category') {
      if (!categoryId) {
        setError('Please select a category to continue.');
        return;
      }
      if (categoryId === 'other' && !otherText.trim()) {
        setError('Please specify the issue for "Other".');
        return;
      }
      // On phones the map lives on its own step, so location is validated there.
      if (isDesktop && !position) {
        setError('Please confirm a location to continue.');
        return;
      }
    }
    if (stepKey === 'location' && !position) {
      setError('Please confirm a location to continue.');
      return;
    }
    if (stepKey === 'details' && description.trim().length < 10) {
      setError('Please provide a description of at least 10 characters.');
      return;
    }
    if (
      stepKey === 'details' &&
      categoryRequiresPhoto(categories, categoryId) &&
      !photoUrl
    ) {
      setError(PHOTO_REQUIRED_ERROR);
      return;
    }
    if (stepIndex < steps.length - 1) setStepKey(steps[stepIndex + 1].key);
  }

  function back() {
    setError('');
    if (stepIndex > 0) setStepKey(steps[stepIndex - 1].key);
    else navigate('/resident');
  }

  async function searchLocation() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (data[0]) {
        setPosition({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
        setLocationText(data[0].display_name);
      } else {
        setError('Location not found. Try a different search.');
      }
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  async function submit() {
    if (categoryRequiresPhoto(categories, categoryId) && !photoUrl) {
      setError(PHOTO_REQUIRED_ERROR);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const finalDescription =
        categoryId === 'other' && otherText.trim()
          ? `${otherText.trim()} — ${description.trim()}`
          : description.trim();
      const payload = {
        description: finalDescription,
        category_id: categoryId === 'other' ? null : categoryId || null,
        latitude: position.lat,
        longitude: position.lng,
        location_text: locationText || null,
        photo_path: photoUrl || null,
        photo_metadata: photoMetadata,
        anonymous,
      };
      const res = await api.post(
        '/complaints',
        payload,
        // Guest submissions are unauthenticated: send no Authorization header
        // so the API records resident_id = NULL.
        isGuest ? { skipAuth: true } : undefined
      );
      setSubmitted(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) return <Confirmation trackingId={submitted.tracking_id} isGuest={isGuest} />;

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const requiresPhoto = categoryRequiresPhoto(categories, categoryId);
  const categoryLabel =
    categoryId === 'other' ? `Other — ${otherText}` : selectedCategory?.name || '—';
  const categoryIconVal = categoryId === 'other' ? '📦' : categoryIcon(selectedCategory?.name);

  const canContinue =
    stepKey === 'category'
      ? Boolean(categoryId) &&
        (categoryId !== 'other' || otherText.trim().length > 0) &&
        (isDesktop ? Boolean(position) : true)
      : stepKey === 'location'
        ? Boolean(position)
        : true;

  // Shared map panel: right column on desktop, its own step on phones.
  const locationPanel = (
    <div>
      <h2 className="text-xl font-bold text-slate-900">Where is it?</h2>
      <p className="mt-1 text-sm text-slate-500">Search for an address or tap the map to drop a pin.</p>

      <div className="relative mt-4">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          className="input pl-9 pr-16"
          placeholder="Search address or landmark"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
        />
        <button
          type="button"
          onClick={searchLocation}
          disabled={searching}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
        >
          {searching ? '…' : 'Search'}
        </button>
      </div>

      <div className="mt-3">
        <MapPicker
          position={position}
          onPositionChange={setPosition}
          onLocationText={setLocationText}
          heightClass="h-[250px] md:h-[400px]"
        />
      </div>

      {locationText && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📍
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900">
                {position ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}` : ''}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">{locationText}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={
        isGuest
          ? // Inside GuestLayout's card: fill it, keep gutters for touch targets.
            'w-full min-w-0 p-4 md:p-6'
          : 'mx-auto max-w-lg overflow-y-auto pb-24 lg:mx-0 lg:max-w-none md:pb-0'
      }
    >
      <WizardHeader
        step={stepIndex + 1}
        total={steps.length}
        label={steps[stepIndex]?.label}
        onBack={back}
        onClose={() => navigate(isGuest ? '/' : '/resident')}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STEP — Category (the map shows beside it only on desktop) */}
      {stepKey === 'category' && (
        <div className={isDesktop ? 'flex flex-col gap-6 md:flex-row md:items-start' : 'flex flex-col gap-6'}>
          {/* Category */}
          <div className={isDesktop ? 'w-full min-w-0 md:w-1/2' : 'w-full min-w-0'}>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">What type of issue?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the category that best describes the problem you&apos;re reporting.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`flex min-h-[84px] w-full flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-3 text-center transition active:scale-[0.98] md:p-5 ${
                    categoryId === c.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl md:h-12 md:w-12 md:text-2xl">
                    {categoryIcon(c.name)}
                  </span>
                  <span className="w-full break-words text-xs font-medium leading-tight text-slate-800 md:text-sm">
                    {c.name}
                  </span>
                </button>
              ))}

              {/* "Other" is not hardcoded: it is seeded in the database and
                  arrives with the rest of the categories from /api/categories. */}
            </div>

            {categoryId === 'other' && (
              <div className="mt-4">
                <label className="label" htmlFor="other-text">
                  Please specify the issue
                </label>
                <input
                  id="other-text"
                  className="input"
                  placeholder="e.g. Fallen tree blocking the road"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  autoFocus
                />
              </div>
            )}
          </div>

          {isDesktop && <div className="w-full min-w-0 md:w-1/2">{locationPanel}</div>}
        </div>
      )}

      {/* STEP — Location (phones only) */}
      {stepKey === 'location' && locationPanel}

      {/* STEP — Details */}
      {stepKey === 'details' && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Provide details</h2>

          <div>
            <div className="label flex items-center gap-1.5">
              Photo Evidence
              {requiresPhoto ? (
                <span className="text-xs font-semibold text-red-600">*required*</span>
              ) : (
                <span className="text-xs font-normal text-slate-400">(Optional)</span>
              )}
            </div>
            <p className="mb-2 text-xs text-slate-500">Clear photos help expedite the resolution process.</p>
            <PhotoUpload
              onChange={(url) => setPhotoUrl(url || '')}
              onName={(n) => setPhotoName(n || '')}
              onMetadata={setPhotoMetadata}
              showCamera={!isDesktop}
              skipAuth={isGuest}
            />
          </div>

          <div>
            <label className="label" htmlFor="wiz-desc">
              Description
            </label>
            <textarea
              id="wiz-desc"
              rows={4}
              className="input"
              placeholder="Describe the issue in detail…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {profile && !isGuest && (
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Submit Anonymously</div>
                <div className="text-xs text-slate-500">
                  Your name will not be visible to the Barangay Officer.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={anonymous}
                onClick={() => setAnonymous((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition ${anonymous ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  anonymous ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          )}
        </div>
      )}

      {/* STEP 3 — Review */}
      {stepKey === 'review' && (
        <div>
          <h2 className="text-xl font-bold text-slate-900">Review your report</h2>
          <p className="mt-1 text-sm text-slate-500">Check the details before submitting.</p>

          <dl className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <ReviewRow label="Category" value={categoryLabel} icon={categoryIconVal} />
            <ReviewRow label="Location" value={locationText || `${position?.lat}, ${position?.lng}`} icon="📍" />
            <ReviewRow label="Photo" value={photoUrl ? '1 photo attached' : 'No photo attached'} icon="📷" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</dt>
              <dd className="mt-1 whitespace-pre-line text-sm text-slate-800">{description || '—'}</dd>
            </div>
            {profile && !isGuest && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <dt className="text-sm text-slate-700">Submit anonymously</dt>
                <dd className={`text-sm font-medium ${anonymous ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {anonymous ? 'Yes' : 'No'}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Action buttons — pinned to the bottom on mobile, inline from md: up */}
      <div
        className={
          hasBottomNav
            ? 'fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 md:static md:bottom-auto md:mt-6 md:border-0 md:bg-transparent md:p-0'
            : 'fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:bottom-auto md:mt-6 md:border-0 md:bg-transparent md:p-0'
        }
      >
        {stepKey !== 'review' ? (
          <button onClick={next} disabled={!canContinue} className="btn-primary w-full md:w-auto">
            {stepKey === 'details' ? 'Continue to Review' : 'Continue'}
            <span className="ml-1">→</span>
          </button>
        ) : (
          <button onClick={submit} disabled={busy} className="btn-primary w-full md:w-auto">
            {busy ? 'Submitting…' : 'Submit Report'}
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 truncate text-sm text-slate-800">{value}</dd>
      </div>
    </div>
  );
}
