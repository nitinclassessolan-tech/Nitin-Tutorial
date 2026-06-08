import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUserAdd } from 'react-icons/hi';

export default function BatchManage() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [timing, setTiming] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [bSnap, sSnap] = await Promise.all([
        getDocs(collection(db, 'batches')),
        getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
      ]);
      setBatches(bSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setStudents(sSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Batch name required'); return; }
    try {
      await addDoc(collection(db, 'batches'), {
        name: name.trim(),
        timing: timing.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success('Batch created!');
      setName('');
      setTiming('');
      loadData();
    } catch (err) {
      toast.error('Failed to create batch');
    }
  }

  async function handleDelete(batchId) {
    if (!window.confirm('Delete this batch?')) return;
    try {
      // Remove batchId from all students' batchIds arrays
      const batchStudents = students.filter((s) => (s.batchIds || []).includes(batchId));
      for (const s of batchStudents) {
        await updateDoc(doc(db, 'users', s.id), { batchIds: arrayRemove(batchId) });
      }
      await deleteDoc(doc(db, 'batches', batchId));
      toast.success('Batch deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  }

  async function handleAssign(batchId) {
    if (!assignStudentId) { toast.error('Select a student'); return; }
    try {
      await updateDoc(doc(db, 'users', assignStudentId), {
        batchIds: arrayUnion(batchId),
      });
      toast.success('Student assigned to batch!');
      setShowAssign(null);
      setAssignStudentId('');
      loadData();
    } catch (err) {
      toast.error('Failed to assign');
    }
  }

  async function handleRemoveFromBatch(batchId, studentId) {
    try {
      await updateDoc(doc(db, 'users', studentId), {
        batchIds: arrayRemove(batchId),
      });
      toast.success('Student removed from batch');
      loadData();
    } catch (err) {
      toast.error('Failed to remove');
    }
  }

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📦 Manage Batches</h1>
        <p>Create batches and assign students</p>
      </div>

      {/* Add Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 16 }}>Create New Batch</h3>
        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Batch Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Morning Batch A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="batch-name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Timing</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 8:00 AM - 10:00 AM"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                id="batch-timing"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" id="batch-submit">
            <HiOutlinePlus /> Create Batch
          </button>
        </form>
      </div>

      {/* Batch List */}
      {batches.length === 0 ? (
        <div className="empty-state" style={{ padding: 24 }}>
          <p>No batches created yet.</p>
        </div>
      ) : (
        <div className="stagger-list">
          {batches.map((batch) => {
            const batchStudents = students.filter((s) => (s.batchIds || []).includes(batch.id));
            return (
              <div className="card" key={batch.id} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <h4>{batch.name}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{batch.timing || 'No timing set'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon btn-sm" style={{ color: 'var(--green-600)' }} onClick={() => setShowAssign(showAssign === batch.id ? null : batch.id)} title="Assign student">
                      <HiOutlineUserAdd />
                    </button>
                    <button className="btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(batch.id)} title="Delete batch">
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 6 }}>
                  Students ({batchStudents.length})
                </div>
                {batchStudents.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {batchStudents.map((s) => (
                      <span key={s.id} className="badge badge-info" style={{ cursor: 'pointer' }} onClick={() => handleRemoveFromBatch(batch.id, s.id)} title="Click to remove">
                        {s.name} ✕
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>No students assigned</p>
                )}

                {showAssign === batch.id && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <select className="form-input" style={{ flex: 1, padding: '8px 12px', fontSize: '0.875rem' }} value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)}>
                      <option value="">Select student</option>
                      {students
                        .filter((s) => !(s.batchIds || []).includes(batch.id))
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleAssign(batch.id)}>
                      Assign
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
