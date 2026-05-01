import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import {
  RiBookOpenLine, RiCalendarLine, RiStarLine,
  RiArrowRightLine, RiTimeLine, RiMoneyDollarCircleLine
} from 'react-icons/ri';

const STATUS_COLORS = {
  REQUESTED: 'blue', TEACHER_ACCEPTED: 'green', TEACHER_REJECTED: 'red',
  PAYMENT_PENDING: 'yellow', PENDING_VERIFICATION: 'purple',
  CONFIRMED: 'green', COMPLETED: 'gray', CANCELLED: 'red'
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/my'),
      api.get('/courses/enrolled/my'),
    ]).then(([b, e]) => {
      setBookings(b.data.slice(0, 5));
      setEnrollments(e.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const pending = bookings.filter(b => ['REQUESTED', 'PAYMENT_PENDING'].includes(b.status)).length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <DashboardLayout title="Student Dashboard">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Here's what's happening with your learning today</p>
        </div>
        <Link to="/student/courses" className="btn btn-primary">
          Browse Courses <RiArrowRightLine />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4 mt-24 mb-24">
        <StatCard icon="📚" label="Enrolled Courses" value={enrollments.length} color="var(--blue)" />
        <StatCard icon="📅" label="Active Bookings" value={confirmed} color="var(--accent)" />
        <StatCard icon="⏳" label="Pending Actions" value={pending} color="var(--yellow)" />
        <StatCard icon="✅" label="Completed Sessions" value={completed} color="var(--green)" />
      </div>

      <div className="grid-2">
        {/* Recent Bookings */}
        <div className="card">
          <div className="card-body">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 17 }}>Recent Bookings</h3>
              <Link to="/student/bookings" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {loading ? <LoadingList /> : bookings.length === 0 ? (
              <EmptyState icon="📅" text="No bookings yet" link="/student/teachers" linkText="Find a teacher" />
            ) : bookings.map(b => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="card">
          <div className="card-body">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 17 }}>My Courses</h3>
              <Link to="/student/my-courses" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {loading ? <LoadingList /> : enrollments.length === 0 ? (
              <EmptyState icon="📚" text="No courses enrolled" link="/student/courses" linkText="Browse courses" />
            ) : enrollments.map(c => (
              <div key={c.id} className="course-row">
                <div className="course-icon" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                  <RiBookOpenLine size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="course-row-title">{c.title}</div>
                  <div className="course-row-sub">{c.subject} · {c.level}</div>
                </div>
                <span className={`badge badge-blue`}>{c.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-actions mt-24">
        <h3 className="section-title mb-16">Quick Actions</h3>
        <div className="grid-3">
          {[
            { icon: '🔍', title: 'Find Teachers', desc: 'Browse verified educators by subject', to: '/student/teachers' },
            { icon: '📖', title: 'Browse Courses', desc: 'Explore structured learning courses', to: '/student/courses' },
            { icon: '📋', title: 'My Bookings', desc: 'Manage your session bookings', to: '/student/bookings' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="quick-action-card">
              <div className="qa-icon">{a.icon}</div>
              <div className="qa-title">{a.title}</div>
              <div className="qa-desc">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .welcome-banner {
          background: linear-gradient(135deg, var(--accent) 0%, #c44010 100%);
          border-radius: var(--radius-xl);
          padding: 28px 32px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
        }
        .welcome-text h2 { color: white; font-size: 22px; margin-bottom: 4px; }
        .welcome-text p { color: rgba(255,255,255,0.75); font-size: 14px; }
        .welcome-banner .btn-primary {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          white-space: nowrap;
          box-shadow: none;
        }
        .welcome-banner .btn-primary:hover { background: rgba(255,255,255,0.3); }
        .booking-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid var(--border-light);
        }
        .booking-row:last-child { border-bottom: none; padding-bottom: 0; }
        .booking-row-info { flex: 1; }
        .booking-row-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .booking-row-time { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .course-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid var(--border-light);
        }
        .course-row:last-child { border-bottom: none; }
        .course-icon {
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .course-row-title { font-size: 14px; font-weight: 600; }
        .course-row-sub { font-size: 12px; color: var(--text-muted); }
        .quick-action-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-decoration: none;
          transition: all var(--transition);
          display: block;
        }
        .quick-action-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .qa-icon { font-size: 28px; margin-bottom: 12px; }
        .qa-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
        .qa-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
      `}</style>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '15', color }}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function BookingRow({ booking }) {
  const statusClass = `status-${booking.status}`;
  return (
    <div className="booking-row">
      <div className="avatar avatar-sm" style={{ background: 'var(--accent)', flexShrink: 0 }}>
        {booking.teacher?.user?.name?.[0] || 'T'}
      </div>
      <div className="booking-row-info">
        <div className="booking-row-name">{booking.teacher?.user?.name || 'Teacher'}</div>
        <div className="booking-row-time">{new Date(booking.time_slot).toLocaleString()}</div>
      </div>
      <span className={`badge ${statusClass}`}>{booking.status.replace('_', ' ')}</span>
    </div>
  );
}

function LoadingList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 48, background: 'var(--bg-tertiary)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );
}

function EmptyState({ icon, text, link, linkText }) {
  return (
    <div className="empty-state" style={{ padding: '32px 0' }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <p>{text}</p>
      {link && <Link to={link} className="btn btn-primary btn-sm mt-16">{linkText}</Link>}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
