import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function StudentProfile() {
  const { user } = useAuth();
  return (
    <DashboardLayout title="Profile">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="card">
          <div style={{ height: 80, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', borderRadius: '16px 16px 0 0' }} />
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div className="avatar avatar-xl" style={{
              background: 'var(--blue)', marginTop: -32,
              border: '4px solid var(--bg-card)', fontSize: 28
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 12, marginBottom: 2 }}>{user?.name}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>{user?.email}</p>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              {[
                { label: 'Role', value: 'Student' },
                { label: 'Member Since', value: 'TutorConnect Student' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
