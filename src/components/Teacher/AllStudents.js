import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getInitials } from '../../utils/helpers';
import { HiOutlineSearch } from 'react-icons/hi';

export default function AllStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sSnap, bSnap] = await Promise.all([
        getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
        getDocs(collection(db, 'batches')),
      ]);
      setStudents(sSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setBatches(bSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = students.filter((s) => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
    const matchBatch = !filterBatch || (s.batchIds || []).includes(filterBatch);
    return matchSearch && matchBatch;
  });

  function getBatchNames(batchIds) {
    if (!batchIds || batchIds.length === 0) return '—';
    return batchIds.map((id) => {
      const batch = batches.find((b) => b.id === id);
      return batch ? batch.name : '';
    }).filter(Boolean).join(', ') || '—';
  }

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>👥 All Students</h1>
        <p>{students.length} students registered</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="students-search"
          />
        </div>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: 140, padding: '10px 14px' }}
          value={filterBatch}
          onChange={(e) => setFilterBatch(e.target.value)}
          id="students-filter-batch"
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Student List - Mobile cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No Students Found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="stagger-list">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="card"
              style={{ marginBottom: 10, cursor: 'pointer' }}
              onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
            >
              {/* Summary Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar">
                  {student.photoURL ? (
                    <img src={student.photoURL} alt={student.name} />
                  ) : (
                    getInitials(student.name)
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.9375rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.name}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.email}
                  </p>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>
                  {getBatchNames(student.batchIds)}
                </span>
              </div>

              {/* Expanded Details */}
              {expandedStudent === student.id && (
                <div style={{
                  marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--gray-100)',
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.8125rem',
                  animation: 'fadeInUp 0.2s ease-out',
                }}>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>DOB</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.dob || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Aadhaar</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.aadhaar || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Father</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.fathersName || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Mother</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.mothersName || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Guardian</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.guardianName || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Guardian Phone</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.guardianPhone || '—'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Address</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.address || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Previous Education</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.previousEducation || '—'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--gray-400)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.3px', fontWeight: 600 }}>Admission Date</span>
                    <p style={{ color: 'var(--gray-700)' }}>{student.dateOfAdmission || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
