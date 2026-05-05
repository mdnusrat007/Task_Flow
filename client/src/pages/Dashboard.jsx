import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { getTasks, getProjects } from '../utils/api';
import { LoadingPage, Badge } from '../components/Shared.jsx';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getTasks()])
      .then(([p, t]) => {
        setProjects(p.data);
        setTasks(t.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area"><LoadingPage /></div>
    </div>
  );

  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const todo = tasks.filter(t => t.status === 'Todo').length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'Completed').length;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topbar">
          <span className="topbar-title">Dashboard</span>
        </div>
        <div className="page-content">
          <div className="stats-grid">
            <div className="stat-card accent">
              <div className="stat-label">Projects</div>
              <div className="stat-value">{projects.length}</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{total}</div>
            </div>
            <div className="stat-card success">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completed}</div>
            </div>
            <div className="stat-card warn">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{inProgress}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Todo</div>
              <div className="stat-value" style={{ color: 'var(--muted)' }}>{todo}</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-label">Overdue</div>
              <div className="stat-value">{overdue}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Tasks</span>
            </div>
            {recentTasks.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks yet</h3>
                <p>Create a project and add tasks to get started.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Project</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(task => {
                      const isOverdue = task.deadline && new Date(task.deadline) < now && task.status !== 'Completed';
                      return (
                        <tr key={task._id}>
                          <td style={{ fontWeight: 600 }}>{task.title}</td>
                          <td style={{ color: 'var(--muted)' }}>{task.project?.name || '—'}</td>
                          <td style={{ color: 'var(--muted)' }}>{task.assignedTo?.name || '—'}</td>
                          <td><Badge status={task.status} /></td>
                          <td>
                            {task.deadline ? (
                              <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
                                {new Date(task.deadline).toLocaleDateString()}
                                {isOverdue && ' ⚠'}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
