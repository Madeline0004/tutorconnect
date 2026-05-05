import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBinLine, RiCalendarLine } from 'react-icons/ri';

export default function TeacherSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ start_time: '', end_time: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers/slots/my');
      setSlots(data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)));
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  };

  const addSlot = async e => {
    e.preventDefault();
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.error('End time must be after start time');
      return;
    }
    setSaving(true);
    try {
      await api.post('/teachers/slots', {
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
      });
      toast.success('Availability slot added!');
      setForm({ start_time: '', end_time: '' });
      fetchSlots();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add slot');
    } finally { setSaving(false); }
  };

  const deleteSlot = async id => {
    try {
      await api.delete(`/teachers/slots/${id}`);
      toast.success('Slot removed');
      setSlots(s => s.filter(sl => sl.id !== id));
    } catch { toast.error('Failed to delete slot'); }
  };

  const upcoming = slots.filter(s => new Date(s.start_time) > new Date());
  const past = slots.filter(s => new Date(s.start_time) <= new Date());

  return (
    <DashboardLayout title="Availability">
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Add slot form */}
        <div className="card">
          <div className="card-body">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RiAddLine color="var(--accent)" /> Add Availability Slot
            </h3>
            <form onSubmit={addSlot}>
              <div className="form-group">
                <label className="form-label">Start Date & Time</label>
                <input className="form-input" type="datetime-local"
                  value={form.start_time}
                  onChange={e => setForm({ ...form, start_time: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date & Time</label>
                <input className="form-input" type="datetime-local"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  min={form.start_time || new Date().toISOString().slice(0, 16)}
                  required />
              </div>
              {form.start_time && form.end_time && (
                <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--accent)' }}>
                    Duration: {Math.round((new Date(form.end_time) - new Date(form.start_time)) / 3600000 * 10) / 10} hours
                  </span>
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                {saving ? <span className="spinner" /> : <><RiAddLine /> Add Slot</>}
              </button>
            </form>
          </div>
        </div>

        {/* Slots list */}
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <RiCalendarLine color="var(--accent)" /> Upcoming Slots
            <span className="badge badge-orange" style={{ marginLeft: 8 }}>{upcoming.length}</span>
          </h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : upcoming.length === 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                  <p>No upcoming slots. Add one to get started.</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(slot => (
                <SlotCard key={slot.id} slot={slot} onDelete={deleteSlot} />
              ))}
            </div>
          )}

          {past.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Past Slots</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {past.slice(0, 5).map(slot => (
                  <SlotCard key={slot.id} slot={slot} onDelete={deleteSlot} past />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function SlotCard({ slot, onDelete, past }) {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  const duration = Math.round((end - start) / 3600000 * 10) / 10;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      background: past ? 'var(--bg-tertiary)' : 'var(--bg-card)',
      border: `1px solid ${slot.is_booked ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      opacity: past ? 0.6 : 1,
      transition: 'all var(--transition)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: slot.is_booked ? 'var(--green-light)' : 'var(--accent-light)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: slot.is_booked ? 'var(--green)' : 'var(--accent)', lineHeight: 1 }}>{start.getDate()}</div>
        <div style={{ fontSize: 10, color: slot.is_booked ? 'var(--green)' : 'var(--accent)', fontWeight: 600 }}>{start.toLocaleString('default', { month: 'short' })}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} · {duration}h
        </div>
      </div>
      {slot.is_booked ? (
        <span className="badge badge-green">Booked</span>
      ) : (
        <span className="badge badge-orange">Available</span>
      )}
      {!past && !slot.is_booked && (
        <button
          onClick={() => onDelete(slot.id)}
          style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, borderRadius: 6, transition: 'color var(--transition)' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <RiDeleteBinLine size={16} />
        </button>
      )}
    </div>
  );
}
