import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';

export default function AdminTeachers() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/teachers/pending');
      setPending(data);
    } catch { toast.error('Failed to load pending teachers'); }
    finally { setLoading(false); }
  };

  const handleAction = async (teacherId, action) => {
    try {
      await api.put(`/admin/teachers/${teacherId}/${action}`);
      toast.success(action === 'approve' ? 'Teacher approved!' : 'Teacher rejected');
      setPending(p => p.filter(t => t.id !== teacherId));
    } catch { toast.error('Action failed'); }
  };

  return (
    <DashboardLayout title="Teacher Approvals">
      <div className="section-header">
        <div>
          <h2 className="section-title">Pending Teacher Approvals</h2>
          <p className="text-muted mt-8">{pending.length} teachers awaiting review</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : pending.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state" style={{ padding: '64px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3>All caught up!</h3>
              <p>No pending teacher approvals</p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pending.map(teacher => (
            <div key={teacher.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div className="avatar avatar-lg" style={{ background: 'var(--accent)' }}>
                      {teacher.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700 }}>{teacher.user?.name}</h3>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{teacher.user?.email}</div>
                    </div>
                  </div>
                  <span className="badge badge-yellow" style={{ padding: '6px 14px' }}>⏳ Pending Review</span>
                </div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16, margin: '20px 0',
                  padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'
                }}>
                  {[
                    { label: 'Subject', value: teacher.subject },
                    { label: 'Level', value: teacher.level },
                    { label: 'Hourly Rate', value: `₹${teacher.hourly_rate}/hr` },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {teacher.bio && (
                  <div style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Bio</div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{teacher.bio}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-success" onClick={() => handleAction(teacher.id, 'approve')}>
                    <RiCheckLine /> Approve Teacher
                  </button>
                  <button className="btn btn-danger" onClick={() => handleAction(teacher.id, 'reject')}>
                    <RiCloseLine /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
