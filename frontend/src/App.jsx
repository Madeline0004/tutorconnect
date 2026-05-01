import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/globals.css';

import Home from './pages/Home';
import { Login, Register } from './pages/auth/Auth';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import BrowseCourses from './pages/student/BrowseCourses';
import MyCourses from './pages/student/MyCourses';
import FindTeachers from './pages/student/FindTeachers';
import StudentBookings from './pages/student/Bookings';
import StudentPayments from './pages/student/Payments';
import StudentProfile from './pages/student/Profile';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherCourses from './pages/teacher/Courses';
import TeacherSlots from './pages/teacher/Slots';
import TeacherBookings from './pages/teacher/Bookings';
import TeacherEarnings from './pages/teacher/Earnings';
import TeacherProfile from './pages/teacher/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTeachers from './pages/admin/Teachers';
import AdminPayments from './pages/admin/Payments';
import AdminAnalytics from './pages/admin/Analytics';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} />

      {/* Student routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/courses" element={<ProtectedRoute role="student"><BrowseCourses /></ProtectedRoute>} />
      <Route path="/student/my-courses" element={<ProtectedRoute role="student"><MyCourses /></ProtectedRoute>} />
      <Route path="/student/teachers" element={<ProtectedRoute role="student"><FindTeachers /></ProtectedRoute>} />
      <Route path="/student/bookings" element={<ProtectedRoute role="student"><StudentBookings /></ProtectedRoute>} />
      <Route path="/student/payments" element={<ProtectedRoute role="student"><StudentPayments /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

      {/* Teacher routes */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/courses" element={<ProtectedRoute role="teacher"><TeacherCourses /></ProtectedRoute>} />
      <Route path="/teacher/slots" element={<ProtectedRoute role="teacher"><TeacherSlots /></ProtectedRoute>} />
      <Route path="/teacher/bookings" element={<ProtectedRoute role="teacher"><TeacherBookings /></ProtectedRoute>} />
      <Route path="/teacher/earnings" element={<ProtectedRoute role="teacher"><TeacherEarnings /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><AdminTeachers /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                boxShadow: 'var(--shadow-lg)',
              },
              success: { iconTheme: { primary: 'var(--green)', secondary: 'white' } },
              error: { iconTheme: { primary: 'var(--red)', secondary: 'white' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
