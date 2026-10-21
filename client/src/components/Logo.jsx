// Renders the official eSumbong logo asset from /public (logo_f.svg).
// Pass `inverted` on dark backgrounds — the mark is made white via a CSS filter.

const SIZES = {
  sm: 'h-7',
  md: 'h-8',
  lg: 'h-9',
};

// `width`/`height` mirror the SVG's intrinsic 100x28 viewBox. Without them the
// browser can paint the element at its default 100%-wide replaced size before
// CSS applies, which shows up as a solid box behind the mark while it loads.
export default function Logo({ inverted = false, size = 'md', className = '' }) {
  return (
    <img
      src="/logo_f.svg"
      alt="eSumbong — Citizen Action"
      width="100"
      height="28"
      decoding="async"
      draggable={false}
      className={`block ${SIZES[size] || SIZES.md} w-auto max-w-full shrink-0 select-none bg-transparent object-contain ${
        inverted ? 'brightness-0 invert' : ''
      } ${className}`}
    />
  );
}
