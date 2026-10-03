// Renders the official eSumbong logo asset from /public (logo_f.svg).
// Pass `inverted` on dark backgrounds — the mark is made white via a CSS filter.

const SIZES = {
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-9',
};

export default function Logo({ inverted = false, size = 'md', className = '' }) {
  return (
    <img
      src="/logo_f.svg"
      alt="eSumbong — Citizen Action"
      className={`${SIZES[size] || SIZES.md} w-auto ${inverted ? 'brightness-0 invert' : ''} ${className}`}
    />
  );
}
