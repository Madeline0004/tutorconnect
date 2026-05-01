import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const chartData = stats ? [
    { name: 'Students', value: stats.total_students, fill: '#2563eb' },
    { name: 'Teachers', value: stats.total_teachers, fill: '#e85d26' },
    { name: 'Bookings', value: stats.total_bookings, fill: '#16a34a' },
    { name: 'Pending Pay', value: stats.pending_payments, fill: '#d97706' },
  ] : [];

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h2 style={{ color: 'white', fontSize: 22, marginBottom: 4 }}>Admin Control Panel</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Monitor and manage all platform activity</p>
        </div>
        <div style={{ fontSize: 40 }}>🛡️</div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid-4">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="stat-card">
              <div style={{ height: 44, width: 44, background: 'var(--bg-tertiary)', borderRadius: 10, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 28, width: '60%', background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 6, animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: 14, width: '80%', background: 'var(--bg-tertiary)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-4 mb-24">
          {[
            { icon: '🎓', label: 'Total Students', value: stats?.total_students, color: 'var(--blue)' },
            { icon: '👨‍🏫', label: 'Total Teachers', value: stats?.total_teachers, color: 'var(--accent)' },
            { icon: '⏳', label: 'Pending Approvals', value: stats?.pending_teachers, color: 'var(--yellow)' },
            { icon: '📅', label: 'Total Bookings', value: stats?.total_bookings, color: 'var(--purple)' },
            { icon: '💰', label: 'Platform Revenue', value: `₹${stats?.total_revenue}`, color: 'var(--green)' },
            { icon: '📊', label: 'Total Payments', value: `₹${stats?.total_payments}`, color: 'var(--blue)' },
            { icon: '🔍', label: 'Pending Payments', value: stats?.pending_payments, color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.color + '15', color: s.color }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {!loading && stats && (
        <div className="card mb-24">
          <div className="card-body">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Platform Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                  cursor={{ fill: 'var(--bg-hover)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid-3">
        {[
          { icon: '👨‍🏫', title: 'Teacher Approvals', desc: `${stats?.pending_teachers || 0} pending`, to: '/admin/teachers', color: 'var(--yellow)' },
          { icon: '💳', title: 'Payment Verification', desc: `${stats?.pending_payments || 0} pending`, to: '/admin/payments', color: 'var(--green)' },
          { icon: '👥', title: 'Manage Users', desc: 'Block/unblock users', to: '/admin/users', color: 'var(--blue)' },
        ].map(a => (
          <a key={a.to} href={a.to} style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 24, textDecoration: 'none',
            display: 'block', transition: 'all var(--transition)',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{a.title}</div>
            <div style={{ fontSize: 13, color: a.color, fontWeight: 600 }}>{a.desc}</div>
          </a>
        ))}
      </div>
    </DashboardLayout>
  );
}
