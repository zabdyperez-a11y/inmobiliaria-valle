import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';

const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Sell = lazy(() => import('./pages/Sell'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./admin/AdminApp'));

const Loading = () => <div className="wrap py-16 text-muted">Cargando…</div>;

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="propiedades" element={<Properties />} />
          <Route path="propiedades/:slug" element={<PropertyDetail />} />
          <Route path="vende-tu-casa" element={<Sell />} />
          <Route path="nosotros" element={<About />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="aviso-de-privacidad" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
