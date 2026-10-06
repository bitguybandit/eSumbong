import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import MapView from '../../components/MapView';
import { ENTRY_TYPE_META, formatDateTime } from '../../lib/constants';

function Timeline({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-slate-400">No status updates yet.</p>;
  }
  return (
    <ol className="space-y-0">
      {entries.map((e, i) => {
        const isLast = i === entries.length - 1;
        const meta = ENTRY_TYPE_META[e.entry_type] || { label: e.entry_type, icon: '•' };
        return (
          <li key={i} className="relative flex gap-3 pb-5">
            {!isLast && <span className="absolute left-[11px] top-7 h-full w-px bg-slate-200" />}
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                isLast ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isLast ? meta.icon : '✓'}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
              <div className="whitespace-pre-line text-sm text-slate-600">{e.description}</div>
              <div className="mt-0.5 text-xs text-slate-400">{formatDateTime(e.created_at)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackComplaint() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function check(trackingId) {
    const id = (trackingId ?? query).trim();
    if (!id) {
      setError('Enter a tracking ID to check status.');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await api.get(`/complaints/track/${encodeURIComponent(id)}`);
      setResult(res.data);
    } catch (err) {
      setError(err.status === 404 ? 'No complaint found with that tracking ID.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const id = params.get('id');
    if (id) {
      setQuery(id);
      check(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="mx-auto max-w-lg space-y-6 lg:mx-0 lg:max-w-none">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Track Complaint</h1>
        <p className="text-sm text-slate-500">Enter your tracking ID to check status.</p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <label className="label" htmlFor="tracking-id">
          Tracking ID
        </label>
        <div className="flex gap-2">
          <input
            id="tracking-id"
            className="input flex-1 font-mono"
            placeholder="ES-2026-0001"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
          <button className="btn-primary shrink-0" disabled={busy} onClick={() => check()}>
            {busy ? '…' : 'Check Status'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {busy && <Spinner label="Checking status…" />}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">{result.description}</h2>
              <StatusBadge status={result.status} />
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Report ID</dt>
                <dd className="font-mono font-medium text-slate-900">{result.tracking_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="text-slate-800">{formatDateTime(result.created_at)}</dd>
              </div>
              {result.category && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Category</dt>
                  <dd className="text-slate-800">{result.category.name}</dd>
                </div>
              )}
            </dl>
          </div>

          {result.latitude != null && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
              <MapView latitude={Number(result.latitude)} longitude={Number(result.longitude)} heightClass="h-48" />
              {result.location_text && (
                <p className="px-4 py-2 text-xs text-slate-500">📍 {result.location_text}</p>
              )}
            </div>
          )}

          {result.status === 'resolved' || result.status === 'closed' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-800">Resolution</div>
              <p className="mt-1 text-sm text-emerald-700">{result.resolution_remarks || 'This complaint has been resolved.'}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-base font-semibold text-slate-900">Tracking Timeline</h3>
            <Timeline entries={result.action_log_entries} />
          </div>

          <Link to="/resident" className="btn-secondary w-full">
            ⌂ Go to Home
          </Link>
        </div>
      )}
    </div>
  );
}
