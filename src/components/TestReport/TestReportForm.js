import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function TestReportForm() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentReports(selectedStudent);
    }
  }, [selectedStudent]);

  async function loadStudents() {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadStudentReports(studentId) {
    setLoadingReports(true);
    try {
      const q = query(
        collection(db, 'testReports'),
        where('studentId', '==', studentId),
        orderBy('testDate', 'desc')
      );
      const snap = await getDocs(q);
      setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedStudent || !subjectName || !testDate || obtainedMarks === '' || totalMarks === '') {
      toast.error('Please fill all fields');
      return;
    }
    if (Number(obtainedMarks) > Number(totalMarks)) {
      toast.error('Obtained marks cannot exceed total marks');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'testReports'), {
        studentId: selectedStudent,
        subjectName: subjectName.trim(),
        testDate,
        obtainedMarks: Number(obtainedMarks),
        totalMarks: Number(totalMarks),
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });
      toast.success('Test report added!');
      setSubjectName('');
      setObtainedMarks('');
      setTotalMarks('');
      loadStudentReports(selectedStudent);
    } catch (err) {
      toast.error('Failed to add report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(reportId) {
    if (!window.confirm('Delete this test report?')) return;
    try {
      await deleteDoc(doc(db, 'testReports', reportId));
      toast.success('Report deleted');
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      toast.error('Failed to delete');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📝 Test Reports</h1>
        <p>Add and manage student test results</p>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Add New Test Report</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select
              className="form-input"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              id="test-student"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Mathematics"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                id="test-subject"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Test Date</label>
              <input
                type="date"
                className="form-input"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                id="test-date"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Obtained Marks</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 75"
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(e.target.value)}
                min="0"
                id="test-obtained"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 100"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                min="1"
                id="test-total"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} id="test-submit">
            <HiOutlinePlus /> {loading ? 'Adding...' : 'Add Report'}
          </button>
        </form>
      </div>

      {/* Existing Reports */}
      {selectedStudent && (
        <>
          <div className="section-title">
            <h2>Reports for {students.find((s) => s.id === selectedStudent)?.name}</h2>
          </div>
          {loadingReports ? (
            <div className="spinner-overlay" style={{ minHeight: 100 }}>
              <div className="spinner"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No reports yet for this student</p>
            </div>
          ) : (
            <div className="stagger-list">
              {reports.map((r) => {
                const pct = r.totalMarks ? Math.round((r.obtainedMarks / r.totalMarks) * 100) : 0;
                return (
                  <div className="list-card" key={r.id}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: pct >= 60 ? 'var(--green-100)' : pct >= 40 ? 'var(--warning-light)' : 'var(--danger-light)',
                      color: pct >= 60 ? 'var(--green-700)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)',
                      fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                    }}>
                      {pct}%
                    </div>
                    <div className="list-card-content">
                      <h4>{r.subjectName}</h4>
                      <p>{r.obtainedMarks}/{r.totalMarks} • {formatDate(r.testDate)}</p>
                    </div>
                    <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(r.id)} title="Delete">
                      <HiOutlineTrash />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
