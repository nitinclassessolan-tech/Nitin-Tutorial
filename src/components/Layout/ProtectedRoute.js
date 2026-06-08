import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, teacherOnly = false }) {
  const { currentUser, userProfile, loading, isTeacher } = useAuth();

  if (loading) {
    return (
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (teacherOnly && !isTeacher) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
