// Day 3: Frontend routing and base layouts
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { OfficerLayout, ResidentLayout } from './components/Layouts';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Help from './pages/Help';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ResidentDashboard from './pages/resident/ResidentDashboard';
import SubmitComplaint from './pages/resident/SubmitComplaint';
import TrackComplaint from './pages/resident/TrackComplaint';
import MyComplaints from './pages/resident/MyComplaints';
import ResidentComplaintDetails from './pages/resident/ComplaintDetails';
import Notifications from './pages/resident/Notifications';
import ResidentSettings from './pages/resident/Settings';
import EditProfile from './pages/resident/EditProfile';
import ChangePassword from './pages/resident/ChangePassword';

import OfficerDashboard from './pages/officer/OfficerDashboard';
import ComplaintQueue from './pages/officer/ComplaintQueue';
import ActionLog from './pages/officer/ActionLog';
import OfficerComplaintDetails from './pages/officer/ComplaintDetails';
import Settings from './pages/officer/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Public guest submission — reachable without auth (see ?guest=true). */}
      <Route path="/submit-complaint" element={<SubmitComplaint />} />

      <Route
        path="/resident"
        element={
          <ProtectedRoute role="resident">
            <ResidentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResidentDashboard />} />
        <Route path="report" element={<SubmitComplaint />} />
        <Route path="submit" element={<Navigate to="/resident/report" replace />} />
        <Route path="track" element={<TrackComplaint />} />
        <Route path="complaints" element={<MyComplaints />} />
        <Route path="complaints/:id" element={<ResidentComplaintDetails />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<ResidentSettings />} />
        <Route path="settings/profile" element={<EditProfile />} />
        <Route path="settings/password" element={<ChangePassword />} />
      </Route>

      <Route
        path="/officer"
        element={
          <ProtectedRoute role="officer">
            <OfficerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OfficerDashboard />} />
        <Route path="queue" element={<ComplaintQueue />} />
        <Route path="action-log" element={<ActionLog />} />
        <Route path="complaints/:id" element={<OfficerComplaintDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Public placeholder pages */}
      <Route path="/help" element={<Help />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
