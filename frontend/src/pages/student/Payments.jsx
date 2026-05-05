import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';

export default function StudentPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/my').then(r => setPayments(r.data)).finally(() => setLoading(false));
  }, []);

  const total = payments.filter(p => p.status === 'VERIFIED').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout title="Payments">
      <div className="grid-3 mb-24">
        {[
          { label: 'Total Paid', value: `₹${total.toFixed(0)}`, icon: '💰', color: 'var(--green)' },
          { label: 'Total Sessions', value: payments.filter(p => p.status === 'VERIFIED').length, icon: '✅', color: 'var(--blue)' },
          { label: 'Pending', value: payments.filter(p => p.status === 'PENDING').length, icon: '⏳', color: 'var(--yellow)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '15', color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Payment History</h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : payments.length === 0 ? (
        <div className="card"><div className="card-body">
          <div className="empty-state" style={{ padding: '48px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <h3>No payments yet</h3>
          </div>
        </div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{p.id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>#{p.booking_id}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{p.amount}</td>
                  <td><span className="badge badge-blue">{p.payment_method}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.transaction_id || '—'}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td><span className={`badge status-${p.status}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
