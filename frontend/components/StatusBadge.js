import { resolveCanonicalStatus } from '../lib/status';

const toneStyles = {
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  sky: 'bg-sky-50 text-sky-700 border-sky-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function StatusBadge({ status }) {
  const resolved = resolveCanonicalStatus(status);
  const toneClass = toneStyles[resolved.tone] || toneStyles.slate;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClass}`}
    >
      {resolved.label}
    </span>
  );
}
