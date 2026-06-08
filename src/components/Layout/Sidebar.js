import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineLogout,

  HiOutlineUserCircle,
  HiOutlineCollection,
} from 'react-icons/hi';
import { getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './Sidebar.css';

export default function Sidebar() {
  const { userProfile, isTeacher, logout } = useAuth();
  const navigate = useNavigate();

  const studentLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/tests', icon: HiOutlineDocumentText, label: 'Test Reports' },
    { to: '/attendance', icon: HiOutlineCalendar, label: 'Attendance' },
    { to: '/courses', icon: HiOutlineAcademicCap, label: 'Courses' },
    { to: '/fees', icon: HiOutlineCurrencyRupee, label: 'Fee Details' },
    { to: '/profile', icon: HiOutlineUserCircle, label: 'My Profile' },
  ];

  const teacherLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/students', icon: HiOutlineUsers, label: 'All Students' },
    { to: '/attendance/mark', icon: HiOutlineCalendar, label: 'Attendance' },
    { to: '/tests/add', icon: HiOutlineDocumentText, label: 'Test Reports' },
    { to: '/courses/manage', icon: HiOutlineAcademicCap, label: 'Courses' },
    { to: '/fees/manage', icon: HiOutlineCurrencyRupee, label: 'Manage Fees' },
    { to: '/batches', icon: HiOutlineCollection, label: 'Batches' },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to log out');
    }
  }

  return (
    <aside className="sidebar" id="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span>NT</span>
        </div>
        <div className="sidebar-brand-text">
          <h3>Nitin Tutorial</h3>
          <p>Solan, H.P.</p>
        </div>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="avatar">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt={userProfile.name} />
          ) : (
            getInitials(userProfile?.name)
          )}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{userProfile?.name}</span>
          <span className={`badge ${isTeacher ? 'badge-info' : 'badge-success'}`}>
            {isTeacher ? 'Teacher' : 'Student'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              id={`sidebar-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="sidebar-link-icon" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link sidebar-logout" id="sidebar-logout">
          <HiOutlineLogout className="sidebar-link-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
