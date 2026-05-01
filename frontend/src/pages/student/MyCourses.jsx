import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { RiBookOpenLine, RiArrowRightLine } from 'react-icons/ri';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/enrolled/my')
      .then(r => setCourses(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Courses">
      <div className="section-header">
        <div>
          <h2 className="section-title">Enrolled Courses</h2>
          <p className="text-muted mt-8">{courses.length} courses</p>
        </div>
        <Link to="/student/courses" className="btn btn-primary">Browse More Courses</Link>
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3].map(i => <div key={i} className="card" style={{ height: 200, background: 'var(--bg-tertiary)', animation: 'pulse 1.5s infinite' }} />)}</div>
      ) : courses.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state" style={{ padding: '80px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
              <h3>No courses yet</h3>
              <p>Enroll in courses to start your learning journey</p>
              <Link to="/student/courses" className="btn btn-primary mt-16">
                Browse Courses <RiArrowRightLine />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {courses.map(course => {
            const colors = {
              Primary: { bg: 'var(--blue-light)', color: 'var(--blue)' },
              Middle: { bg: 'var(--green-light)', color: 'var(--green)' },
              Higher: { bg: 'var(--purple-light)', color: 'var(--purple)' },
            };
            const c = colors[course.level] || colors.Primary;
            return (
              <div key={course.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 90, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
                  <RiBookOpenLine size={28} style={{ color: c.color, opacity: 0.7 }} />
                  <span className="badge" style={{ background: 'white', color: c.color }}>{course.level}</span>
                </div>
                <div className="card-body" style={{ paddingTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{course.subject}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{course.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'No description'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
                    <div className="avatar avatar-sm" style={{ background: 'var(--accent)', flexShrink: 0 }}>
                      {course.teacher?.user?.name?.[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{course.teacher?.user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{course.teacher?.subject}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
