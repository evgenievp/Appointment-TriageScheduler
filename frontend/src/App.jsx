import { Routes, Route } from 'react-router-dom';
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
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id/calendar" element={<DoctorCalendar />} />
        <Route path="/me/appointments" element={<MyAppointments />} />
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/new" element={<StaffNewBooking />} />
        {/* Без auth guards във Фаза 0 — ролите идват заедно с логин flow-а. */}
      </Routes>
    </ToastProvider>
  );
}
