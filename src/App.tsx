/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './pages/PublicLayout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import AdminLayout from './pages/AdminLayout';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Services from './pages/admin/Services';
import BusinessHours from './pages/admin/BusinessHours';
import BlockedDates from './pages/admin/BlockedDates';
import Settings from './pages/admin/Settings';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Booking />} />
        </Route>
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="services" element={<Services />} />
          <Route path="business-hours" element={<BusinessHours />} />
          <Route path="blocked-dates" element={<BlockedDates />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
