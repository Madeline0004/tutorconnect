import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function TeacherEarnings() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/teachers/me'),
      api.get('/teachers/bookings/incoming'),
    ]).then(([p, b]) => {
      setProfile(p.data);
      setBookings(b.data);
    }).finally(() => setLoading(false));
  }, []);

  const completed = bookings.filter(b => b.status === 'COMPLETED');
  const totalRevenue = completed.reduce((s, b) => s + b.total_amount, 0);
  const platformFee = totalRevenue * 0.3;
  const teacherEarning = totalRevenue * 0.7;

  return (
    <DashboardLayout title="Earnings">
      <div className="grid-3 mb-24">
        {[
          { label: 'Total Sessions', value: completed.length, icon: '🎓', color: 'var(--blue)' },
          { label: 'Gross Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: '💰', color: 'var(--accent)' },
          { label: 'Your Earnings (70%)', value: `₹${teacherEarning.toFixed(0)}`, icon: '🏦', color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '15', color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue breakdown */}
      <div className="card mb-24">
        <div className="card-body">
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Revenue Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Total Collected', value: totalRevenue, pct: 100, color: 'var(--blue)' },
              { label: 'Platform Commission (30%)', value: platformFee, pct: 30, color: 'var(--red)' },
              { label: 'Your Earnings (70%)', value: teacherEarning, pct: 70, color: 'var(--green)' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>₹{item.value.toFixed(0)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completed sessions table */}
      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Completed Sessions</h3>
        {completed.length === 0 ? (
          <div className="card">
            <div className="card-body">
              <div className="empty-state" style={{ padding: '32px 0' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
                <p>No completed sessions yet</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Total</th>
                  <th>Your Share (70%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: 'var(--blue)' }}>
                          {b.student?.user?.name?.[0] || 'S'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{b.student?.user?.name || 'Student'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {new Date(b.time_slot).toLocaleDateString()}
                    </td>
                    <td>{b.duration}h</td>
                    <td style={{ fontWeight: 600 }}>₹{b.total_amount}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>₹{(b.total_amount * 0.7).toFixed(0)}</td>
                    <td><span className="badge badge-green">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
