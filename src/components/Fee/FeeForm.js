import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function FeeForm() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) loadStudentFees(selectedStudent);
  }, [selectedStudent]);

  async function loadStudents() {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snap = await getDocs(q);
    setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  async function loadStudentFees(studentId) {
    try {
      const q = query(
        collection(db, 'fees'),
        where('studentId', '==', studentId)
      );
      const snap = await getDocs(q);
      setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!selectedStudent || !month.trim()) {
      toast.error('Select student and enter month');
      return;
    }
    setAdding(true);
    try {
      await addDoc(collection(db, 'fees'), {
        studentId: selectedStudent,
        month: month.trim(),
        amount: Number(amount) || 0,
        paid: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Fee record added');
      setMonth('');
      setAmount('');
      loadStudentFees(selectedStudent);
    } catch (err) {
      toast.error('Failed to add fee');
    } finally {
      setAdding(false);
    }
  }

  async function togglePaid(feeId, currentPaid) {
    try {
      await updateDoc(doc(db, 'fees', feeId), {
        paid: !currentPaid,
        updatedAt: serverTimestamp(),
      });
      toast.success(currentPaid ? 'Marked as unpaid' : 'Marked as paid');
      setFees((prev) =>
        prev.map((f) => (f.id === feeId ? { ...f, paid: !currentPaid } : f))
      );
    } catch (err) {
      toast.error('Failed to update');
    }
  }

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>💰 Manage Fees</h1>
        <p>Add fee records and update payment status</p>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Add Fee Entry</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label className="form-label">Student</label>
            <select
              className="form-input"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              id="fee-student"
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Month / Period</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., June 2026"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                id="fee-month"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                id="fee-amount"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={adding} id="fee-submit">
            <HiOutlinePlus /> {adding ? 'Adding...' : 'Add Fee Entry'}
          </button>
        </form>
      </div>

      {/* Fee Records */}
      {selectedStudent && (
        <>
          <div className="section-title">
            <h2>Fee Records for {students.find((s) => s.id === selectedStudent)?.name}</h2>
          </div>
          {fees.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>No fee records for this student</p>
            </div>
          ) : (
            <div className="stagger-list">
              {fees.map((fee) => (
                <div className="list-card" key={fee.id} style={{
                  borderLeft: `4px solid ${fee.paid ? 'var(--green-500)' : 'var(--danger)'}`,
                }}>
                  <div className="list-card-content">
                    <h4>{fee.month}</h4>
                    <p>₹{fee.amount || '—'}</p>
                  </div>
                  <button
                    className={`btn btn-sm ${fee.paid ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => togglePaid(fee.id, fee.paid)}
                    style={{ minWidth: 100 }}
                  >
                    {fee.paid ? (
                      <><HiOutlineXCircle /> Unpaid</>
                    ) : (
                      <><HiOutlineCheckCircle /> Mark Paid</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
