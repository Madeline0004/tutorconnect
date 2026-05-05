import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiSearchLine, RiShieldLine, RiForbidLine } from 'react-icons/ri';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleBlock = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/${isActive ? 'block' : 'unblock'}`);
      toast.success(isActive ? 'User blocked' : 'User unblocked');
      setUsers(us => us.map(u => u.id === userId ? { ...u, is_active: !isActive } : u));
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColors = { student: 'blue', teacher: 'orange', admin: 'purple' };

  return (
    <DashboardLayout title="Users">
      <div className="section-header">
        <div>
          <h2 className="section-title">Platform Users</h2>
          <p className="text-muted mt-8">{users.length} registered users</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
          <RiSearchLine size={16} />
          <input placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {['ALL', 'student', 'teacher'].map(r => (
            <button key={r} className={`pill ${roleFilter === r ? 'active' : ''}`}
              onClick={() => setRoleFilter(r)}>
              {r === 'ALL' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm"
                        style={{ background: user.role === 'student' ? 'var(--blue)' : user.role === 'teacher' ? 'var(--accent)' : 'var(--purple)' }}>
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user.email}</td>
                  <td>
                    <span className={`badge badge-${roleColors[user.role] || 'gray'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${user.is_active ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => toggleBlock(user.id, user.is_active)}
                      style={{ gap: 4 }}
                    >
                      {user.is_active ? <><RiForbidLine size={14} /> Block</> : <><RiShieldLine size={14} /> Unblock</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No users found</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
