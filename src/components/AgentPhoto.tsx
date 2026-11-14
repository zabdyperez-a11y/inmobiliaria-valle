import { SITE } from '../config/site';

export function AgentPhoto({ className = '' }: { className?: string }) {
  if (SITE.agent.photo) {
    return (
      <img
        src={SITE.agent.photo}
        alt={`${SITE.agent.fullName}, ${SITE.agent.role}`}
        width={560}
        height={700}
        loading="lazy"
        className={`aspect-[4/5] rounded-card object-cover ${className}`}
      />
    );
  }
  return (
    <div className={`flex aspect-[4/5] items-center justify-center rounded-card bg-teal-50 p-6 text-center text-muted ${className}`}>
      [PLACEHOLDER: foto de Cristy]
    </div>
  );
}
