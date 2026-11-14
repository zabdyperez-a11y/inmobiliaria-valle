import { useSeo } from '../lib/seo';

export default function Privacy() {
  useSeo({ title: 'Aviso de privacidad | Inmobiliaria Valle', description: 'Aviso de privacidad de Inmobiliaria Valle.', path: '/aviso-de-privacidad' });
  return (
    <div className="wrap max-w-3xl py-10 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Aviso de privacidad</h1>
      <div className="mt-6 space-y-4">
        <p>[PLACEHOLDER: pega aquí el texto actual del aviso de privacidad.]</p>
      </div>
    </div>
  );
}
