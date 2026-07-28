import { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { getSubdomainInfo } from './lib/subdomain';

import ErrorBoundary from './components/ErrorBoundary';

// Lightweight pages loaded eagerly
import Login from './pages/admin/Login';
import SuperLogin from './pages/admin/SuperLogin';

// Heavy pages lazy-loaded
const SaaSLanding = lazy(() => import('./pages/SaaSLanding'));
const PublicEvent = lazy(() => import('./pages/PublicEvent'));
const PublicEventDetail = lazy(() => import('./pages/PublicEventDetail'));
const RulesAndRegulations = lazy(() => import('./pages/RulesAndRegulations'));
const AdminApp = lazy(() => import('./pages/admin/AdminApp'));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard'));

function PageLoader() {
  return (
    <div style={{
      display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', fontFamily: 'var(--font-body)'
    }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
        Loading…
      </div>
    </div>
  );
}

/** Wrapper component to inject subdomain slug into PublicEvent */
function SubdomainEventWrapper({ slug }) {
  return <PublicEvent overrideSlug={slug} />;
}

/** Wrapper component to inject subdomain slug into PublicEventDetail */
function SubdomainEventDetailWrapper({ slug }) {
  const { id } = useParams();
  return <PublicEventDetail overrideSlug={slug} overrideId={id} />;
}

/** Wrapper component to inject subdomain slug into RulesAndRegulations */
function SubdomainRulesWrapper({ slug }) {
  return <RulesAndRegulations overrideSlug={slug} />;
}

export default function App() {
  const subdomainInfo = useMemo(() => getSubdomainInfo(), []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          {/* If visiting via wildcard client subdomain (e.g. alqamar.yourdomain.com) */}
          {subdomainInfo.type === 'client' && subdomainInfo.slug ? (
            <Routes>
              <Route path="/" element={<SubdomainEventWrapper slug={subdomainInfo.slug} />} />
              <Route path="/detail/:id" element={<SubdomainEventDetailWrapper slug={subdomainInfo.slug} />} />
              <Route path="/rules" element={<SubdomainRulesWrapper slug={subdomainInfo.slug} />} />
              <Route path="/rules-and-regulations" element={<SubdomainRulesWrapper slug={subdomainInfo.slug} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/event/:slug" element={<PublicEvent />} />
              <Route path="/event/:slug/detail/:id" element={<PublicEventDetail />} />
              <Route path="/event/:slug/rules" element={<RulesAndRegulations />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : subdomainInfo.type === 'superadmin' ? (
            /* If visiting via admin.yourdomain.com */
            <Routes>
              <Route path="/" element={<SuperAdminDashboard />} />
              <Route path="/login" element={<SuperLogin />} />
              <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            /* Standard domain or localhost path routing */
            <Routes>
              <Route path="/" element={<SaaSLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sadmin" element={<SuperLogin />} />
              <Route path="/event/:slug" element={<PublicEvent />} />
              <Route path="/event/:slug/detail/:id" element={<PublicEventDetail />} />
              <Route path="/event/:slug/rules" element={<RulesAndRegulations />} />
              <Route path="/event/:slug/rules-and-regulations" element={<RulesAndRegulations />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
