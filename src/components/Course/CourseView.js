import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export default function CourseView() {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, [userProfile]);

  async function loadCourses() {
    try {
      const courseIds = userProfile?.courseIds || [];
      if (courseIds.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }
      const courseList = [];
      for (const cid of courseIds) {
        const snap = await getDoc(doc(db, 'courses', cid));
        if (snap.exists()) {
          courseList.push({ id: snap.id, ...snap.data() });
        }
      }
      setCourses(courseList);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🎓 My Courses</h1>
        <p>Courses you are enrolled in</p>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No Courses Yet</h3>
          <p>You will see your enrolled courses here once the teacher assigns them.</p>
        </div>
      ) : (
        <div className="stagger-list">
          {courses.map((course) => (
            <div className="card card-green" key={course.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--green-100)', color: 'var(--green-700)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}>
                  <HiOutlineAcademicCap />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{course.name}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    {course.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
