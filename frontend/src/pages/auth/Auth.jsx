import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine, RiSunLine, RiMoonLine, RiArrowLeftLine } from 'react-icons/ri';

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login({ id: data.user_id, name: data.name, role: data.role }, data.access_token);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(`/${data.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout theme={theme} toggle={toggle}>
      <div className="auth-form-header">
        <h2>Welcome back</h2>
        <p>Sign in to your TutorConnect account</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
              style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign In'}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>
      <div className="auth-demo">
        <p className="text-muted text-center" style={{ marginBottom: 12, fontSize: 13 }}>Demo Accounts</p>
        <div className="demo-btns">
          {[
            { label: 'Admin Demo', email: 'admin@tc.com', pw: 'admin123' },
            { label: 'Teacher Demo', email: 'teacher@tc.com', pw: 'teacher123' },
            { label: 'Student Demo', email: 'student@tc.com', pw: 'student123' },
          ].map(d => (
            <button key={d.label} className="btn btn-ghost btn-sm"
              onClick={() => setForm({ email: d.email, password: d.pw })}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
    </AuthLayout>
  );
}

export function Register() {
  const [params] = useSearchParams();
  const defaultRole = params.get('role') || 'student';
  const [role, setRole] = useState(defaultRole);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    subject: '', level: 'Primary', hourly_rate: '', bio: ''
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = role === 'student' ? '/auth/register/student' : '/auth/register/teacher';
      const payload = role === 'student'
        ? { name: form.name, email: form.email, password: form.password, role: 'student' }
        : { name: form.name, email: form.email, password: form.password, subject: form.subject, level: form.level, hourly_rate: parseFloat(form.hourly_rate), bio: form.bio };
      const { data } = await api.post(endpoint, payload);
      login({ id: data.user_id, name: data.name, role: data.role }, data.access_token);
      toast.success(`Welcome to TutorConnect, ${data.name}!`);
      navigate(`/${data.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout theme={theme} toggle={toggle}>
      <div className="auth-form-header">
        <h2>Create your account</h2>
        <p>Join TutorConnect today</p>
      </div>

      {/* Role selector */}
      <div className="role-tabs">
        <button className={`role-tab ${role === 'student' ? 'active' : ''}`} onClick={() => setRole('student')}>
          🎓 Student
        </button>
        <button className={`role-tab ${role === 'teacher' ? 'active' : ''}`} onClick={() => setRole('teacher')}>
          👨‍🏫 Teacher
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" placeholder="Your full name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6}
              style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>

        {role === 'teacher' && (
          <>
            <div className="form-group">
              <label className="form-label">Subject Expertise</label>
              <input className="form-input" type="text" placeholder="e.g. Mathematics, Physics"
                value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Teaching Level</label>
                <select className="form-select" value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
                  <option>Primary</option>
                  <option>Middle</option>
                  <option>Higher</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hourly Rate (₹)</label>
                <input className="form-input" type="number" placeholder="500"
                  value={form.hourly_rate} onChange={e => setForm({...form, hourly_rate: e.target.value})} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bio (Optional)</label>
              <textarea className="form-textarea" placeholder="Tell students about your experience..."
                value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <span className="spinner" /> : `Create ${role === 'student' ? 'Student' : 'Teacher'} Account`}
        </button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}

function AuthLayout({ children, theme, toggle }) {
  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div className="auth-brand">
          <div className="home-logo-icon" style={{ width: 44, height: 44, background: 'white', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 16 }}>TC</div>
          <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>TutorConnect</span>
        </div>
        <div className="auth-sidebar-content">
          <h1>The Future of Learning is Here</h1>
          <p>Connect with expert teachers, book sessions, and learn on your own terms.</p>
          <div className="auth-features">
            {['Verified expert teachers', 'Flexible 1-on-1 sessions', 'Secure UPI payments', 'Real-time notifications'].map(f => (
              <div key={f} className="auth-feature">
                <div className="auth-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-topbar">
          <Link to="/" className="btn btn-ghost btn-sm"><RiArrowLeftLine /> Back to home</Link>
          <button className="theme-toggle" onClick={toggle} style={{ width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', background: 'var(--bg-hover)' }}>
            {theme === 'light' ? <RiMoonLine size={16} /> : <RiSunLine size={16} />}
          </button>
        </div>
        <div className="auth-card fade-in">{children}</div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
        }
        .auth-sidebar {
          width: 420px;
          background: linear-gradient(160deg, var(--accent) 0%, #c44010 100%);
          padding: 40px;
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh;
        }
        @media (max-width: 900px) { .auth-sidebar { display: none; } }
        .auth-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 60px; }
        .auth-sidebar-content h1 {
          font-family: var(--font-display);
          font-size: 34px; font-weight: 800;
          color: white; line-height: 1.2; margin-bottom: 16px;
        }
        .auth-sidebar-content p { color: rgba(255,255,255,0.75); font-size: 16px; margin-bottom: 40px; line-height: 1.6; }
        .auth-features { display: flex; flex-direction: column; gap: 16px; }
        .auth-feature {
          display: flex; align-items: center; gap: 12px;
          color: rgba(255,255,255,0.9); font-size: 15px;
        }
        .auth-feature-dot {
          width: 8px; height: 8px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%; flex-shrink: 0;
        }
        .auth-main {
          flex: 1;
          display: flex; flex-direction: column;
          background: var(--bg-primary);
          overflow-y: auto;
        }
        .auth-topbar {
          padding: 16px 40px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }
        .auth-card {
          max-width: 480px; width: 100%;
          margin: auto;
          padding: 40px;
        }
        .auth-form-header { margin-bottom: 32px; }
        .auth-form-header h2 { font-size: 26px; font-weight: 800; margin-bottom: 6px; }
        .auth-form-header p { color: var(--text-secondary); font-size: 15px; }
        .role-tabs {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 8px; margin-bottom: 24px;
          background: var(--bg-tertiary);
          padding: 4px;
          border-radius: var(--radius-md);
        }
        .role-tab {
          padding: 10px;
          border-radius: calc(var(--radius-md) - 4px);
          font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all var(--transition);
          color: var(--text-secondary);
          background: none; border: none;
          font-family: var(--font-body);
        }
        .role-tab.active { background: var(--bg-card); color: var(--accent); box-shadow: var(--shadow-sm); }
        .auth-divider {
          text-align: center; position: relative; margin: 20px 0;
          font-size: 13px; color: var(--text-muted);
        }
        .auth-divider::before {
          content: ''; position: absolute;
          left: 0; top: 50%; width: 100%; height: 1px;
          background: var(--border);
        }
        .auth-divider span {
          position: relative; background: var(--bg-primary); padding: 0 12px;
        }
        .demo-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .auth-switch {
          text-align: center; margin-top: 24px;
          font-size: 14px; color: var(--text-secondary);
        }
        .auth-switch a { color: var(--accent); font-weight: 600; }
      `}</style>
    </div>
  );
}
