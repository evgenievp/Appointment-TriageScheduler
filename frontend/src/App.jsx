import { Routes, Route } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import TriageDraftProvider from './components/TriageDraftProvider';
import ErrorBoundary from './components/ErrorBoundary';
import RequireAuth from './components/RequireAuth';
import ScrollToTop from './components/ScrollToTop';
import SessionWatcher from './components/SessionWatcher';
import ToastProvider from './components/ToastProvider';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorCalendar from './pages/DoctorCalendar';
import Triage from './pages/Triage';
import MyAppointments from './pages/MyAppointments';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorSlots from './pages/DoctorSlots';
import NotFound from './pages/NotFound';
import StaffAssign from './pages/StaffAssign';
import StaffDashboard from './pages/StaffDashboard';
import StaffNewBooking from './pages/StaffNewBooking';
import StaffRoles from './pages/StaffRoles';

// ToastProvider sits outermost so SessionWatcher can reach both the session and
// the toasts.
//
// ErrorBoundary стои над всичко останало — така хваща и грешка в самите
// providers, а резервният му изглед не зависи от нито един от тях.
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <TriageDraftProvider>
            <ScrollToTop />
            <SessionWatcher />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id/calendar" element={<DoctorCalendar />} />
              <Route
                path="/triage"
                element={
                  <RequireAuth>
                    <Triage />
                  </RequireAuth>
                }
              />
              <Route
                path="/me/appointments"
                element={
                  <RequireAuth>
                    <MyAppointments />
                  </RequireAuth>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <RequireAuth role="DOCTOR">
                    <DoctorAppointments />
                  </RequireAuth>
                }
              />
              <Route
                path="/doctor/slots"
                element={
                  <RequireAuth role="DOCTOR">
                    <DoctorSlots />
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
              <Route
                path="/staff/roles"
                element={
                  <RequireAuth role="STAFF">
                    <StaffRoles />
                  </RequireAuth>
                }
              />
              <Route
                path="/staff/assign/:id"
                element={
                  <RequireAuth role="STAFF">
                    <StaffAssign />
                  </RequireAuth>
                }
              />
              {/* Без този ред несъвпадащ адрес не рисува нищо — бяла страница без
                  хедър и без изход освен стрелката „назад“. */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TriageDraftProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
