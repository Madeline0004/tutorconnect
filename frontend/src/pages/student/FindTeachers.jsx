import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiSearchLine, RiStarFill, RiCalendarLine, RiCloseLine } from 'react-icons/ri';

export default function FindTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [bookingTeacher, setBookingTeacher] = useState(null);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers/');
      setTeachers(data);
    } catch { toast.error('Failed to load teachers'); }
    finally { setLoading(false); }
  };

  const filtered = teachers.filter(t => {
    const s = search.toLowerCase();
    const matchSearch = t.user?.name?.toLowerCase().includes(s) || t.subject?.toLowerCase().includes(s);
    const matchLevel = level === 'All' || t.level === level;
    return matchSearch && matchLevel;
  });

  return (
    <DashboardLayout title="Find Teachers">
      <div className="filters-bar" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <RiSearchLine size={16} />
          <input placeholder="Search teachers, subjects..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {['All', 'Primary', 'Middle', 'Higher'].map(l => (
            <button key={l} className={`pill ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="text-muted mb-24">{filtered.length} teachers available</div>

      {loading ? (
        <div className="grid-3">{[1,2,3].map(i => <TeacherSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🏫</div>
          <h3>No teachers found</h3>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(t => (
            <TeacherCard key={t.id} teacher={t} onBook={() => setBookingTeacher(t)} />
          ))}
        </div>
      )}

      {bookingTeacher && (
        <BookingModal teacher={bookingTeacher} onClose={() => setBookingTeacher(null)} />
      )}
    </DashboardLayout>
  );
}

function TeacherCard({ teacher, onBook }) {
  const initials = teacher.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#e85d26', '#2563eb', '#16a34a', '#7c3aed', '#d97706'];
  const color = colors[teacher.id % colors.length];

  return (
    <div className="teacher-card card">
      <div className="teacher-card-header">
        <div className="teacher-avatar" style={{ background: color }}>{initials}</div>
        <div>
          <h3 className="teacher-name">{teacher.user?.name}</h3>
          <div className="teacher-subject">{teacher.subject}</div>
        </div>
      </div>
      <div className="teacher-card-body card-body" style={{ paddingTop: 0 }}>
        <div className="teacher-meta">
          <span className={`badge badge-${teacher.level === 'Primary' ? 'blue' : teacher.level === 'Middle' ? 'green' : 'purple'}`}>
            {teacher.level}
          </span>
          <div className="stars">
            {'★★★★★'.split('').map((s, i) => (
              <span key={i} style={{ color: i < 4 ? '#fbbf24' : 'var(--border)', fontSize: 12 }}>{s}</span>
            ))}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>4.8</span>
          </div>
        </div>
        {teacher.bio && <p className="teacher-bio">{teacher.bio}</p>}
        <div className="teacher-rate">
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>₹{teacher.hourly_rate}</span>
          <span className="text-muted"> / hour</span>
        </div>
        <button className="btn btn-primary btn-full" onClick={onBook}>
          <RiCalendarLine /> Book Session
        </button>
      </div>

      <style>{`
        .teacher-card { overflow: hidden; transition: all var(--transition); }
        .teacher-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .teacher-card-header {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 20px 0;
        }
        .teacher-avatar {
          width: 56px; height: 56px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800;
          font-family: var(--font-display); font-size: 18px;
          flex-shrink: 0;
        }
        .teacher-name { font-size: 16px; font-weight: 700; }
        .teacher-subject { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
        .teacher-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin: 16px 0;
        }
        .teacher-bio {
          font-size: 13px; color: var(--text-secondary);
          line-height: 1.5; margin-bottom: 16px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .teacher-rate { margin-bottom: 16px; }
      `}</style>
    </div>
  );
}

function BookingModal({ teacher, onClose }) {
  const [form, setForm] = useState({ time_slot: '', duration: 1, notes: '' });
  const [loading, setLoading] = useState(false);

  const total = teacher.hourly_rate * form.duration;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/bookings/', {
        teacher_id: teacher.id,
        time_slot: new Date(form.time_slot).toISOString(),
        duration: parseInt(form.duration),
        notes: form.notes
      });
      toast.success('Booking request sent! Waiting for teacher confirmation.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Book a Session</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              with {teacher.user?.name} · ₹{teacher.hourly_rate}/hr
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <RiCloseLine size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Session Date & Time</label>
              <input className="form-input" type="datetime-local" value={form.time_slot}
                onChange={e => setForm({ ...form, time_slot: e.target.value })} required
                min={new Date().toISOString().slice(0, 16)} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (hours)</label>
              <select className="form-select" value={form.duration}
                onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}>
                {[1, 2, 3, 4].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea className="form-textarea" placeholder="Topics you want to cover..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} />
            </div>
            <div className="booking-summary">
              <div className="booking-summary-row">
                <span>{form.duration} hr × ₹{teacher.hourly_rate}</span>
                <span className="booking-total">₹{total}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Payment required only after teacher approval
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Send Request'}
            </button>
          </div>
        </form>

        <style>{`
          .booking-summary {
            background: var(--bg-tertiary);
            border-radius: var(--radius-md);
            padding: 14px 16px;
          }
          .booking-summary-row {
            display: flex; justify-content: space-between; align-items: center;
            font-size: 14px;
          }
          .booking-total { font-size: 20px; font-weight: 800; color: var(--accent); }
        `}</style>
      </div>
    </div>
  );
}

function TeacherSkeleton() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-tertiary)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: 12, width: '60%', background: 'var(--bg-tertiary)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <div style={{ height: 12, background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: 36, background: 'var(--bg-tertiary)', borderRadius: 8, marginTop: 16, animation: 'pulse 1.5s infinite' }} />
    </div>
  );
}
