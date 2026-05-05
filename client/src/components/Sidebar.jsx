import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Icons } from './Shared.jsx';

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { path: '/projects', label: 'Projects', icon: Icons.projects },
    { path: '/tasks', label: 'Tasks', icon: Icons.tasks },
  ];

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        ⬡ <span>TaskFlow</span>
      </div>

      <nav>
        {links.map(({ path, label, icon }) => (
          <button
            key={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={logoutUser}>
          {Icons.logout} Logout
        </button>
      </div>
    </aside>
  );
}
