import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Modal, Alert, Spinner, Icons } from '../components/Shared';
import { getProjects, createProject, updateProject, deleteProject, getUsers } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', description: '', deadline: '', members: [] };

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [p, u] = await Promise.all([getProjects(), getUsers()]);
      setProjects(p.data);
      setUsers(u.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (proj) => {
    setEditProject(proj);
    setForm({
      name: proj.name,
      description: proj.description || '',
      deadline: proj.deadline ? proj.deadline.slice(0, 10) : '',
      members: proj.members?.map(m => m._id || m) || [],
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editProject) {
        const { data } = await updateProject(editProject._id, form);
        setProjects(p => p.map(x => x._id === data._id ? data : x));
      } else {
        const { data } = await createProject(form);
        setProjects(p => [data, ...p]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? All associated tasks will also be removed.')) return;
    try {
      await deleteProject(id);
      setProjects(p => p.filter(x => x._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id],
    }));
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <div className="topbar">
          <span className="topbar-title">Projects</span>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>
              {Icons.plus} New Project
            </button>
          )}
        </div>
        <div className="page-content">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects yet</h3>
              {isAdmin && <p>Click "New Project" to create your first project.</p>}
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map(proj => (
                <div className="project-card" key={proj._id}>
                  <div className="project-name">{proj.name}</div>
                  <div className="project-desc">{proj.description || 'No description.'}</div>
                  <div className="project-meta">
                    {proj.deadline && (
                      <span className="meta-tag">
                        📅 {new Date(proj.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className="meta-tag">{proj.members?.length || 0} member(s)</span>
                  </div>
                  {proj.members?.length > 0 && (
                    <div className="members-list" style={{ marginTop: 10 }}>
                      {proj.members.slice(0, 4).map(m => (
                        <span className="member-chip" key={m._id || m}>
                          <span className="member-dot" />
                          {m.name || 'Unknown'}
                        </span>
                      ))}
                      {proj.members.length > 4 && (
                        <span className="member-chip">+{proj.members.length - 4}</span>
                      )}
                    </div>
                  )}
                  {isAdmin && (
                    <div className="project-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(proj)}>
                        {Icons.edit} Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj._id)}>
                        {Icons.trash} Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editProject ? 'Edit Project' : 'New Project'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <Spinner /> : (editProject ? 'Save Changes' : 'Create Project')}
              </button>
            </>
          }
        >
          {error && <Alert type="error">{error}</Alert>}
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Website Redesign" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this project about?" />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Members</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', padding: '4px 0' }}>
              {users.map(u => (
                <label key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {u.name} <span style={{ color: 'var(--muted)', fontSize: 11 }}>({u.role})</span>
                </label>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
