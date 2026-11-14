/* Íconos de trazo, 24x24. Solo los que se usan. */
type P = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const IconWhatsApp = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.93 9.93 0 1 0 12.04 2Zm0 18.15a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.23 8.23 0 1 1 6.97 3.85Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06a6.73 6.73 0 0 1-3.36-2.94c-.25-.44.25-.4.72-1.34.08-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.77 2.77 0 0 0-.86 2.06 4.8 4.8 0 0 0 1 2.55 11 11 0 0 0 4.22 3.73c1.57.68 2.19.74 2.97.62.48-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.16-.47-.29Z" />
  </svg>
);
export const IconBed = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /></svg>
);
export const IconBath = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM6 12V6a2 2 0 0 1 3.7-1M7 19l-1 2M17 19l1 2" /></svg>
);
export const IconCar = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M5 16V11l2-5h10l2 5v5M3 16h18v2H3zM5 11h14" /><circle cx="8" cy="14" r=".6" /><circle cx="16" cy="14" r=".6" /></svg>
);
export const IconStairs = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M3 20h5v-5h5v-5h5V5h3" /></svg>
);
export const IconLand = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 4h16v16H4zM4 9h3M4 14h3M9 4v3M14 4v3" /></svg>
);
export const IconBuilt = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6" /></svg>
);
export const IconPin = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const IconCheck = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconClose = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconMenu = ({ className = 'h-6 w-6' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconChevron = ({ className = 'h-5 w-5', dir = 'right' }: P & { dir?: 'left' | 'right' | 'down' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} style={{ transform: dir === 'left' ? 'rotate(180deg)' : dir === 'down' ? 'rotate(90deg)' : undefined }}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconSliders = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
);
export const IconExpand = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
export const IconCamera = ({ className = 'h-5 w-5' }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
