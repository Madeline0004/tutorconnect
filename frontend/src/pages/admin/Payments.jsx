import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiCheckLine, RiCloseLine, RiImageLine } from 'react-icons/ri';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [viewImg, setViewImg] = useState(null);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments/');
      setPayments(data);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  const handleAction = async (paymentId, action) => {
    try {
      await api.put(`/payments/${paymentId}/${action}`);
      toast.success(action === 'verify' ? 'Payment verified! Booking confirmed.' : 'Payment rejected');
      fetchPayments();
    } catch { toast.error('Action failed'); }
  };

  const filtered = filter === 'ALL' ? payments : payments.filter(p => p.status === filter);

  return (
    <DashboardLayout title="Payments">
      <div className="section-header mb-24">
        <div>
          <h2 className="section-title">Payment Management</h2>
          <p className="text-muted mt-8">{payments.filter(p => p.status === 'PENDING').length} pending verifications</p>
        </div>
      </div>

      <div className="filter-pills mb-24">
        {['PENDING', 'VERIFIED', 'REJECTED', 'ALL'].map(f => (
          <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
            <span style={{ marginLeft: 6, fontWeight: 700 }}>
              {f === 'ALL' ? payments.length : payments.filter(p => p.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="card-body"><div className="empty-state" style={{ padding: '48px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
          <h3>No payments found</h3>
        </div></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(payment => (
            <PaymentCard key={payment.id} payment={payment} onAction={handleAction} onViewImg={setViewImg} />
          ))}
        </div>
      )}

      {/* Image viewer modal */}
      {viewImg && (
        <div className="modal-backdrop" onClick={() => setViewImg(null)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', padding: 16, maxWidth: '90vw', maxHeight: '90vh' }}>
            <img src={viewImg} alt="Payment screenshot" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12 }} />
            <button className="btn btn-secondary btn-full" style={{ marginTop: 12 }} onClick={() => setViewImg(null)}>Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function PaymentCard({ payment, onAction, onViewImg }) {
  const isPending = payment.status === 'PENDING';

  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0
            }}>💳</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Payment #{payment.id}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Booking #{payment.booking_id} · {new Date(payment.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <span className={`badge status-${payment.status}`} style={{ padding: '6px 14px', fontSize: 13 }}>
            {payment.status}
          </span>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, padding: '16px',
          background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
          marginBottom: 16
        }}>
          {[
            { label: 'Amount', value: `₹${payment.amount}` },
            { label: 'Platform Fee', value: `₹${payment.platform_fee?.toFixed(0)}` },
            { label: 'Teacher Earning', value: `₹${payment.teacher_earning?.toFixed(0)}` },
            { label: 'Method', value: payment.payment_method },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {payment.transaction_id && (
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>TXN ID: </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{payment.transaction_id}</span>
            </div>
          )}

          {payment.screenshot_url && (
            <button className="btn btn-ghost btn-sm" onClick={() => onViewImg(payment.screenshot_url)}>
              <RiImageLine /> View Screenshot
            </button>
          )}

          {isPending && (
            <>
              <button className="btn btn-success" onClick={() => onAction(payment.id, 'verify')}>
                <RiCheckLine /> Verify Payment
              </button>
              <button className="btn btn-danger" onClick={() => onAction(payment.id, 'reject')}>
                <RiCloseLine /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
