// Adapted from chanhdai.com, MIT, copyright (c) 2026 Chánh Đại.
// License: public/licenses/chanhdai-handwritten-arrow.txt
export default function HandwrittenArrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M34 4c1 15-5 26-21 30" />
      <path d="m22 37-9-3 7.5-8" />
    </svg>
  );
}
