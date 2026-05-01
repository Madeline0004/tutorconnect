import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { RiCheckLine, RiCloseLine, RiArrowRightLine, RiMoneyDollarCircleLine } from 'react-icons/ri';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/teachers/me'),
      api.get('/teachers/bookings/incoming'),
    ]).then(([p, b]) => {
      setProfile(p.data);
      setBookings(b.data.slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAction = async (bookingId, action) => {
    try {
      await api.put(`/teachers/bookings/${bookingId}/${action}`);
      toast.success(action === 'accept' ? 'Booking accepted!' : 'Booking rejected');
      setBookings(bs => bs.map(b => b.id === bookingId ? { ...b, status: action === 'accept' ? 'TEACHER_ACCEPTED' : 'TEACHER_REJECTED' } : b));
    } catch { toast.error('Action failed'); }
  };

  const pending = bookings.filter(b => b.status === 'REQUESTED').length;
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;

  if (!profile?.is_approved) {
    return (
      <DashboardLayout title="Teacher Dashboard">
        <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
          <h2 style={{ marginBottom: 12 }}>Approval Pending</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your teacher profile is under review by our admin team. You'll be notified once approved.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
        <div className="welcome-text">
          <h2>Welcome, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Manage your sessions and grow your teaching career</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Total Earnings</div>
          <div style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>₹{profile?.total_earnings?.toFixed(0) || 0}</div>
        </div>
      </div>

      <div className="grid-4 mt-24 mb-24">
        <StatCard icon="⏳" label="Pending Requests" value={pending} color="var(--yellow)" />
        <StatCard icon="✅" label="Confirmed" value={confirmed} color="var(--green)" />
        <StatCard icon="🎓" label="Completed" value={completed} color="var(--blue)" />
        <StatCard icon="💰" label="Earnings (₹)" value={profile?.total_earnings?.toFixed(0) || 0} color="var(--accent)" />
      </div>

      <div className="grid-2">
        {/* Incoming bookings */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-body">
            <div className="section-header">
              <h3 className="section-title" style={{ fontSize: 17 }}>Incoming Booking Requests</h3>
              <Link to="/teacher/bookings" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            {loading ? <p className="text-muted">Loading...</p>
            : bookings.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <p>No booking requests yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.map(b => <BookingRequestRow key={b.id} booking={b} onAction={handleAction} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-3 mt-24">
        {[
          { icon: '📚', title: 'Manage Courses', desc: 'Create and edit your courses', to: '/teacher/courses' },
          { icon: '📅', title: 'Set Availability', desc: 'Manage your time slots', to: '/teacher/slots' },
          { icon: '💰', title: 'View Earnings', desc: 'Track your income and sessions', to: '/teacher/earnings' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="quick-action-card" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, textDecoration: 'none', display: 'block', transition: 'all var(--transition)' }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{a.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      <style>{`
        .welcome-banner {
          background: linear-gradient(135deg, var(--accent) 0%, #c44010 100%);
          border-radius: var(--radius-xl);
          padding: 28px 32px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .welcome-text h2 { color: white; font-size: 22px; margin-bottom: 4px; }
        .welcome-text p { color: rgba(255,255,255,0.75); font-size: 14px; }
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

function BookingRequestRow({ booking, onAction }) {
  const isRequested = booking.status === 'REQUESTED';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
      flexWrap: 'wrap'
    }}>
      <div className="avatar" style={{ background: 'var(--blue)', flexShrink: 0 }}>
        {booking.student?.user?.name?.[0] || 'S'}
      </div>
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{booking.student?.user?.name || 'Student'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {new Date(booking.time_slot).toLocaleString()} · {booking.duration}h · ₹{booking.total_amount}
        </div>
      </div>
      <span className={`badge status-${booking.status}`}>{booking.status.replace('_', ' ')}</span>
      {isRequested && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-success btn-sm" onClick={() => onAction(booking.id, 'accept')}>
            <RiCheckLine /> Accept
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => onAction(booking.id, 'reject')}>
            <RiCloseLine /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
