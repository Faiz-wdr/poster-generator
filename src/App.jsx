import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lightweight pages loaded eagerly (login screens are tiny)
import Login from './pages/admin/Login';
import SuperLogin from './pages/admin/SuperLogin';

// Heavy pages lazy-loaded — only fetched when the route is visited
const SaaSLanding = lazy(() => import('./pages/SaaSLanding'));
const PublicEvent = lazy(() => import('./pages/PublicEvent'));
const PublicEventDetail = lazy(() => import('./pages/PublicEventDetail'));
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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<SaaSLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sadmin" element={<SuperLogin />} />
          <Route path="/event/:slug" element={<PublicEvent />} />
          <Route path="/event/:slug/detail/:id" element={<PublicEventDetail />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
