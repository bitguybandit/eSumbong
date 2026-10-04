import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

function Confirmation({ trackingId }) {
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
        <Link to={`/resident/track?id=${trackingId}`} className="btn-primary w-full">
          ⊕ Track Report
        </Link>
        <Link to="/resident" className="btn-secondary w-full">
          ⌂ Go to Home
        </Link>
      </div>
    </div>
  );
}

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { profile } = useAuth();
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
        anonymous,
      };
      const res = await api.post('/complaints', payload);
      setSubmitted(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) return <Confirmation trackingId={submitted.tracking_id} />;

  const selectedCategory = categories.find((c) => c.id === categoryId);
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
          heightClass="h-64 lg:h-[420px]"
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
    <div className="mx-auto max-w-lg lg:mx-0 lg:max-w-none">
      <WizardHeader
        step={stepIndex + 1}
        total={steps.length}
        label={steps[stepIndex]?.label}
        onBack={back}
        onClose={() => navigate('/resident')}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STEP — Category (the map shows beside it only on desktop) */}
      {stepKey === 'category' && (
        <div className={isDesktop ? 'grid gap-8 lg:grid-cols-2 lg:items-start' : ''}>
          {/* Category */}
          <div>
            <h2 className="text-xl font-bold text-slate-900">What type of issue?</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the category that best describes the problem you&apos;re reporting.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border bg-white p-5 text-center transition active:scale-[0.98] ${
                    categoryId === c.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                    {categoryIcon(c.name)}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{c.name}</span>
                </button>
              ))}

              {/* Other */}
              <button
                type="button"
                onClick={() => setCategoryId('other')}
                className={`flex flex-col items-center gap-2 rounded-2xl border bg-white p-5 text-center transition active:scale-[0.98] ${
                  categoryId === 'other'
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  📦
                </span>
                <span className="text-sm font-medium text-slate-800">Other</span>
              </button>
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

          {isDesktop && locationPanel}
        </div>
      )}

      {/* STEP — Location (phones only) */}
      {stepKey === 'location' && locationPanel}

      {/* STEP — Details */}
      {stepKey === 'details' && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Provide details</h2>

          <div>
            <div className="label">Photo Evidence</div>
            <p className="mb-2 text-xs text-slate-500">Clear photos help expedite the resolution process.</p>
            <PhotoUpload
              onChange={(url) => setPhotoUrl(url || '')}
              onName={(n) => setPhotoName(n || '')}
              showCamera={!isDesktop}
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

          {profile && (
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
            {profile && (
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

      {/* Action buttons */}
      <div className="mt-6">
        {stepKey !== 'review' ? (
          <button onClick={next} disabled={!canContinue} className="btn-primary w-full">
            {stepKey === 'details' ? 'Continue to Review' : 'Continue'}
            <span className="ml-1">→</span>
          </button>
        ) : (
          <button onClick={submit} disabled={busy} className="btn-primary w-full">
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
