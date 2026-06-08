import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { formatDate, getAttendancePercentage } from '../../utils/helpers';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function AttendanceView() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [presentCount, setPresentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      // Load batches for name lookup
      const batchSnap = await getDocs(collection(db, 'batches'));
      const batchMap = {};
      batchSnap.docs.forEach((d) => { batchMap[d.id] = d.data().name; });
      setBatches(batchMap);

      // Load attendance records
      const q = query(
        collection(db, 'attendance'),
        where('studentId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecords(data);
      setTotalCount(data.length);
      setPresentCount(data.filter((r) => r.present).length);
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  }

  const percentage = getAttendancePercentage(presentCount, totalCount);
  const pctColor = percentage >= 75 ? 'var(--green-700)' : percentage >= 50 ? '#b45309' : 'var(--danger)';

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📅 Attendance</h1>
        <p>Your attendance record</p>
      </div>

      {/* Percentage Card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 24, padding: 24 }}>
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: `4px solid ${pctColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          background: percentage >= 75 ? 'var(--green-50)' : percentage >= 50 ? 'var(--warning-light)' : 'var(--danger-light)',
        }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)', color: pctColor }}>
            {percentage}%
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          {presentCount} present out of {totalCount} classes
        </p>
        <div className="progress-bar" style={{ marginTop: 12 }}>
          <div
            className={`progress-fill ${percentage >= 75 ? '' : percentage >= 50 ? 'medium' : 'low'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Records */}
      {records.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No Attendance Records</h3>
          <p>Your attendance will appear here once marked by the teacher.</p>
        </div>
      ) : (
        <div className="stagger-list">
          {records.map((record) => (
            <div className="list-card" key={record.id}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: record.present ? 'var(--green-100)' : 'var(--danger-light)',
                color: record.present ? 'var(--green-700)' : 'var(--danger)',
                fontSize: '1.25rem', flexShrink: 0,
              }}>
                {record.present ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />}
              </div>
              <div className="list-card-content">
                <h4>{formatDate(record.date)}</h4>
                <p>
                  {record.present ? 'Present' : 'Absent'}
                  {record.batchId && batches[record.batchId] && (
                    <span style={{ color: 'var(--gray-400)', marginLeft: 6 }}>
                      • {batches[record.batchId]}
                    </span>
                  )}
                </p>
              </div>
              <span className={`badge ${record.present ? 'badge-success' : 'badge-danger'}`}>
                {record.present ? 'P' : 'A'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
