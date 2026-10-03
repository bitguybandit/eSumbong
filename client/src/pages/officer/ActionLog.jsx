import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import OfficerStatusPill from '../../components/OfficerStatusPill';
import EmptyState from '../../components/EmptyState';
import { STATUS_META, formatDateTime } from '../../lib/constants';

export default function ActionLog() {
  const [complaints, setComplaints] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    api
      .get('/officer/action-log', { params })
      .then((res) => setComplaints(res.data))
      .catch(() => setComplaints([]));
  }, [status, category]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const statusOptions = Object.entries(STATUS_META).filter(
    ([key]) => key !== 'submitted'
  );

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-[-0.5px] text-ink">Action Log</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          Track and manage actions taken on accepted complaints.
        </p>
      </div>

      <div className="officer-command-bar items-end">
        <span className="officer-bar-label">Filters</span>

        <div className="min-w-[180px]">
          <label className="officer-label">Status</label>
          <select
            className="officer-select !w-auto"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statusOptions.map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="officer-label">Category</label>
          <select
            className="officer-select !w-auto"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <span className="officer-divider" />
        <button
          className="officer-btn-ghost !px-3 !py-1.5 !text-xs"
          onClick={() => {
            setStatus('');
            setCategory('');
          }}
        >
          Clear
        </button>
      </div>

      {!complaints ? (
        <Spinner label="Loading action log…" />
      ) : complaints.length === 0 ? (
        <EmptyState title="No complaints here" message="Accepted complaints will appear in this list." />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-medium text-ink-400">Showing {complaints.length}</p>
          {complaints.map((c) => (
            <div
              key={c.id}
              className="officer-queue-item justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="officer-tracking-chip">{c.tracking_id}</span>
                  <OfficerStatusPill status={c.status} />
                </div>
                <p className="mt-1.5 truncate text-sm font-medium text-ink">{c.description}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  Last updated {formatDateTime(c.updated_at)}
                </p>
              </div>
              <Link to={`/officer/complaints/${c.id}`} className="officer-btn-secondary shrink-0">
                Open
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
