import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiDashboardLine, RiBookOpenLine, RiCalendarLine,
  RiMoneyDollarCircleLine, RiStarLine, RiUserLine,
  RiShieldLine, RiLogoutBoxLine, RiGraduationCapLine,
  RiTeamLine, RiBarChartLine, RiNotificationLine
} from 'react-icons/ri';

const studentLinks = [
  { to: '/student/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/student/courses', icon: RiBookOpenLine, label: 'Browse Courses' },
  { to: '/student/my-courses', icon: RiGraduationCapLine, label: 'My Courses' },
  { to: '/student/teachers', icon: RiTeamLine, label: 'Find Teachers' },
  { to: '/student/bookings', icon: RiCalendarLine, label: 'My Bookings' },
  { to: '/student/payments', icon: RiMoneyDollarCircleLine, label: 'Payments' },
  { to: '/student/profile', icon: RiUserLine, label: 'Profile' },
];

const teacherLinks = [
  { to: '/teacher/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/teacher/courses', icon: RiBookOpenLine, label: 'My Courses' },
  { to: '/teacher/slots', icon: RiCalendarLine, label: 'Availability' },
  { to: '/teacher/bookings', icon: RiCalendarLine, label: 'Bookings' },
  { to: '/teacher/earnings', icon: RiMoneyDollarCircleLine, label: 'Earnings' },
  { to: '/teacher/profile', icon: RiUserLine, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/admin/users', icon: RiTeamLine, label: 'Users' },
  { to: '/admin/teachers', icon: RiShieldLine, label: 'Teacher Approvals' },
  { to: '/admin/bookings', icon: RiCalendarLine, label: 'Bookings' },
  { to: '/admin/payments', icon: RiMoneyDollarCircleLine, label: 'Payments' },
  { to: '/admin/analytics', icon: RiBarChartLine, label: 'Analytics' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'student' ? studentLinks
    : user?.role === 'teacher' ? teacherLinks
    : adminLinks;

  const roleColor = user?.role === 'student' ? 'var(--blue)'
    : user?.role === 'teacher' ? 'var(--accent)'
    : 'var(--purple)';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">TC</div>
          <span className="sidebar-logo-text">TutorConnect</span>
        </div>

        {/* Role badge */}
        <div className="sidebar-role" style={{ borderColor: roleColor + '40', background: roleColor + '10' }}>
          <div className="avatar avatar-sm" style={{ background: roleColor }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="sidebar-role-name">{user?.name}</div>
            <div className="sidebar-role-badge" style={{ color: roleColor }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <RiLogoutBoxLine size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0; top: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
          transition: transform var(--transition);
          overflow-y: auto;
        }
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 49;
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block; }
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-logo-icon {
          width: 36px; height: 36px;
          background: var(--accent);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800;
          font-family: var(--font-display);
          font-size: 14px;
        }
        .sidebar-logo-text {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 16px;
          color: var(--text-primary);
        }
        .sidebar-role {
          margin: 16px;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid;
          display: flex; align-items: center; gap: 10px;
        }
        .sidebar-role-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .sidebar-role-badge { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .sidebar-nav {
          flex: 1;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition);
          text-decoration: none;
        }
        .sidebar-link:hover { background: var(--bg-hover); color: var(--text-primary); }
        .sidebar-link.active {
          background: var(--accent-light);
          color: var(--accent);
          font-weight: 600;
        }
        .sidebar-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 24px;
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: color var(--transition);
          background: none; border-left: none; border-right: none; border-bottom: none;
          width: 100%;
          text-align: left;
        }
        .sidebar-logout:hover { color: var(--red); }
      `}</style>
    </>
  );
}
