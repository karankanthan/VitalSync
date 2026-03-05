import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { StatusBadge, ShiftBadge } from '../components/Badges';
import { useToast } from '../components/Toast';

export default function Handovers() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getHandovers();
      setHandovers(data.handovers);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleReview = async (id) => {
    try {
      await api.reviewHandover(id);
      addToast('Marked as reviewed', 'success');
      load();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const filtered = handovers.filter(h => {
    if (filter === 'unreviewed') return !h.isReviewed;
    if (filter === 'reviewed') return h.isReviewed;
    return true;
  });

  const pending = handovers.filter(h => !h.isReviewed).length;

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div className="breadcrumb">HANDOVERS</div>
        <h2>Shift Handovers</h2>
        <p>{pending} pending review · {handovers.length} total</p>
      </div>

      <div className="tabs">
        {[['all', 'All'], ['unreviewed', `Pending (${pending})`], ['reviewed', 'Reviewed']].map(([v, l]) => (
          <button key={v} className={`tab ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{filter === 'unreviewed' ? '✅' : '📋'}</div>
          <p>{filter === 'unreviewed' ? 'All caught up! No pending reviews.' : 'No handovers found.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(h => (
            <div key={h._id} className={`alert-card ${h.isReviewed ? 'green' : 'red'} fade-in`}>
              <div className="alert-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span className="alert-bed" style={{ color: h.isReviewed ? 'var(--green)' : 'var(--red)' }}>
                    {h.bedNumber}
                  </span>
                  {h.patient && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
                      {h.patient.name} · {h.patient.age}y · {h.patient.ward}
                    </span>
                  )}
                  {h.patient?.status && <StatusBadge status={h.patient.status} />}
                  <ShiftBadge shift={h.shiftStart} />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${h.bedNumber}`)}>View Bed →</button>
                  {!h.isReviewed && (
                    <button className="btn btn-success btn-sm" onClick={() => handleReview(h._id)}>✓ Mark Reviewed</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 8 }}>
                {h.changes?.status && (
                  <div className="change-item">
                    <span className="text-dim text-sm">Status:</span>
                    <span className="change-from">{h.changes.status.from}</span>
                    <span className="change-arrow">→</span>
                    <span className="change-to">{h.changes.status.to}</span>
                  </div>
                )}
                {h.changes?.medications?.added?.length > 0 && (
                  <div className="change-item">
                    <span className="text-dim text-sm">Meds added:</span>
                    {h.changes.medications.added.map(m => <span key={m} className="med-tag med-added">+{m}</span>)}
                  </div>
                )}
                {h.changes?.medications?.removed?.length > 0 && (
                  <div className="change-item">
                    <span className="text-dim text-sm">Meds removed:</span>
                    {h.changes.medications.removed.map(m => <span key={m} className="med-tag med-removed">-{m}</span>)}
                  </div>
                )}
                {h.instructions && (
                  <div className="change-item">
                    <span>📋</span>
                    <span style={{ color: 'var(--yellow)' }}>{h.instructions}</span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                Created by <strong style={{ color: 'var(--text2)' }}>{h.createdBy?.name}</strong> ({h.createdBy?.role}) · {timeAgo(h.createdAt)}
                {h.isReviewed && h.reviewedBy && (
                  <> · Reviewed by <strong style={{ color: 'var(--green)' }}>{h.reviewedBy.name}</strong> {timeAgo(h.reviewedAt)}</>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
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
