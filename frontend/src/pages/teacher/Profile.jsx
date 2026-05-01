import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiEditLine, RiSaveLine } from 'react-icons/ri';

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teachers/me');
      setProfile(data);
      setForm({ subject: data.subject, level: data.level, hourly_rate: data.hourly_rate, bio: data.bio });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/teachers/me', form);
      toast.success('Profile updated!');
      setEditing(false);
      fetchProfile();
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="Profile"><div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div></DashboardLayout>;

  return (
    <DashboardLayout title="My Profile">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header card */}
        <div className="card mb-24">
          <div style={{ height: 80, background: 'linear-gradient(135deg, var(--accent) 0%, #c44010 100%)', borderRadius: '16px 16px 0 0' }} />
          <div className="card-body" style={{ paddingTop: 0, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div className="avatar avatar-xl" style={{
                background: 'var(--accent)', marginTop: -32,
                border: '4px solid var(--bg-card)',
                fontSize: 28
              }}>
                {profile?.user?.name?.[0]?.toUpperCase()}
              </div>
              <span className={`badge ${profile?.is_approved ? 'badge-green' : 'badge-yellow'}`} style={{ marginBottom: 4 }}>
                {profile?.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 12, marginBottom: 2 }}>{profile?.user?.name}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{profile?.user?.email}</p>
          </div>
        </div>

        {/* Profile details */}
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>Teaching Profile</h3>
              {!editing ? (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  <RiEditLine /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><RiSaveLine /> Save</>}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Subject Expertise</label>
                  <input className="form-input" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Teaching Level</label>
                    <select className="form-select" value={form.level}
                      onChange={e => setForm({ ...form, level: e.target.value })}>
                      <option>Primary</option><option>Middle</option><option>Higher</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hourly Rate (₹)</label>
                    <input className="form-input" type="number" value={form.hourly_rate}
                      onChange={e => setForm({ ...form, hourly_rate: parseFloat(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" rows={4} value={form.bio}
                    onChange={e => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell students about yourself..." />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { label: 'Subject', value: profile?.subject },
                  { label: 'Teaching Level', value: profile?.level },
                  { label: 'Hourly Rate', value: `₹${profile?.hourly_rate}/hour` },
                  { label: 'Total Earnings', value: `₹${profile?.total_earnings?.toFixed(0) || 0}` },
                  { label: 'Bio', value: profile?.bio || 'No bio added yet.' },
                ].map(item => (
                  <div key={item.label} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
