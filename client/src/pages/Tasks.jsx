import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import { Modal, Alert, Spinner, Icons } from '../components/Shared.jsx';
import { getTasks, createTask, updateTask, deleteTask, getProjects, getUsers } from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { title: '', description: '', assignedTo: '', project: '', status: 'Todo', deadline: '' };
const STATUSES = ['Todo', 'In Progress', 'Completed'];

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const [t, p, u] = await Promise.all([getTasks(), getProjects(), getUsers()]);
      setTasks(t.data);
      setProjects(p.data);
      setUsers(u.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTask(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      project: task.project?._id || task.project || '',
      status: task.status,
      deadline: task.deadline ? task.deadline.slice(0, 10) : '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Task title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editTask) {
        const payload = isAdmin ? form : { status: form.status };
        const { data } = await updateTask(editTask._id, payload);
        setTasks(t => t.map(x => x._id === data._id ? data : x));
      } else {
        const { data } = await createTask(form);
        setTasks(t => [data, ...t]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(t => t.filter(x => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleQuickStatus = async (task, status) => {
    try {
      const { data } = await updateTask(task._id, { status });
      setTasks(t => t.map(x => x._id === data._id ? data : x));
    } catch {}
  };

  const now = new Date();
  const filtered = tasks.filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterProject && (t.project?._id || t.project) !== filterProject) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topbar">
          <span className="topbar-title">Tasks</span>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              {Icons.plus} New Task
            </button>
          )}
        </div>
        <div className="page-content">
          <div className="filter-bar">
            <input
              className="form-input"
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {(filterStatus || filterProject || search) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilterStatus(''); setFilterProject(''); setSearch(''); }}>
                Clear
              </button>
            )}
          </div>

          <div className="card">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <h3>No tasks found</h3>
                <p>{isAdmin ? 'Create a task to get started.' : 'No tasks assigned to you yet.'}</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Project</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Deadline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(task => {
                      const isOverdue = task.deadline && new Date(task.deadline) < now && task.status !== 'Completed';
                      return (
                        <tr key={task._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{task.title}</div>
                            {task.description && (
                              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                                {task.description.length > 60 ? task.description.slice(0, 60) + '…' : task.description}
                              </div>
                            )}
                          </td>
                          <td style={{ color: 'var(--muted)' }}>{task.project?.name || '—'}</td>
                          <td style={{ color: 'var(--muted)' }}>{task.assignedTo?.name || '—'}</td>
                          <td>
                            <select
                              className="form-select"
                              style={{ padding: '4px 8px', fontSize: 11, width: 'auto' }}
                              value={task.status}
                              onChange={e => handleQuickStatus(task, e.target.value)}
                              disabled={!isAdmin && task.assignedTo?._id !== user?._id}
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: isOverdue ? 'var(--danger)' : 'var(--muted)' }}>
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                              {isOverdue && ' ⚠'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)} title="Edit">
                                {Icons.edit}
                              </button>
                              {isAdmin && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task._id)} title="Delete">
                                  {Icons.trash}
                                </button>
                              )}
                            </div>
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

      {showModal && (
        <Modal
          title={editTask ? (isAdmin ? 'Edit Task' : 'Update Status') : 'New Task'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <Spinner /> : (editTask ? 'Save Changes' : 'Create Task')}
              </button>
            </>
          }
        >
          {error && <Alert type="error">{error}</Alert>}

          {(!editTask || isAdmin) && (
            <>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Design homepage mockup" disabled={editTask && !isAdmin} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details…" disabled={editTask && !isAdmin} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select className="form-select" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} disabled={editTask && !isAdmin}>
                    <option value="">Select project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select className="form-select" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} disabled={editTask && !isAdmin}>
                    <option value="">Select user</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} disabled={editTask && !isAdmin} />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
