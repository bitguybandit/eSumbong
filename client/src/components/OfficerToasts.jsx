import { useEffect, useState } from 'react';

/* --------------------------------------------------------------------------
   Minimal officer-portal toast store.

   Deliberately a module singleton so no provider needs to be wired into the
   app root — render <OfficerToaster /> once (OfficerLayout does) and call
   officerToast('message', 'success' | 'error' | 'info') from anywhere.
   -------------------------------------------------------------------------- */

let items = [];
const listeners = new Set();
let seq = 0;

const TOAST_CLS = {
  success: 'officer-toast--success',
  error: 'officer-toast--error',
  info: 'officer-toast--info',
};

function publish() {
  listeners.forEach((listener) => listener(items));
}

export function officerToast(message, type = 'success') {
  const id = (seq += 1);
  items = [...items, { id, message, type }];
  publish();
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    publish();
  }, 2800);
}

function ToastIcon({ type }) {
  const common = {
    className: 'h-[18px] w-[18px] shrink-0',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  if (type === 'error') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  if (type === 'info') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function OfficerToaster() {
  const [list, setList] = useState(items);

  useEffect(() => {
    listeners.add(setList);
    setList(items);
    return () => listeners.delete(setList);
  }, []);

  if (list.length === 0) return null;

  return (
    <div className="officer-toast-container">
      {list.map((t) => (
        <div key={t.id} className={`officer-toast ${TOAST_CLS[t.type] ?? TOAST_CLS.info}`}>
          <ToastIcon type={t.type} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
