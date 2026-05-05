import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="page-wrapper">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
