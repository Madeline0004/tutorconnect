import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  RiSunLine, RiMoonLine, RiArrowRightLine,
  RiStarFill, RiCheckLine, RiGraduationCapLine,
  RiTeamLine, RiCalendarCheckLine, RiShieldCheckLine
} from 'react-icons/ri';

const features = [
  { icon: RiGraduationCapLine, color: '#2563eb', title: 'Expert Teachers', desc: 'Learn from verified educators with subject expertise across all levels.' },
  { icon: RiCalendarCheckLine, color: '#e85d26', title: 'Flexible Scheduling', desc: 'Book sessions that fit your calendar with real-time availability management.' },
  { icon: RiTeamLine, color: '#16a34a', title: '1-on-1 Sessions', desc: 'Personalized doubt-solving sessions tailored to your learning pace.' },
  { icon: RiShieldCheckLine, color: '#7c3aed', title: 'Secure Payments', desc: 'Safe UPI-based payments with admin verification for peace of mind.' },
];

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics'];

const stats = [
  { value: '500+', label: 'Expert Teachers' },
  { value: '10,000+', label: 'Students Enrolled' },
  { value: '50,000+', label: 'Sessions Completed' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function Home() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  const dashPath = user ? `/${user.role}/dashboard` : null;

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <div className="home-logo">
            <div className="home-logo-icon">TC</div>
            <span>TutorConnect</span>
          </div>
          <div className="home-nav-links">
            <a href="#features">Features</a>
            <a href="#subjects">Subjects</a>
            {user ? (
              <Link to={dashPath} className="btn btn-primary btn-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
            <button className="theme-toggle" onClick={toggle}>
              {theme === 'light' ? <RiMoonLine size={16} /> : <RiSunLine size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">
            <RiStarFill size={12} /> #1 EdTech Marketplace in India
          </div>
          <h1 className="hero-title">
            Learn From<br />
            <span className="hero-accent">Expert Teachers</span><br />
            On Demand
          </h1>
          <p className="hero-desc">
            Connect with verified educators for structured courses and instant doubt-solving sessions.
            Book, learn, and grow — all in one place.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to={dashPath} className="btn btn-primary btn-lg">
                Open Dashboard <RiArrowRightLine />
              </Link>
            ) : (
              <>
                <Link to="/register?role=student" className="btn btn-primary btn-lg">
                  Start Learning <RiArrowRightLine />
                </Link>
                <Link to="/register?role=teacher" className="btn btn-secondary btn-lg">
                  Teach on TutorConnect
                </Link>
              </>
            )}
          </div>
          <div className="hero-checks">
            {['Free to join', 'Verified teachers', 'Secure payments', '24/7 support'].map(c => (
              <span key={c}><RiCheckLine size={14} /> {c}</span>
            ))}
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual">
          <div className="hero-card hc-1">
            <div className="avatar" style={{ background: '#e85d26' }}>A</div>
            <div>
              <div className="hc-name">Ananya Sharma</div>
              <div className="hc-role">Physics · Higher Secondary</div>
            </div>
            <div className="hc-rate">₹500/hr</div>
          </div>
          <div className="hero-card hc-2">
            <div style={{ fontSize: 28 }}>📅</div>
            <div>
              <div className="hc-name">Session Confirmed!</div>
              <div className="hc-role">Tomorrow, 4:00 PM · 2 hours</div>
            </div>
          </div>
          <div className="hero-card hc-3">
            <div className="stars">{'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#fbbf24' }}>{s}</span>)}</div>
            <div className="hc-name" style={{ marginTop: 6 }}>"Best teacher ever!"</div>
            <div className="hc-role">— Riya K., Student</div>
          </div>
          <div className="hero-blob" />
        </div>
      </section>

      {/* Stats */}
      <section className="home-stats">
        {stats.map(s => (
          <div key={s.label} className="home-stat">
            <div className="home-stat-value">{s.value}</div>
            <div className="home-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="home-section" id="features">
        <div className="container">
          <div className="home-section-header">
            <h2>Everything you need to learn & teach</h2>
            <p>A complete platform built for the modern education ecosystem</p>
          </div>
          <div className="grid-4">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color + '15', color: f.color }}>
                  <f.icon size={24} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="home-section home-section-alt" id="subjects">
        <div className="container">
          <div className="home-section-header">
            <h2>Browse by Subject</h2>
            <p>Find expert teachers across all subjects and levels</p>
          </div>
          <div className="subjects-grid">
            {subjects.map((s, i) => (
              <Link key={s} to={`/login`} className="subject-pill" style={{ '--delay': `${i * 0.05}s` }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header">
            <h2>How TutorConnect Works</h2>
            <p>Simple steps to start learning</p>
          </div>
          <div className="steps-grid">
            {[
              { n: '01', title: 'Create Account', desc: 'Sign up as a student or teacher in under 2 minutes.' },
              { n: '02', title: 'Browse & Book', desc: 'Find your ideal teacher and request a session slot.' },
              { n: '03', title: 'Teacher Confirms', desc: 'Teacher reviews and accepts your booking request.' },
              { n: '04', title: 'Pay & Learn', desc: 'Complete payment via UPI and attend your session.' },
            ].map(step => (
              <div key={step.n} className="step-card">
                <div className="step-number">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta-section">
        <div className="container">
          <div className="home-cta-card">
            <h2>Ready to start your learning journey?</h2>
            <p>Join thousands of students already learning on TutorConnect</p>
            <div className="hero-cta" style={{ justifyContent: 'center' }}>
              <Link to="/register?role=student" className="btn btn-primary btn-lg">
                Join as Student <RiArrowRightLine />
              </Link>
              <Link to="/register?role=teacher" className="btn btn-secondary btn-lg">
                Join as Teacher
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="home-logo">
            <div className="home-logo-icon">TC</div>
            <span>TutorConnect</span>
          </div>
          <p className="text-muted mt-8">© 2024 TutorConnect. Empowering education, one session at a time.</p>
        </div>
      </footer>

      <style>{`
        .home { min-height: 100vh; }
        .home-nav {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 100;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
        }
        .home-nav-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 14px 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .home-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-display); font-weight: 700; font-size: 17px;
        }
        .home-logo-icon {
          width: 34px; height: 34px; background: var(--accent);
          border-radius: 9px; display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 13px;
        }
        .home-nav-links {
          display: flex; align-items: center; gap: 16px;
        }
        .home-nav-links a:not(.btn) {
          font-size: 14px; color: var(--text-secondary); font-weight: 500;
          text-decoration: none; transition: color var(--transition);
        }
        .home-nav-links a:not(.btn):hover { color: var(--text-primary); }
        .theme-toggle {
          width: 34px; height: 34px;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          cursor: pointer; background: var(--bg-hover);
          transition: all var(--transition);
        }
        .theme-toggle:hover { color: var(--text-primary); }

        .hero {
          min-height: 100vh;
          padding-top: 80px;
          display: flex; align-items: center;
          position: relative;
          overflow: hidden;
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 24px; padding-right: 24px;
          gap: 48px;
        }
        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
          right: -100px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }
        .hero-content { flex: 1; max-width: 560px; z-index: 1; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          background: var(--accent-light);
          color: var(--accent);
          border-radius: var(--radius-full);
          font-size: 12px; font-weight: 600;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(36px, 5vw, 60px);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
        }
        .hero-accent { color: var(--accent); }
        .hero-desc {
          font-size: 17px; color: var(--text-secondary);
          line-height: 1.7; margin-bottom: 32px;
        }
        .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
        .hero-checks {
          display: flex; gap: 20px; flex-wrap: wrap;
          font-size: 13px; color: var(--text-muted);
        }
        .hero-checks span { display: flex; align-items: center; gap: 5px; }

        .hero-visual {
          flex: 1; position: relative; height: 480px;
          max-width: 440px;
        }
        .hero-blob {
          position: absolute; width: 340px; height: 340px;
          background: var(--accent-soft);
          border-radius: 60% 40% 70% 30% / 50% 60% 40% 60%;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          z-index: 0;
          animation: blobAnim 8s ease-in-out infinite;
        }
        @keyframes blobAnim {
          0%, 100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 60%; }
          50% { border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%; }
        }
        .hero-card {
          position: absolute; z-index: 1;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          box-shadow: var(--shadow-lg);
          display: flex; align-items: center; gap: 12px;
        }
        .hc-1 { top: 60px; left: 0; min-width: 280px; }
        .hc-2 { bottom: 100px; right: 0; min-width: 240px; }
        .hc-3 { bottom: 20px; left: 20px; min-width: 200px; flex-direction: column; align-items: flex-start; }
        .hc-name { font-size: 14px; font-weight: 600; }
        .hc-role { font-size: 12px; color: var(--text-muted); }
        .hc-rate {
          margin-left: auto; font-size: 15px; font-weight: 700;
          color: var(--accent); white-space: nowrap;
        }

        .home-stats {
          display: flex; justify-content: center; gap: 0;
          background: var(--accent);
          padding: 32px 24px;
          flex-wrap: wrap;
        }
        .home-stat {
          text-align: center;
          padding: 8px 40px;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        .home-stat:last-child { border-right: none; }
        .home-stat-value {
          font-family: var(--font-display);
          font-size: 32px; font-weight: 800;
          color: white;
        }
        .home-stat-label { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 2px; }

        .home-section { padding: 80px 0; }
        .home-section-alt { background: var(--bg-secondary); }
        .home-section-header {
          text-align: center; margin-bottom: 48px;
        }
        .home-section-header h2 {
          font-size: clamp(24px, 3.5vw, 36px);
          margin-bottom: 12px;
        }
        .home-section-header p { color: var(--text-secondary); font-size: 16px; }

        .feature-card {
          padding: 28px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all var(--transition);
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        .feature-icon {
          width: 52px; height: 52px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .feature-card h3 { font-size: 17px; margin-bottom: 8px; }
        .feature-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

        .subjects-grid {
          display: flex; flex-wrap: wrap; gap: 12px;
          justify-content: center;
        }
        .subject-pill {
          padding: 10px 24px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 14px; font-weight: 500;
          color: var(--text-secondary);
          background: var(--bg-card);
          transition: all var(--transition);
          cursor: pointer;
          animation: fadeIn 0.4s ease var(--delay) both;
          text-decoration: none;
        }
        .subject-pill:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-light);
        }

        .steps-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        @media (max-width: 768px) { .steps-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .steps-grid { grid-template-columns: 1fr; } }
        .step-card {
          padding: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .step-number {
          font-family: var(--font-mono);
          font-size: 36px; font-weight: 700;
          color: var(--accent); opacity: 0.25;
          margin-bottom: 12px;
        }
        .step-card h3 { font-size: 16px; margin-bottom: 8px; }
        .step-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

        .home-cta-section { padding: 80px 0; }
        .home-cta-card {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          border-radius: var(--radius-xl);
          padding: 64px;
          text-align: center;
        }
        .home-cta-card h2 { color: white; font-size: 32px; margin-bottom: 12px; }
        .home-cta-card p { color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 32px; }

        .home-footer {
          border-top: 1px solid var(--border);
          padding: 32px 24px;
          text-align: center;
        }
        .home-footer .home-logo { justify-content: center; }

        @media (max-width: 768px) {
          .hero { flex-direction: column; min-height: auto; padding-top: 100px; padding-bottom: 60px; }
          .hero-visual { display: none; }
          .home-stats { gap: 0; }
          .home-stat { padding: 8px 20px; }
          .home-stat-value { font-size: 24px; }
          .home-cta-card { padding: 40px 24px; }
        }
      `}</style>
    </div>
  );
}
