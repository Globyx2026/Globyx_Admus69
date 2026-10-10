import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
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
const Password = lazy(() => import('@/pages/Password'));
const AppShell = lazy(() => import('@/components/app/AppShell'));
const Overview = lazy(() => import('@/pages/app/Overview'));
const MyNumbers = lazy(() => import('@/pages/app/MyNumbers'));
const MyProxies = lazy(() => import('@/pages/app/MyProxies'));
const WalletPage = lazy(() => import('@/pages/app/WalletPage'));
const ApiKeys = lazy(() => import('@/pages/app/ApiKeys'));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return <div className="min-h-screen bg-ink" aria-busy="true" aria-label="Loading page" />;
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider>
        <AuthProvider>
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
              <Route path="forgot-password" element={<Password key="forgot" mode="forgot" />} />
              <Route path="reset-password" element={<Password key="reset" mode="reset" />} />
              {/* Customer dashboard. AppShell sends signed-out visitors to /login. */}
              <Route path="app" element={<AppShell />}>
                <Route index element={<Overview />} />
                <Route path="numbers" element={<MyNumbers />} />
                <Route path="proxies" element={<MyProxies />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Route>
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
        </AuthProvider>
      </CurrencyProvider>
    </MotionConfig>
  );
}
