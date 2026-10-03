import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import OfficerStatusPill from '../../components/OfficerStatusPill';
import { officerToast } from '../../components/OfficerToasts';
import { REJECTION_REASONS, categoryIcon, formatDateTime } from '../../lib/constants';

export default function ComplaintQueue() {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState(null);
  const [categories, setCategories] = useState([]);
  // Seeded from the topbar search box (?q=…).
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [reviewing, setReviewing] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function load() {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    api.get('/officer/complaints', { params }).then((res) => setComplaints(res.data)).catch(() => setComplaints([]));
  }

  useEffect(load, [search, category]);
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const list = useMemo(() => {
    return [...(complaints ?? [])].sort((a, b) =>
      sort === 'oldest'
        ? new Date(a.created_at) - new Date(b.created_at)
        : new Date(b.created_at) - new Date(a.created_at)
    );
  }, [complaints, sort]);

  function closeAll() {
    setReviewing(null);
    setAccepting(null);
    setRejecting(null);
    setError('');
  }

  async function doAccept(c) {
    setBusy(true);
    setError('');
    try {
      await api.post(`/officer/complaints/${c.id}/accept`);
      setAccepting(null);
      officerToast(`${c.tracking_id} accepted and moved to the Action Log.`, 'success');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function doReject(c) {
    if (!reason) return;
    setBusy(true);
    setError('');
    try {
      await api.post(`/officer/complaints/${c.id}/reject`, { reason, notes: notes || null });
      setRejecting(null);
      setReason('');
      setNotes('');
      officerToast(`${c.tracking_id} rejected and moved to the Action Log.`, 'success');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.5px] text-ink">Complaint Queue</h1>
        <p className="mt-1 text-[13px] text-ink-500">Complaints awaiting initial review</p>
      </div>

      {/* Command bar */}
      <div className="officer-command-bar">
        <span className="officer-bar-label">Filters</span>

        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            className="officer-input !pl-9"
            placeholder="Search tracking ID, description, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search complaints"
          />
        </div>

        <select
          className="officer-select !w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="officer-select !w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort complaints"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <span className="officer-divider" />

        <button
          className="officer-btn-ghost !px-3 !py-1.5 !text-xs"
          onClick={() => {
            setSearch('');
            setCategory('');
            setSort('newest');
          }}
        >
          Clear
        </button>

        <span className="officer-count">Showing {list.length}</span>
      </div>

      {error && !reviewing && !accepting && !rejecting && (
        <div className="officer-alert officer-alert-danger">
          <IconAlert />
          <span>{error}</span>
        </div>
      )}

      {!complaints ? (
        <Spinner label="Loading queue…" />
      ) : list.length === 0 ? (
        <div className="officer-empty">
          <IconInbox className="mx-auto mb-3 h-12 w-12 text-hairline-strong" />
          <p className="text-sm font-medium text-ink-500">Queue is clear</p>
          <span className="mt-1 block text-xs text-ink-400">
            There are no complaints awaiting initial review.
          </span>
        </div>
      ) : (
        <ul className="officer-queue-list">
          {list.map((c) => (
            <li
              key={c.id}
              onClick={() => setReviewing(c)}
              className="officer-queue-item cursor-pointer flex-wrap sm:flex-nowrap"
            >
              <div className="officer-queue-icon">{categoryIcon(c.category?.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{c.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-400">
                  <span className="officer-tracking">{c.tracking_id}</span>
                  <span>·</span>
                  <span>{c.category?.name ?? 'Uncategorized'}</span>
                  <span>·</span>
                  <span>{formatDateTime(c.created_at)}</span>
                  {c.location_text && (
                    <>
                      <span>·</span>
                      <span className="truncate">{c.location_text}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex w-full shrink-0 items-center justify-end gap-2.5 sm:w-auto">
                <OfficerStatusPill status={c.status} />
                <button
                  className="officer-btn-primary !px-3 !py-1.5 !text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReviewing(c);
                  }}
                >
                  Review
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Review modal */}
      <Modal
        open={Boolean(reviewing)}
        onClose={closeAll}
        title="Review Complaint"
        subtitle={<span className="officer-tracking-chip">{reviewing?.tracking_id}</span>}
        width="max-w-xl"
      >
        <div className="officer-alert officer-alert-info">
          <IconInfo />
          <span>
            Is this complaint valid enough for the barangay to act on? Review the details and decide.
          </span>
        </div>

        <div className="officer-info-row">
          <span className="officer-info-label">Complaint</span>
          <span className="officer-info-value-left">{reviewing?.description}</span>
        </div>
        <div className="officer-info-row">
          <span className="officer-info-label">Category</span>
          <span className="officer-info-value">{reviewing?.category?.name ?? 'Uncategorized'}</span>
        </div>
        <div className="officer-info-row">
          <span className="officer-info-label">Submitted</span>
          <span className="officer-info-value">{formatDateTime(reviewing?.created_at)}</span>
        </div>
        <div className="officer-info-row">
          <span className="officer-info-label">Submitted By</span>
          <span className="officer-info-value">
            {reviewing?.resident?.full_name ?? (
              <em className="not-italic text-ink-400">Anonymous</em>
            )}
          </span>
        </div>
        <div className="officer-info-row">
          <span className="officer-info-label">Location</span>
          <span className="officer-info-value-left">{reviewing?.location_text ?? '—'}</span>
        </div>
        <div className="officer-info-row">
          <span className="officer-info-label">Description</span>
          <span className="officer-info-value-left">{reviewing?.description}</span>
        </div>

        <div className="mt-4">
          <span className="officer-label">Photos</span>
          {reviewing?.photo_path ? (
            <img className="officer-photo-thumb" src={reviewing.photo_path} alt="Complaint attachment" />
          ) : (
            <p className="text-xs text-ink-400">No photos attached</p>
          )}
        </div>

        <div className="officer-modal-footer">
          <button
            className="officer-btn-danger-outline"
            onClick={() => {
              const c = reviewing;
              setReviewing(null);
              setError('');
              setRejecting(c);
            }}
          >
            ✗ Reject
          </button>
          <button
            className="officer-btn-success"
            onClick={() => {
              const c = reviewing;
              setReviewing(null);
              setError('');
              setAccepting(c);
            }}
          >
            ✓ Accept
          </button>
        </div>
      </Modal>

      {/* Accept modal */}
      <Modal
        open={Boolean(accepting)}
        onClose={closeAll}
        title="Accept Complaint?"
        subtitle={<span className="officer-tracking-chip">{accepting?.tracking_id}</span>}
        width="max-w-md"
      >
        <div className="officer-alert officer-alert-success !mb-0">
          <IconCheck />
          <span>
            This complaint will be <strong>accepted</strong> for barangay action and moved to the
            Action Log where you&apos;ll categorize, refer, and process it.
          </span>
        </div>

        {error && (
          <div className="officer-alert officer-alert-danger mt-4 !mb-0">
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        <div className="officer-modal-footer">
          <button className="officer-btn-ghost" onClick={closeAll}>
            Cancel
          </button>
          <button className="officer-btn-success" disabled={busy} onClick={() => doAccept(accepting)}>
            {busy ? 'Accepting…' : 'Accept Complaint'}
          </button>
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        open={Boolean(rejecting)}
        onClose={closeAll}
        title="Reject Complaint"
        subtitle={<span className="officer-tracking-chip">{rejecting?.tracking_id}</span>}
        width="max-w-md"
      >
        <div className="officer-alert officer-alert-danger">
          <IconAlert />
          <span>
            This complaint will be marked as <strong>Rejected</strong> and moved to the Action Log.
            Please provide a clear reason.
          </span>
        </div>

        <div>
          <label className="officer-label">
            Reason for rejection <span className="text-red-600">*</span>
          </label>
          <select className="officer-select" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            {REJECTION_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="officer-label">Additional notes</label>
          <textarea
            className="officer-textarea"
            placeholder="Optional details for the record…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <div className="officer-alert officer-alert-danger mt-4">
            <IconAlert />
            <span>{error}</span>
          </div>
        )}

        <div className="officer-modal-footer">
          <button className="officer-btn-ghost" onClick={closeAll}>
            Cancel
          </button>
          <button
            className="officer-btn-danger"
            disabled={busy || !reason}
            onClick={() => doReject(rejecting)}
          >
            {busy ? 'Rejecting…' : 'Reject Complaint'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ---------- Icons ---------- */
function IconSearch({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function IconAlert({ className = 'mt-0.5 h-[18px] w-[18px] shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function IconInfo({ className = 'mt-0.5 h-[18px] w-[18px] shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function IconCheck({ className = 'mt-0.5 h-[18px] w-[18px] shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconInbox({ className = 'h-12 w-12' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
