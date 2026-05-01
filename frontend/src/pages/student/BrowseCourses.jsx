import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { RiSearchLine, RiBookOpenLine, RiUserLine, RiMoneyDollarCircleLine } from 'react-icons/ri';

const LEVELS = ['All', 'Primary', 'Middle', 'Higher'];
const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'];

export default function BrowseCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/courses/');
      setCourses(data);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  const enroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Enrollment failed');
    } finally { setEnrolling(null); }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === 'All' || c.level === level;
    return matchSearch && matchLevel;
  });

  return (
    <DashboardLayout title="Browse Courses">
      {/* Filters */}
      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
          <RiSearchLine size={16} />
          <input placeholder="Search courses, subjects..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          {LEVELS.map(l => (
            <button key={l} className={`pill ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="results-info mt-16 mb-24">
        <span className="text-muted">{filtered.length} courses found</span>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => <CourseCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <h3>No courses found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onEnroll={enroll} enrolling={enrolling === course.id} />
          ))}
        </div>
      )}

      <style>{`
        .filters-bar {
          display: flex; gap: 16px; flex-wrap: wrap;
          align-items: center;
        }
      `}</style>
    </DashboardLayout>
  );
}

function CourseCard({ course, onEnroll, enrolling }) {
  const colors = {
    Primary: { bg: 'var(--blue-light)', color: 'var(--blue)' },
    Middle: { bg: 'var(--green-light)', color: 'var(--green)' },
    Higher: { bg: 'var(--purple-light)', color: 'var(--purple)' },
  };
  const c = colors[course.level] || colors.Primary;

  return (
    <div className="course-card card">
      <div className="course-card-header" style={{ background: c.bg }}>
        <div className="course-card-icon" style={{ color: c.color }}>
          <RiBookOpenLine size={28} />
        </div>
        <span className="badge" style={{ background: 'white', color: c.color }}>{course.level}</span>
      </div>
      <div className="course-card-body card-body">
        <div className="course-card-subject">{course.subject}</div>
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-desc">{course.description || 'No description provided.'}</p>

        <div className="course-card-teacher">
          <div className="avatar avatar-sm" style={{ background: 'var(--accent)' }}>
            {course.teacher?.user?.name?.[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{course.teacher?.user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.teacher?.subject}</div>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="course-price">
            {course.price > 0 ? `₹${course.price}` : 'Free'}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onEnroll(course.id)} disabled={enrolling}>
            {enrolling ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Enroll Now'}
          </button>
        </div>
      </div>

      <style>{`
        .course-card { overflow: hidden; }
        .course-card-header {
          height: 100px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
        }
        .course-card-icon { opacity: 0.7; }
        .course-card-body { padding-top: 16px; }
        .course-card-subject {
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--text-muted); margin-bottom: 6px;
        }
        .course-card-title {
          font-size: 16px; font-weight: 700;
          margin-bottom: 8px; line-height: 1.3;
        }
        .course-card-desc {
          font-size: 13px; color: var(--text-secondary);
          line-height: 1.5; margin-bottom: 16px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .course-card-teacher {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 0; border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 16px;
        }
        .course-card-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .course-price { font-size: 18px; font-weight: 700; color: var(--accent); }
      `}</style>
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ height: 100, background: 'var(--bg-tertiary)' }} />
      <div style={{ padding: 20 }}>
        {[60, 100, 150, 80].map((w, i) => (
          <div key={i} style={{ height: 14, width: `${w}%`, background: 'var(--bg-tertiary)', borderRadius: 6, marginBottom: 10, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );
}
