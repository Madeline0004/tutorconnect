import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiCloseLine, RiUploadLine, RiQrCodeLine } from 'react-icons/ri';

const STATUS_LABEL = {
  REQUESTED: 'Pending Teacher Review',
  TEACHER_ACCEPTED: 'Accepted — Pay Now',
  TEACHER_REJECTED: 'Rejected',
  PAYMENT_PENDING: 'Payment Required',
  PENDING_VERIFICATION: 'Payment Under Review',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function StudentBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [feedbackBooking, setFeedbackBooking] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="My Bookings">
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <h3>No bookings yet</h3>
          <p>Book a session with a teacher to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map(b => (
            <BookingCard
              key={b.id} booking={b}
              onPay={() => setPaymentBooking(b)}
              onFeedback={() => setFeedbackBooking(b)}
            />
          ))}
        </div>
      )}

      {paymentBooking && (
        <PaymentModal booking={paymentBooking} onClose={() => { setPaymentBooking(null); fetchBookings(); }} />
      )}
      {feedbackBooking && (
        <FeedbackModal booking={feedbackBooking} onClose={() => { setFeedbackBooking(null); fetchBookings(); }} />
      )}
    </DashboardLayout>
  );
}

function BookingCard({ booking, onPay, onFeedback }) {
  const statusClass = `status-${booking.status}`;
  const canPay = booking.status === 'TEACHER_ACCEPTED';
  const canFeedback = booking.status === 'COMPLETED';
  const teacher = booking.teacher?.user;

  return (
    <div className="booking-detail-card card">
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ background: 'var(--accent)' }}>
              {teacher?.name?.[0]}
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>{teacher?.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {booking.teacher?.subject} · {booking.teacher?.level}
              </div>
            </div>
          </div>
          <span className={`badge ${statusClass}`} style={{ padding: '6px 14px', fontSize: 13 }}>
            {STATUS_LABEL[booking.status] || booking.status}
          </span>
        </div>

        <div className="booking-info-grid">
          <InfoItem label="Date & Time" value={new Date(booking.time_slot).toLocaleString()} />
          <InfoItem label="Duration" value={`${booking.duration} hour${booking.duration > 1 ? 's' : ''}`} />
          <InfoItem label="Total Amount" value={`₹${booking.total_amount}`} />
          <InfoItem label="Booking ID" value={`#${booking.id}`} mono />
        </div>

        {booking.notes && (
          <div className="booking-notes">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</span>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{booking.notes}</p>
          </div>
        )}

        {/* Status flow */}
        <StatusFlow status={booking.status} />

        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          {canPay && (
            <button className="btn btn-primary" onClick={onPay}>
              <RiQrCodeLine /> Pay Now
            </button>
          )}
          {canFeedback && (
            <button className="btn btn-success" onClick={onFeedback}>
              ⭐ Give Feedback
            </button>
          )}
        </div>
      </div>

      <style>{`
        .booking-detail-card { margin-bottom: 0; }
        .booking-info-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin: 20px 0 0;
          padding: 16px; background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }
        @media (max-width: 640px) { .booking-info-grid { grid-template-columns: repeat(2, 1fr); } }
        .booking-notes {
          margin-top: 12px; padding: 12px;
          background: var(--bg-tertiary); border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
}

function InfoItem({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</div>
    </div>
  );
}

const FLOW_STEPS = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'TEACHER_ACCEPTED', label: 'Accepted' },
  { key: 'PENDING_VERIFICATION', label: 'Payment Review' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'COMPLETED', label: 'Completed' },
];

function StatusFlow({ status }) {
  const stepKeys = FLOW_STEPS.map(s => s.key);
  const currentIdx = stepKeys.indexOf(status);

  if (['TEACHER_REJECTED', 'CANCELLED'].includes(status)) {
    return (
      <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--red-light)', borderRadius: 'var(--radius-md)', color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>
        ✕ This booking was {status === 'TEACHER_REJECTED' ? 'rejected by the teacher' : 'cancelled'}
      </div>
    );
  }

  return (
    <div className="status-flow">
      {FLOW_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="status-flow-step">
            <div className={`sf-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
              {done && !active ? '✓' : i + 1}
            </div>
            <div className={`sf-label ${active ? 'sf-active' : done ? 'sf-done' : ''}`}>{step.label}</div>
            {i < FLOW_STEPS.length - 1 && <div className={`sf-line ${i < currentIdx ? 'done' : ''}`} />}
          </div>
        );
      })}

      <style>{`
        .status-flow {
          display: flex; align-items: flex-start; gap: 0;
          margin-top: 20px; padding: 16px;
          background: var(--bg-tertiary); border-radius: var(--radius-md);
          overflow-x: auto;
        }
        .status-flow-step {
          display: flex; flex-direction: column; align-items: center;
          flex: 1; position: relative; min-width: 80px;
        }
        .sf-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 2px solid var(--border);
          background: var(--bg-card);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: var(--text-muted);
          position: relative; z-index: 1;
          transition: all var(--transition);
        }
        .sf-dot.done { background: var(--green); border-color: var(--green); color: white; }
        .sf-dot.active { background: var(--accent); border-color: var(--accent); color: white; }
        .sf-label {
          font-size: 11px; color: var(--text-muted);
          margin-top: 6px; text-align: center; font-weight: 500;
        }
        .sf-active { color: var(--accent) !important; font-weight: 700 !important; }
        .sf-done { color: var(--green) !important; }
        .sf-line {
          position: absolute; top: 13px; left: 50%; right: -50%;
          height: 2px; background: var(--border);
          z-index: 0;
        }
        .sf-line.done { background: var(--green); }
      `}</style>
    </div>
  );
}

function PaymentModal({ booking, onClose }) {
  const [file, setFile] = useState(null);
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [upiInfo, setUpiInfo] = useState({ upi_id: 'tutorconnect@upi' });

  useEffect(() => {
    api.get('/payments/upi-info').then(r => setUpiInfo(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) { toast.error('Please upload payment screenshot'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('booking_id', booking.id);
      fd.append('transaction_id', txId);
      fd.append('screenshot', file);
      await api.post('/payments/initiate', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Payment submitted for admin verification!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment submission failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Complete Payment</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Booking #{booking.id}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <RiCloseLine size={22} />
          </button>
        </div>
        <div className="modal-body">
          {/* Amount */}
          <div style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>Amount to Pay</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)' }}>₹{booking.total_amount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Platform fee: ₹{(booking.total_amount * 0.3).toFixed(0)} | Teacher: ₹{(booking.total_amount * 0.7).toFixed(0)}
            </div>
          </div>

          {/* UPI */}
          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pay via UPI</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              {upiInfo.upi_id}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Open GPay / PhonePe / Paytm → Pay to this UPI ID → Take a screenshot → Upload below
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Transaction ID (Optional)</label>
              <input className="form-input" placeholder="Enter UPI transaction ID"
                value={txId} onChange={e => setTxId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Screenshot *</label>
              <div className="file-upload-area" onClick={() => document.getElementById('ss-upload').click()}
                style={{ borderStyle: file ? 'solid' : 'dashed', borderColor: file ? 'var(--green)' : 'var(--border)' }}>
                <input id="ss-upload" type="file" accept="image/*"
                  onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                {file ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 6 }}>✅</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Click to change</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <RiUploadLine size={28} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--text-muted)' }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Click to upload screenshot</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? <span className="spinner" /> : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
        <style>{`
          .file-upload-area {
            border: 2px dashed var(--border);
            border-radius: var(--radius-md);
            padding: 32px;
            cursor: pointer;
            transition: all var(--transition);
            background: var(--bg-tertiary);
          }
          .file-upload-area:hover { border-color: var(--accent); background: var(--accent-light); }
        `}</style>
      </div>
    </div>
  );
}

function FeedbackModal({ booking, onClose }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/feedback/', {
        booking_id: booking.id,
        teacher_id: booking.teacher_id,
        rating, comment
      });
      toast.success('Feedback submitted!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit feedback');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Rate Your Session</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <RiCloseLine size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>How was your session with {booking.teacher?.user?.name}?</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setRating(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 36, opacity: s <= rating ? 1 : 0.25, transition: 'all var(--transition)' }}>
                    ★
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginTop: 8 }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Review</label>
              <textarea className="form-textarea" placeholder="Share your experience..."
                value={comment} onChange={e => setComment(e.target.value)} rows={4} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
