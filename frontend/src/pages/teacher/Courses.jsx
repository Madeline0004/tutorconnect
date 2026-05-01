import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCloseLine } from 'react-icons/ri';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/courses/my');
      setCourses(data);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <DashboardLayout title="My Courses">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Courses</h2>
          <p className="text-muted mt-8">{courses.length} courses created</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>
          <RiAddLine /> Create Course
        </button>
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3].map(i => <CourseSkeleton key={i} />)}</div>
      ) : courses.length === 0 ? (
        <div className="empty-state" style={{ padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h3>No courses yet</h3>
          <p>Create your first course to start teaching</p>
          <button className="btn btn-primary mt-16" onClick={() => setShowModal(true)}>Create Course</button>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map(c => (
            <div key={c.id} className="card">
              <div style={{ height: 8, background: 'var(--accent)', borderRadius: '12px 12px 0 0' }} />
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className={`badge badge-${c.level === 'Primary' ? 'blue' : c.level === 'Middle' ? 'green' : 'purple'}`}>{c.level}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditCourse(c); setShowModal(true); }}><RiEditLine /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteCourse(c.id)} style={{ color: 'var(--red)' }}><RiDeleteBinLine /></button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{c.subject}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description || 'No description'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                    {c.price > 0 ? `₹${c.price}` : 'Free'}
                  </span>
                  <span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CourseModal
          course={editCourse}
          onClose={() => { setShowModal(false); setEditCourse(null); }}
          onSave={() => { setShowModal(false); setEditCourse(null); fetchCourses(); }}
        />
      )}
    </DashboardLayout>
  );
}

function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    subject: course?.subject || '',
    level: course?.level || 'Primary',
    description: course?.description || '',
    price: course?.price || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (course) {
        await api.put(`/courses/${course.id}`, form);
        toast.success('Course updated!');
      } else {
        await api.post('/courses/', form);
        toast.success('Course created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save course');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{course ? 'Edit Course' : 'Create New Course'}</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
            <RiCloseLine size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input className="form-input" placeholder="e.g. Advanced Calculus"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-input" placeholder="e.g. Mathematics"
                  value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Level</label>
                <select className="form-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  <option>Primary</option><option>Middle</option><option>Higher</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What will students learn?"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">Course Price (₹)</label>
              <input className="form-input" type="number" placeholder="0 for free"
                value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (course ? 'Update Course' : 'Create Course')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CourseSkeleton() {
  return (
    <div className="card">
      <div style={{ height: 8, background: 'var(--bg-tertiary)' }} />
      <div style={{ padding: 20 }}>
        {[40, 80, 120, 60].map((w, i) => (
          <div key={i} style={{ height: 14, width: `${w}%`, background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );
}
