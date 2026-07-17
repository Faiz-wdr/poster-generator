import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SaaSLanding from './pages/SaaSLanding';
import PublicEvent from './pages/PublicEvent';
import PublicEventDetail from './pages/PublicEventDetail';
import Login from './pages/admin/Login';
import SuperLogin from './pages/admin/SuperLogin';
import AdminApp from './pages/admin/AdminApp';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SaaSLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sadmin" element={<SuperLogin />} />
        <Route path="/event/:slug" element={<PublicEvent />} />
        <Route path="/event/:slug/detail/:id" element={<PublicEventDetail />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
