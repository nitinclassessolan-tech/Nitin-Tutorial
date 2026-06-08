import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDate } from '../../utils/helpers';
// Icons used inline

export default function TestReportList() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const q = query(
        collection(db, 'testReports'),
        where('studentId', '==', currentUser.uid),
        orderBy('testDate', 'desc')
      );
      const snap = await getDocs(q);
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading test reports:', err);
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
        <h1>📝 Test Reports</h1>
        <p>View your test results and performance</p>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <h3>No Test Reports Yet</h3>
          <p>Your test results will appear here once your teacher adds them.</p>
        </div>
      ) : (
        <div className="stagger-list">
          {reports.map((report) => {
            const pct = report.totalMarks
              ? Math.round((report.obtainedMarks / report.totalMarks) * 100)
              : 0;
            const colorClass = pct >= 60 ? 'high' : pct >= 40 ? 'medium' : 'low';
            return (
              <div className="card" key={report.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: 2 }}>{report.subjectName}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {formatDate(report.testDate)}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: pct >= 60 ? 'var(--green-700)' : pct >= 40 ? '#b45309' : 'var(--danger)',
                  }}>
                    {pct}%
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                    {report.obtainedMarks} / {report.totalMarks}
                  </span>
                  <span className={`badge ${pct >= 60 ? 'badge-success' : pct >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                    {pct >= 60 ? 'Pass' : pct >= 40 ? 'Average' : 'Needs Work'}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
