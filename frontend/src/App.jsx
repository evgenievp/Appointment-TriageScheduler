import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import RequireAuth from './components/RequireAuth';
import ToastProvider from './components/ToastProvider';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorCalendar from './pages/DoctorCalendar';
import MyAppointments from './pages/MyAppointments';
import StaffDashboard from './pages/StaffDashboard';
import StaffNewBooking from './pages/StaffNewBooking';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id/calendar" element={<DoctorCalendar />} />
          <Route
            path="/me/appointments"
            element={
              <RequireAuth>
                <MyAppointments />
              </RequireAuth>
            }
          />
          <Route
            path="/staff"
            element={
              <RequireAuth role="STAFF">
                <StaffDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/staff/new"
            element={
              <RequireAuth role="STAFF">
                <StaffNewBooking />
              </RequireAuth>
            }
          />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
