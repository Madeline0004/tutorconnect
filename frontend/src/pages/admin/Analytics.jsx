import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Students', value: stats.total_students, color: '#2563eb' },
    { name: 'Teachers', value: stats.total_teachers, color: '#e85d26' },
  ] : [];

  const revenueData = stats ? [
    { name: 'Total Collected', value: stats.total_payments },
    { name: 'Platform Revenue', value: stats.total_revenue },
    { name: 'Teacher Payouts', value: stats.total_payments - stats.total_revenue },
  ] : [];

  return (
    <DashboardLayout title="Analytics">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Platform Analytics</h2>
        <p className="text-muted">Real-time overview of TutorConnect performance</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid-4 mb-24">
            {[
              { label: 'Total Users', value: (stats?.total_students || 0) + (stats?.total_teachers || 0), icon: '👥', color: 'var(--blue)' },
              { label: 'Total Bookings', value: stats?.total_bookings, icon: '📅', color: 'var(--purple)' },
              { label: 'Platform Revenue', value: `₹${stats?.total_revenue}`, icon: '💰', color: 'var(--green)' },
              { label: 'Pending Payments', value: stats?.pending_payments, icon: '⏳', color: 'var(--yellow)' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.color + '15', color: s.color }}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            {/* Revenue chart */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Revenue Breakdown</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData} barSize={44}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }}
                      cursor={{ fill: 'var(--bg-hover)' }}
                      formatter={(v) => [`₹${v}`, 'Amount']}
                    />
                    <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User distribution pie */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>User Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary table */}
          <div className="card mt-24">
            <div className="card-body">
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Key Metrics Summary</h3>
              <div className="table-wrap" style={{ border: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: 'Total Students', value: stats?.total_students, cat: 'Users' },
                      { metric: 'Total Teachers', value: stats?.total_teachers, cat: 'Users' },
                      { metric: 'Pending Teacher Approvals', value: stats?.pending_teachers, cat: 'Operations' },
                      { metric: 'Total Bookings', value: stats?.total_bookings, cat: 'Bookings' },
                      { metric: 'Pending Payments', value: stats?.pending_payments, cat: 'Finance' },
                      { metric: 'Platform Revenue', value: `₹${stats?.total_revenue}`, cat: 'Finance' },
                      { metric: 'Total Payments Collected', value: `₹${stats?.total_payments}`, cat: 'Finance' },
                    ].map(row => (
                      <tr key={row.metric}>
                        <td style={{ fontWeight: 600 }}>{row.metric}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{row.value}</td>
                        <td><span className="badge badge-gray">{row.cat}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
