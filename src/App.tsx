import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import Home from '@/pages/Home';

// Every page except the home page is loaded on demand.
const Numbers = lazy(() => import('@/pages/Numbers'));
const Proxies = lazy(() => import('@/pages/Proxies'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Developers = lazy(() => import('@/pages/Developers'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Legal = lazy(() => import('@/pages/Legal'));
const Auth = lazy(() => import('@/pages/Auth'));
const AppPlaceholder = lazy(() => import('@/pages/AppPlaceholder'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return <div className="min-h-screen bg-ink" aria-busy="true" aria-label="Loading page" />;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="numbers" element={<Numbers />} />
              <Route path="proxies" element={<Proxies />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="developers" element={<Developers />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="legal/:slug" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="login" element={<Auth key="login" mode="login" />} />
            <Route path="signup" element={<Auth key="signup" mode="signup" />} />
            {/* BACKEND: the customer dashboard replaces this route in stage 2. */}
            <Route path="app/*" element={<AppPlaceholder />} />
          </Routes>
        </Suspense>
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1b1815',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#f4efe8',
              borderRadius: '14px',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </CurrencyProvider>
    </MotionConfig>
  );
}
