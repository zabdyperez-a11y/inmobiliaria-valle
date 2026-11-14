export function Logo({ white = false, className = 'h-9 w-auto sm:h-10' }: { white?: boolean; className?: string }) {
  return (
    <img
      src={white ? '/brand/logo-horizontal-white.svg' : '/brand/logo-horizontal.svg'}
      alt="Inmobiliaria Valle"
      width={164}
      height={28}
      className={className}
    />
  );
}
