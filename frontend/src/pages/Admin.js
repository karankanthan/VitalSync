import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { RoleBadge } from '../components/Badges';
import { useToast } from '../components/Toast';

export default function Admin() {
  const { addToast } = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [showAddStaff, setShowAddStaff] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [a, s] = await Promise.all([api.getAnalytics(), api.getStaff()]);
      setAnalytics(a);
      setStaff(s.staff);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;

  const statusColors = {
    critical: 'var(--red)', stable: 'var(--green)',
    observation: 'var(--yellow)', 'discharge-ready': 'var(--orange)'
  };
  const wardColors = { ICU: 'var(--red)', General: 'var(--accent)', Maternity: 'var(--purple)' };
  const maxStatus = Math.max(...Object.values(analytics?.statusCounts || {}), 1);
  const maxWard = Math.max(...Object.values(analytics?.wardCounts || {}), 1);

  return (
    <Layout>
      <div className="page-header">
        <div className="breadcrumb">ADMIN</div>
        <h2>Admin Dashboard</h2>
        <p>Hospital analytics and staff management</p>
      </div>

      <div className="tabs">
        {[['overview', 'Overview'], ['staff', 'Staff Management']].map(([v, l]) => (
          <button key={v} className={`tab ${tab === v ? 'active' : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && analytics && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card danger">
              <div className="stat-icon">🚨</div>
              <div className="stat-val">{analytics.criticalCount}</div>
              <div className="stat-label">Critical Patients</div>
            </div>
            <div className="stat-card success">
              <div className="stat-icon">🏥</div>
              <div className="stat-val">{analytics.totalBeds}</div>
              <div className="stat-label">Occupied Beds</div>
            </div>
            <div className="stat-card warn">
              <div className="stat-icon">⏳</div>
              <div className="stat-val">{analytics.unreviewedHandovers}</div>
              <div className="stat-label">Unreviewed</div>
            </div>
            <div className="stat-card info">
              <div className="stat-icon">👥</div>
              <div className="stat-val">{analytics.totalStaff}</div>
              <div className="stat-label">Active Staff</div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
            {/* Status chart */}
            <div className="card">
              <div className="card-header"><span className="card-title">Beds by Status</span></div>
              <div className="bar-chart">
                {Object.entries(analytics.statusCounts || {}).map(([status, count]) => (
                  <div key={status} className="bar-row">
                    <div className="bar-label">{status}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / maxStatus) * 100}%`, background: statusColors[status] || 'var(--accent)' }} />
                    </div>
                    <div className="bar-value">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ward chart */}
            <div className="card">
              <div className="card-header"><span className="card-title">Beds by Ward</span></div>
              <div className="bar-chart">
                {Object.entries(analytics.wardCounts || {}).map(([ward, count]) => (
                  <div key={ward} className="bar-row">
                    <div className="bar-label">{ward}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / maxWard) * 100}%`, background: wardColors[ward] || 'var(--accent)' }} />
                    </div>
                    <div className="bar-value">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift activity */}
          <div className="card">
            <div className="card-header"><span className="card-title">Handovers by Shift</span></div>
            <div className="bar-chart">
              {Object.entries(analytics.shiftCounts || {}).map(([shift, count]) => {
                const shiftColors = { Morning: 'var(--yellow)', Afternoon: 'var(--orange)', Night: 'var(--purple)' };
                const max = Math.max(...Object.values(analytics.shiftCounts), 1);
                return (
                  <div key={shift} className="bar-row">
                    <div className="bar-label">{shift}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(count / max) * 100}%`, background: shiftColors[shift] }} />
                    </div>
                    <div className="bar-value">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {tab === 'staff' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setShowAddStaff(true)}>+ Add Staff</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Ward</th><th>Status</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s._id}>
                    <td className="font-bold">{s.name}</td>
                    <td className="text-muted text-sm">{s.email}</td>
                    <td><RoleBadge role={s.role} /></td>
                    <td className="text-muted">{s.ward}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: s.isActive ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {s.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="text-dim text-sm">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAddStaff && (
        <AddStaffModal
          onClose={() => setShowAddStaff(false)}
          onAdded={() => { setShowAddStaff(false); load(); addToast('Staff member added', 'success'); }}
        />
      )}
    </Layout>
  );
}

function AddStaffModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'nurse', ward: 'General' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await api.addStaff(form);
      onAdded();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Add Staff Member</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-control" placeholder="Dr. Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-control" type="email" placeholder="priya@hospital.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-control" type="password" placeholder="Temp password" value={form.password} onChange={e => set('password', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Ward</label>
          <select className="form-control" value={form.ward} onChange={e => set('ward', e.target.value)}>
            <option>ICU</option><option>General</option><option>Maternity</option><option>All</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Staff Member'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
