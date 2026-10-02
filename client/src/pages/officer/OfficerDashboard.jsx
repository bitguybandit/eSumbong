import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';
import OfficerStatusPill from '../../components/OfficerStatusPill';
import { categoryIcon, formatDateTime } from '../../lib/constants';

/* ---------- Icons ---------- */
function IconClock({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconPen({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function IconCheck({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconArchive({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="4.5" rx="1.5" />
      <path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5" />
      <path d="M10 12.5h4" />
    </svg>
  );
}
function IconAlert({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.6 4.6 3.3 17.2A1.6 1.6 0 0 0 4.7 19.6h14.6a1.6 1.6 0 0 0 1.4-2.4L13.4 4.6a1.6 1.6 0 0 0-2.8 0Z" />
      <path d="M12 9.5v4M12 16.5v.01" />
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

/* ---------- Age helpers (drive the SLA copy) ---------- */
const HOUR_MS = 36e5;
const ageHours = (iso) => (Date.now() - new Date(iso).getTime()) / HOUR_MS;
const SLA_THRESHOLD_H = 72;

function ageLabel(hours) {
  if (!Number.isFinite(hours) || hours < 0) return '—';
  if (hours < 24) return `${Math.max(1, Math.round(hours))}h`;
  return `${Math.floor(hours / 24)}d`;
}

/* ---------- Queue row ---------- */
function QueueRow({ complaint: c }) {
  return (
    <li className="officer-queue-item flex-wrap sm:flex-nowrap">
      <div className="officer-queue-icon">{categoryIcon(c.category?.name)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{c.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-ink-400">
          <span className="officer-tracking-chip">{c.tracking_id}</span>
          <span>·</span>
          <span>{c.category?.name ?? 'Uncategorized'}</span>
          <span>·</span>
          <span>{formatDateTime(c.created_at)}</span>
        </div>
      </div>
      <div className="flex w-full shrink-0 items-center justify-end gap-2.5 sm:w-auto">
        <OfficerStatusPill status={c.status} />
        <Link to="/officer/queue" className="officer-btn-primary !px-3 !py-1.5 !text-xs">
          Review
        </Link>
      </div>
    </li>
  );
}

/* --------------------------------------------------------------------------
   Complaints & case-resolution trend.

   Built entirely from the real `trend` array returned by /officer/dashboard
   (one entry per day: { date, logged, actioned }). The three range tabs just
   re-bucket those same days — no hand-authored numbers anywhere.
   -------------------------------------------------------------------------- */
const RANGE_DEFS = [
  { key: 'daily', tab: 'Daily', bucket: 'day', count: 14, unitLabel: '14 DAYS' },
  { key: 'weekly', tab: 'Weekly', bucket: 'week', count: 8, unitLabel: '8 WEEKS' },
  { key: 'monthly', tab: 'Monthly', bucket: 'month', count: 6, unitLabel: '6 MONTHS' },
];
const CHART_ORDER = RANGE_DEFS.map((d) => d.key);
const RANGE_BY_KEY = Object.fromEntries(RANGE_DEFS.map((d) => [d.key, d]));

const SERIES = [
  { key: 'volume', name: 'Complaints Logged', color: '#f43f5e' },
  { key: 'actioned', name: 'Cases Actioned', color: '#14b8a6' },
];

const CHART = { w: 720, h: 230, padL: 44, padR: 14, padT: 14, padB: 30 };

/* ---- Date helpers (local time, matching the server's day keys) ---- */
const parseDay = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const fmtDayLabel = (key) =>
  parseDay(key).toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
const fmtMonthLabel = (key) => parseDay(key).toLocaleDateString(undefined, { month: 'short' });
const fmtFullDate = (key, withYear = false) =>
  parseDay(key).toLocaleDateString(
    undefined,
    withYear
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric' }
  );

/* ---- Axis: derived from the largest value actually plotted ---- */
function niceStep(v) {
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const mult = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return mult * pow;
}

function niceAxis(maxValue) {
  const step = Math.max(1, niceStep((Math.max(1, maxValue) * 1.1) / 5));
  const max = step * 5;
  return { max, ticks: [0, step, step * 2, step * 3, step * 4, max] };
}

/* ---- Bucketing ---- */
const sumRows = (rows) =>
  rows.reduce(
    (acc, r) => ({ logged: acc.logged + r.logged, actioned: acc.actioned + r.actioned }),
    { logged: 0, actioned: 0 }
  );

function buildRange(trend, key) {
  const def = RANGE_BY_KEY[key];
  const daily = (trend ?? [])
    .filter((d) => d && d.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!daily.length) return null;

  if (def.bucket === 'day') {
    const slice = daily.slice(-def.count);
    return {
      labels: slice.map((d) => fmtDayLabel(d.date)),
      volume: slice.map((d) => d.logged),
      actioned: slice.map((d) => d.actioned),
      rangeLabel: `${fmtFullDate(slice[0].date)} – ${fmtFullDate(slice[slice.length - 1].date, true)}`,
      unitLabel: `${slice.length} DAYS`,
    };
  }

  if (def.bucket === 'week') {
    const slice = daily.slice(-def.count * 7);
    const buckets = [];
    for (let i = 0; i < slice.length; i += 7) {
      const rows = slice.slice(i, i + 7);
      buckets.push({ start: rows[0].date, ...sumRows(rows) });
    }
    return {
      labels: buckets.map((b) => fmtDayLabel(b.start)),
      volume: buckets.map((b) => b.logged),
      actioned: buckets.map((b) => b.actioned),
      rangeLabel: `${fmtFullDate(slice[0].date)} – ${fmtFullDate(slice[slice.length - 1].date, true)}`,
      unitLabel: `${buckets.length} WEEKS`,
    };
  }

  const byMonth = new Map();
  for (const d of daily) {
    const k = d.date.slice(0, 7);
    const cur = byMonth.get(k) ?? { logged: 0, actioned: 0, first: d.date };
    cur.logged += d.logged;
    cur.actioned += d.actioned;
    byMonth.set(k, cur);
  }
  const months = [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-def.count)
    .map(([, v]) => v);
  const first = months[0].first;
  const last = months[months.length - 1].first;
  return {
    labels: months.map((m) => fmtMonthLabel(m.first)),
    volume: months.map((m) => m.logged),
    actioned: months.map((m) => m.actioned),
    rangeLabel: `${fmtMonthLabel(first)} ${first.slice(0, 4)} – ${fmtMonthLabel(last)} ${last.slice(0, 4)}`,
    unitLabel: `${months.length} MONTHS`,
  };
}

function TrendChart({ cfg }) {
  const plotW = CHART.w - CHART.padL - CHART.padR;
  const plotH = CHART.h - CHART.padT - CHART.padB;
  const xAt = (i) => CHART.padL + (plotW * i) / (cfg.labels.length - 1);
  const yAt = (v) => CHART.padT + plotH - (plotH * v) / cfg.max;
  const line = (values) => values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(v)}`).join(' ');
  const area = (values) =>
    `${line(values)} L${xAt(values.length - 1)},${yAt(0)} L${xAt(0)},${yAt(0)} Z`;

  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${CHART.w} ${CHART.h}`}
        className="h-[230px] w-full min-w-[620px]"
        role="img"
        aria-label="Complaints and case resolution trend"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {cfg.ticks.map((t) => (
          <g key={t}>
            <line
              x1={CHART.padL}
              x2={CHART.w - CHART.padR}
              y1={yAt(t)}
              y2={yAt(t)}
              className="stroke-hairline"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={CHART.padL - 10}
              y={yAt(t) + 4}
              textAnchor="end"
              fontSize="10"
              className="fill-ink-400"
            >
              {t}
            </text>
          </g>
        ))}

        {cfg.labels.map((label, i) => (
          <text
            key={label}
            x={xAt(i)}
            y={CHART.h - 8}
            textAnchor="middle"
            fontSize="10"
            className="fill-ink-400"
          >
            {label}
          </text>
        ))}

        <path d={area(cfg.volume)} fill="url(#areaGrad)" />

        {SERIES.map((s) => (
          <path
            key={s.key}
            d={line(cfg[s.key])}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {SERIES.map((s) => (
          <circle
            key={`${s.key}-last`}
            cx={xAt(cfg[s.key].length - 1)}
            cy={yAt(cfg[s.key][cfg[s.key].length - 1])}
            r="4.5"
            className="fill-surface"
            stroke={s.color}
            strokeWidth="2.5"
          />
        ))}
      </svg>
    </div>
  );
}

/* ---------- Complaints in category (horizontal progress bars) ---------- */
const BAR_COLORS = [
  'bg-blue-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
];

function CategoryBreakdown({ complaints }) {
  const counts = new Map();
  complaints.forEach((c) => {
    const name = c.category?.name ?? 'Uncategorized';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });

  const total = complaints.length;
  const rows = [...counts.entries()]
    .map(([name, count]) => ({ name, count, pct: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 5);

  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-400">No complaints yet.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row, i) => (
        <div key={row.name}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate font-medium text-ink">{row.name}</span>
            <span className="shrink-0 font-bold text-ink-500">
              {row.count} · {row.pct}%
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full border border-hairline bg-surface-soft">
            <div
              className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- SLA alert ---------- */
function SlaAlert({ complaint }) {
  if (!complaint) {
    return (
      <div className="officer-card flex items-start gap-3 p-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          <IconCheck className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-emerald-700 dark:text-emerald-400">
            SLA Clear
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Every open case is still inside the {SLA_THRESHOLD_H}-hour ordinance resolution mandate.
          </p>
        </div>
      </div>
    );
  }

  const hours = ageHours(complaint.created_at);
  const overdue = hours >= SLA_THRESHOLD_H;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-soft dark:border-amber-500/30 dark:bg-[#1a1724]">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
          <IconAlert className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-amber-700 dark:text-amber-400">
            {overdue ? 'SLA Breach' : 'SLA Alert'}
          </p>
          <p className="mt-1 truncate text-[13px] font-semibold text-ink">
            {complaint.category?.name ?? 'Uncategorized'} · {complaint.tracking_id}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            Filed {formatDateTime(complaint.created_at)} ({ageLabel(hours)} ago) and{' '}
            {overdue
              ? `is past the ${SLA_THRESHOLD_H}-hour ordinance resolution mandate.`
              : `is approaching the ${SLA_THRESHOLD_H}-hour ordinance resolution mandate.`}{' '}
            Tanod follow-up recommended.
          </p>
          <Link
            to={`/officer/complaints/${complaint.id}`}
            className="mt-2 inline-block text-xs font-semibold text-crimson-600 hover:underline dark:text-rose-400 dark:hover:text-rose-300"
          >
            Open case →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- Recent complaints ---------- */
const RECENT_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'progress', label: 'In Progress' },
];

const STATUS_BY_TAB = {
  pending: 'submitted',
  progress: 'referred',
};

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-hairline bg-surface-soft p-1">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
            value === opt.key
              ? 'bg-surface text-ink shadow-soft'
              : 'text-ink-400 hover:text-ink'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function OfficerDashboard() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('daily');
  const [recentTab, setRecentTab] = useState('all');

  useEffect(() => {
    api.get('/officer/dashboard').then((res) => setData(res.data)).catch(() => setData(null));
  }, []);

  if (!data) return <Spinner label="Loading dashboard…" />;

  const { stats, recent, pending } = data;

  /* --- Trend, built from real rows returned by the API --- */
  const trendRange = buildRange(data.trend, range);
  const chartCfg = trendRange
    ? {
        ...trendRange,
        ...niceAxis(Math.max(...trendRange.volume, ...trendRange.actioned)),
      }
    : null;
  const hasTrend =
    !!chartCfg && (chartCfg.volume.some((v) => v > 0) || chartCfg.actioned.some((v) => v > 0));

  /* --- KPI cards (values are real; the two footer notes are derived/status copy) --- */
  const caseload = stats.pending_review + stats.in_progress + stats.resolved + stats.closed;
  const share = (n) => (caseload ? Math.round((n / caseload) * 100) : 0);

  const overduePending = pending.filter((c) => ageHours(c.created_at) >= 48).length;

  const cards = [
    {
      label: 'Pending Review',
      value: stats.pending_review,
      context: 'Awaiting triage',
      chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
      valColor: 'text-ink dark:text-amber-400',
      Icon: IconClock,
      meta: `${overduePending} overdue (48h+)`,
      metaTone: overduePending > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-ink-400',
      note: 'Needs Tanod lead',
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      context: 'Dispatched & active',
      chip: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400',
      valColor: 'text-ink dark:text-cyan-400',
      Icon: IconPen,
      meta: `${share(stats.in_progress)}% of caseload`,
      metaTone: 'text-ink-400',
      note: 'Active in field',
    },
    {
      label: 'Resolved',
      value: stats.resolved,
      context: 'Total handled',
      chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
      valColor: 'text-ink dark:text-emerald-400',
      Icon: IconCheck,
      meta: `${share(stats.resolved)}% of caseload`,
      metaTone: 'text-ink-400',
      note: 'Resident notified',
    },
    {
      label: 'Closed & Confirmed',
      value: stats.closed,
      context: 'Finalized & archived',
      chip: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
      valColor: 'text-ink',
      Icon: IconArchive,
      meta: `${share(stats.closed)}% of caseload`,
      metaTone: 'text-ink-400',
      note: 'Archived cases',
    },
  ];

  // Deduped union of the complaints this endpoint actually returned (recent ⊇ pending),
  // used only for the category breakdown so nothing is double-counted.
  const categorySource = [...new Map([...recent, ...pending].map((c) => [c.id, c])).values()];

  // Oldest still-open case drives the SLA panel.
  const oldestPending = [...pending].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )[0];
  const slaCase = oldestPending && ageHours(oldestPending.created_at) >= 48 ? oldestPending : null;

  const loggedTotal = chartCfg ? chartCfg.volume.reduce((sum, v) => sum + v, 0) : 0;
  const actionedTotal = chartCfg ? chartCfg.actioned.reduce((sum, v) => sum + v, 0) : 0;
  const efficiency = caseload
    ? Math.round(((stats.resolved + stats.closed) / caseload) * 100)
    : 0;

  const recentCounts = {
    all: recent.length,
    pending: recent.filter((c) => c.status === 'submitted').length,
    progress: recent.filter((c) => c.status === 'referred').length,
  };
  const visibleRecent = STATUS_BY_TAB[recentTab]
    ? recent.filter((c) => c.status === STATUS_BY_TAB[recentTab])
    : recent;

  return (
    <div className="space-y-7">
      {/* ---------- KPI cards ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="officer-stat">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.6px] text-ink-400">
                {c.label}
              </span>
              <span className={`officer-stat-icon ${c.chip}`}>
                <c.Icon />
              </span>
            </div>
            <div className={`font-display text-4xl font-extrabold leading-none tracking-[-1px] ${c.valColor}`}>
              {c.value}
            </div>
            <div className="mt-2 text-[11px] text-ink-400">{c.context}</div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-hairline pt-3">
              <span className={`text-[11px] font-semibold ${c.metaTone}`}>{c.meta}</span>
              <span className="text-hairline-strong">·</span>
              <span className="text-[11px] text-ink-400">{c.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Trend + right rail ---------- */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
        <section className="officer-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">
                Complaints &amp; Case Resolution Trend
              </h2>
              <p className="mt-0.5 text-xs text-ink-400">
                Complaints filed against cases actioned, from live records
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                options={RANGE_DEFS.map((d) => ({ key: d.key, label: d.tab }))}
                value={range}
                onChange={setRange}
              />
              {chartCfg && (
                <span className="rounded-lg border border-hairline bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-ink-500">
                  {chartCfg.rangeLabel}
                </span>
              )}
            </div>
          </div>

          {/* Period summary */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-y border-hairline py-4 sm:grid-cols-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-400">
                Total logged ({chartCfg?.unitLabel ?? '—'})
              </div>
              <div className="mt-1 font-display text-xl font-extrabold tracking-[-0.5px] text-ink">
                {loggedTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-ink-400">complaints filed</div>
            </div>
            <div className="sm:border-l sm:border-hairline sm:pl-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-400">
                Actioned in period
              </div>
              <div className="mt-1 font-display text-xl font-extrabold tracking-[-0.5px] text-teal-600 dark:text-teal-400">
                {actionedTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-ink-400">cases past triage</div>
            </div>
            <div className="sm:border-l sm:border-hairline sm:pl-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-ink-400">
                Resolution efficiency
              </div>
              <div className="mt-1 font-display text-xl font-extrabold tracking-[-0.5px] text-emerald-600 dark:text-emerald-400">
                {efficiency}%
              </div>
              <div className="text-[11px] text-ink-400">resolved or closed</div>
            </div>
          </div>

          {hasTrend ? (
            <TrendChart cfg={chartCfg} />
          ) : (
            <p className="mt-4 border-b border-hairline py-12 text-center text-sm text-ink-400">
              No complaints recorded in this period yet.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-hairline pt-4">
            {hasTrend &&
              SERIES.map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-xs font-medium text-ink-500">{s.name}</span>
                  <span className="text-xs font-bold text-ink">
                    {chartCfg[s.key][chartCfg[s.key].length - 1].toLocaleString()}
                  </span>
                </div>
              ))}
            <span className="ml-auto text-[11px] text-ink-400">Live complaint records</span>
          </div>
        </section>

        <div className="space-y-5">
          {/* Complaints in category */}
          <div className="officer-card flex flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">
                  Complaints in Category
                </h2>
                <p className="mt-0.5 text-xs text-ink-400">Distribution based on loaded cases</p>
              </div>
              <span className="shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:border-teal-500/25 dark:bg-teal-500/15 dark:text-teal-400">
                {categorySource.length} Active
              </span>
            </div>
            <div className="mt-5 flex-1">
              <CategoryBreakdown complaints={categorySource} />
            </div>
          </div>

          {/* SLA alert */}
          <SlaAlert complaint={slaCase} />
        </div>
      </div>

      {/* ---------- Recent complaints ---------- */}
      <section className="officer-card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
          <div>
            <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">
              Recent Complaints
            </h2>
            <p className="mt-0.5 text-xs text-ink-400">
              Latest complaints filed in the barangay online &amp; walk-in desk
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-hairline bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-ink-500">
              {recent.length} Recent Records
            </span>
            <Link to="/officer/action-log" className="officer-btn-outline !px-3 !py-1.5 !text-xs">
              Action Log →
            </Link>
          </div>
        </div>

        <div className="mt-4 px-6">
          <Segmented
            options={RECENT_TABS.map((tab) => ({
              key: tab.key,
              label: `${tab.label} (${recentCounts[tab.key]})`,
            }))}
            value={recentTab}
            onChange={setRecentTab}
          />
        </div>

        {recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-400">No complaints yet.</p>
        ) : visibleRecent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-ink-400">
            No complaints with this status in the recent list.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-y border-hairline bg-surface-soft text-[11px] uppercase tracking-[0.6px] text-ink-400">
                  <th className="px-6 py-3.5 font-semibold">Date &amp; Time</th>
                  <th className="px-6 py-3.5 font-semibold">Tracking No.</th>
                  <th className="px-6 py-3.5 font-semibold">Citizen Complaint Summary</th>
                  <th className="px-6 py-3.5 font-semibold">Category</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {visibleRecent.map((c) => (
                  <tr key={c.id} className="text-[13px] transition hover:bg-surface-soft">
                    <td className="whitespace-nowrap px-6 py-3.5 text-ink-400">
                      {formatDateTime(c.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <span className="officer-tracking-chip">{c.tracking_id}</span>
                    </td>
                    <td className="max-w-[320px] px-6 py-3.5">
                      <Link
                        to={`/officer/complaints/${c.id}`}
                        className="block truncate font-medium text-ink transition hover:text-crimson-600 dark:hover:text-teal-400"
                        title={c.description}
                      >
                        {c.description}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-ink-500">
                      {c.category?.name ?? 'Uncategorized'}
                    </td>
                    <td className="px-6 py-3.5">
                      <OfficerStatusPill status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Pending review queue ---------- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold tracking-[-0.2px] text-ink">
              Complaints Pending Review
            </h2>
            <p className="mt-0.5 text-xs text-ink-400">These need an initial accept/reject decision</p>
          </div>
          <Link to="/officer/queue" className="officer-btn-outline !px-3.5 !py-2 !text-[13px]">
            View Full Queue →
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="officer-empty">
            <IconInbox className="mx-auto mb-3 h-12 w-12 text-hairline-strong" />
            <p className="text-sm font-medium text-ink-500">No complaints pending review</p>
            <span className="mt-1 block text-xs text-ink-400">
              All incoming complaints have been processed.
            </span>
          </div>
        ) : (
          <ul className="officer-queue-list">
            {pending.map((c) => (
              <QueueRow key={c.id} complaint={c} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
