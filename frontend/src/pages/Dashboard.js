import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { StatusBadge } from '../components/Badges';
import { useToast } from '../components/Toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState({ patients: [], unreviewedHandovers: [] });
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [changes, patients] = await Promise.all([
        api.getChanges(),
        api.getPatients()
      ]);
      setData(changes);
      setAllPatients(patients.patients);
    } catch (err) {
      addToast(err.message, 'error');
    } finally { setLoading(false); }
  };

  const handleReview = async (id) => {
    try {
      await api.reviewHandover(id);
      addToast('Handover marked as reviewed', 'success');
      load();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const statusCounts = allPatients.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const updatedBeds = data.patients || [];
  const unreviewed = data.unreviewedHandovers || [];
  const stableBeds = allPatients.filter(p => p.status === 'stable' || p.status === 'discharge-ready');

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div className="breadcrumb">DASHBOARD</div>
        <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p>Here's your shift overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className={`stat-card ${statusCounts.critical > 0 ? 'danger pulse' : ''}`}>
          <div className="stat-icon">🚨</div>
          <div className="stat-val">{statusCounts.critical || 0}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-icon">👁</div>
          <div className="stat-val">{statusCounts.observation || 0}</div>
          <div className="stat-label">Observation</div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-val">{statusCounts.stable || 0}</div>
          <div className="stat-label">Stable</div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">🔴</div>
          <div className="stat-val">{updatedBeds.length}</div>
          <div className="stat-label">Updated This Shift</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-val">{unreviewed.length}</div>
          <div className="stat-label">Pending Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-val">{allPatients.length}</div>
          <div className="stat-label">Total Beds</div>
        </div>
      </div>

      {/* RED SECTION — Updated / Unreviewed */}
      <div className="section-divider red">
        <div className="section-divider-line"></div>
        <div className="section-divider-label">🔴 Requires Attention ({unreviewed.length})</div>
        <div className="section-divider-line"></div>
      </div>

      {unreviewed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>All handovers reviewed. No pending items.</p>
        </div>
      ) : (
        unreviewed.map(h => (
          <HandoverCard key={h._id} handover={h} onReview={handleReview} onView={() => navigate(`/patients/${h.bedNumber}`)} />
        ))
      )}

      {/* GREEN SECTION — Stable */}
      <div className="section-divider green" style={{ marginTop: 32 }}>
        <div className="section-divider-line"></div>
        <div className="section-divider-label">✅ No Changes ({stableBeds.length})</div>
        <div className="section-divider-line"></div>
      </div>

      {stableBeds.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🛏</div><p>No stable patients.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bed</th><th>Patient</th><th>Age</th><th>Ward</th><th>Status</th><th>Last Updated</th><th></th>
              </tr>
            </thead>
            <tbody>
              {stableBeds.map(p => (
                <tr key={p._id}>
                  <td><span className="bed-num">{p.bedNumber}</span></td>
                  <td className="font-bold">{p.name}</td>
                  <td className="text-muted">{p.age}y</td>
                  <td className="text-muted">{p.ward}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="text-dim text-sm">{timeAgo(p.lastUpdated)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${p.bedNumber}`)}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

function HandoverCard({ handover, onReview, onView }) {
  const c = handover.changes || {};
  return (
    <div className="alert-card red fade-in">
      <div className="alert-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="alert-bed">{handover.bedNumber}</span>
          {handover.patient && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
              {handover.patient.name} · {handover.patient.age}y
            </span>
          )}
          <StatusBadge status={handover.patient?.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={onView}>View Bed →</button>
          <button className="btn btn-success btn-sm" onClick={() => onReview(handover._id)}>✓ Mark Reviewed</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {c.status && (
          <div className="change-item">
            <span>Status:</span>
            <span className="change-from">{c.status.from}</span>
            <span className="change-arrow">→</span>
            <span className="change-to">{c.status.to}</span>
          </div>
        )}
        {c.medications?.added?.length > 0 && (
          <div className="change-item">
            <span>Added:</span>
            {c.medications.added.map(m => <span key={m} className="med-tag med-added">+{m}</span>)}
          </div>
        )}
        {c.medications?.removed?.length > 0 && (
          <div className="change-item">
            <span>Removed:</span>
            {c.medications.removed.map(m => <span key={m} className="med-tag med-removed">-{m}</span>)}
          </div>
        )}
        {handover.instructions && (
          <div className="change-item">
            <span>📋</span>
            <span style={{ color: 'var(--yellow)' }}>{handover.instructions}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text3)' }}>
        By {handover.createdBy?.name} ({handover.createdBy?.role}) · {timeAgo(handover.createdAt)} · <span className={`shift-badge shift-${handover.shiftStart}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{handover.shiftStart}</span>
      </div>
    </div>
  );
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
