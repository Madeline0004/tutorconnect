import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
  RiSunLine, RiMoonLine, RiMenuLine, RiNotification3Line,
  RiBellLine, RiCheckLine
} from 'react-icons/ri';

export default function Topbar({ onMenuClick, title }) {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const ref = useRef();

  useEffect(() => {
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/notifications/');
      setNotifs(data);
    } catch {}
  };

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs(notifs.map(n => ({ ...n, is_read: true })));
  };

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick}>
          <RiMenuLine size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        {/* Theme toggle */}
        <button className="topbar-icon-btn" onClick={toggle} title="Toggle theme">
          {theme === 'light' ? <RiMoonLine size={18} /> : <RiSunLine size={18} />}
        </button>

        {/* Notifications */}
        <div className="notif-wrapper" ref={ref}>
          <button className="topbar-icon-btn notif-btn" onClick={() => setShowNotifs(v => !v)}>
            <RiBellLine size={18} />
            {unread > 0 && <span className="notif-count">{unread}</span>}
          </button>

          {showNotifs && (
            <div className="notif-panel">
              <div className="notif-header">
                <span>Notifications</span>
                {unread > 0 && (
                  <button className="notif-mark-all" onClick={markAll}>
                    <RiCheckLine size={14} /> Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifs.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : notifs.map(n => (
                  <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                    <div className="notif-dot-sm" style={{ opacity: n.is_read ? 0 : 1 }} />
                    <div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="avatar avatar-sm" style={{ background: 'var(--accent)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      <style>{`
        .topbar {
          position: fixed;
          top: 0; left: var(--sidebar-width); right: 0;
          height: var(--topbar-height);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 40;
          transition: left var(--transition);
        }
        @media (max-width: 768px) { .topbar { left: 0; } }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .topbar-right { display: flex; align-items: center; gap: 8px; }
        .topbar-title {
          font-family: var(--font-display);
          font-size: 17px; font-weight: 700;
          color: var(--text-primary);
        }
        .topbar-menu-btn {
          display: none;
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          background: var(--bg-hover);
          align-items: center; justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
        }
        @media (max-width: 768px) { .topbar-menu-btn { display: flex; } }
        .topbar-icon-btn {
          position: relative;
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-hover);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition);
        }
        .topbar-icon-btn:hover { color: var(--text-primary); background: var(--bg-tertiary); }
        .notif-count {
          position: absolute; top: -4px; right: -4px;
          width: 18px; height: 18px;
          background: var(--red);
          color: white;
          border-radius: 50%;
          font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--bg-secondary);
        }
        .notif-wrapper { position: relative; }
        .notif-panel {
          position: absolute;
          top: calc(100% + 8px); right: 0;
          width: 340px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
          animation: slideUp 0.2s ease;
        }
        .notif-header {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          font-size: 14px; font-weight: 600;
        }
        .notif-mark-all {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: var(--accent);
          background: none; border: none; cursor: pointer;
          font-family: var(--font-body);
        }
        .notif-list { max-height: 360px; overflow-y: auto; }
        .notif-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-light);
          transition: background var(--transition);
          cursor: default;
        }
        .notif-item.unread { background: var(--accent-light); }
        .notif-item:hover { background: var(--bg-hover); }
        .notif-dot-sm {
          width: 7px; height: 7px;
          border-radius: 50%; background: var(--accent);
          margin-top: 6px; flex-shrink: 0;
        }
        .notif-msg { font-size: 13px; color: var(--text-primary); line-height: 1.4; }
        .notif-time { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
        .notif-empty { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; }
      `}</style>
    </header>
  );
}
