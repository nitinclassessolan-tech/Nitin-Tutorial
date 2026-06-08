import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export default function FeeView() {
  const { currentUser } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {
    try {
      const q = query(
        collection(db, 'fees'),
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading fees:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="spinner-overlay"><div className="spinner"></div></div>;
  }

  const paidCount = fees.filter((f) => f.paid).length;
  const unpaidCount = fees.filter((f) => !f.paid).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1>💰 Fee Details</h1>
        <p>Your fee payment status</p>
      </div>

      {/* Summary */}
      {fees.length > 0 && (
        <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
              <HiOutlineCheckCircle />
            </div>
            <div className="stat-value">{paidCount}</div>
            <div className="stat-label">Paid</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
              <HiOutlineXCircle />
            </div>
            <div className="stat-value">{unpaidCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      {fees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h3>No Fee Records</h3>
          <p>Your fee details will appear here once added by the teacher.</p>
        </div>
      ) : (
        <div className="stagger-list">
          {fees.map((fee) => (
            <div className="list-card" key={fee.id} style={{
              borderLeft: `4px solid ${fee.paid ? 'var(--green-500)' : 'var(--danger)'}`,
            }}>
              <div className="list-card-content">
                <h4 style={{ fontSize: '0.9375rem' }}>{fee.month}</h4>
                <p>₹{fee.amount || '—'}</p>
              </div>
              <span className={`badge ${fee.paid ? 'badge-success' : 'badge-danger'}`}>
                {fee.paid ? '✓ PAID' : '✗ NOT PAID'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
