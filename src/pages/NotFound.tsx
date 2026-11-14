import { Link } from 'react-router-dom';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { useSeo } from '../lib/seo';
import { WA } from '../lib/whatsapp';

export default function NotFound() {
  useSeo({ title: 'No encontré esta página | Inmobiliaria Valle', description: 'La página que buscas ya no existe.', path: '/404', noindex: true });
  return (
    <div className="wrap max-w-2xl py-16">
      <h1 className="text-3xl">No encontré esta página</h1>
      <p className="mt-3 text-lg">Puede que el enlace esté mal escrito o que la casa ya no esté publicada.</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/propiedades" className="btn-primary">Ver casas disponibles</Link>
        <WhatsAppButton message={WA.general()} location="404" />
      </div>
    </div>
  );
}
