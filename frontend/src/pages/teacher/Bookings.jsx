import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiCheckLine, RiCloseLine, RiCheckDoubleLine } from 'react-icons/ri';

const STATUS_LABEL = {
  REQUESTED: 'Pending Review',
  TEACHER_ACCEPTED: 'Awaiting Payment',
  TEACHER_REJECTED: 'Rejected',
  PAYMENT_PENDING: 'Payment Pending',
  PENDING_VERIFICATION: 'Payment Under Review',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function TeacherBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers/bookings/incoming');
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const handleAction = async (bookingId, action) => {
    try {
      await api.put(`/teachers/bookings/${bookingId}/${action}`);
      toast.success(action === 'accept' ? 'Booking accepted!' : action === 'reject' ? 'Booking rejected' : 'Session completed');
      fetchBookings();
    } catch { toast.error('Action failed'); }
  };

  const FILTERS = ['ALL', 'REQUESTED', 'TEACHER_ACCEPTED', 'CONFIRMED', 'COMPLETED'];
  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout title="Bookings">
      <div className="section-header">
        <div>
          <h2 className="section-title">All Bookings</h2>
          <p className="text-muted mt-8">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="filter-pills mb-24">
        {FILTERS.map(f => (
          <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'ALL' ? 'All' : STATUS_LABEL[f] || f}
            {f !== 'ALL' && (
              <span style={{ marginLeft: 6, fontWeight: 700 }}>
                {bookings.filter(b => b.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3>No bookings found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} onAction={handleAction} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

function BookingCard({ booking, onAction }) {
  const student = booking.student?.user;
  const isRequested = booking.status === 'REQUESTED';
  const isConfirmed = booking.status === 'CONFIRMED';

  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ background: 'var(--blue)' }}>
              {student?.name?.[0] || 'S'}
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{student?.name || 'Student'}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{student?.email}</div>
            </div>
          </div>
          <span className={`badge status-${booking.status}`} style={{ padding: '6px 14px', fontSize: 13 }}>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          margin: '20px 0', padding: '16px',
          background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'
        }}>
          {[
            { label: 'Date & Time', value: new Date(booking.time_slot).toLocaleString() },
            { label: 'Duration', value: `${booking.duration} hr${booking.duration > 1 ? 's' : ''}` },
            { label: 'Amount', value: `₹${booking.total_amount}` },
            { label: 'Booking ID', value: `#${booking.id}`, mono: true },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, fontFamily: item.mono ? 'var(--font-mono)' : undefined }}>{item.value}</div>
            </div>
          ))}
        </div>

        {booking.notes && (
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Notes: </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{booking.notes}</span>
          </div>
        )}

        {(isRequested || isConfirmed) && (
          <div style={{ display: 'flex', gap: 10 }}>
            {isRequested && (
              <>
                <button className="btn btn-success" onClick={() => onAction(booking.id, 'accept')}>
                  <RiCheckLine /> Accept Booking
                </button>
                <button className="btn btn-danger" onClick={() => onAction(booking.id, 'reject')}>
                  <RiCloseLine /> Reject
                </button>
              </>
            )}
            {isConfirmed && (
              <button className="btn btn-primary" onClick={() => onAction(booking.id, 'complete')}>
                <RiCheckDoubleLine /> Mark as Completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
