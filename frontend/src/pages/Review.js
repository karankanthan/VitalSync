import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { StatusBadge } from '../components/Badges';
import { useToast } from '../components/Toast';

export default function Review() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getUnreviewed();
      setHandovers(data.handovers);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const handleReview = async (id) => {
    try {
      await api.reviewHandover(id);
      addToast('Reviewed ✓', 'success');
      load();
    } catch (err) { addToast(err.message, 'error'); }
  };

  const handleReviewAll = async () => {
    if (!window.confirm(`Mark all ${handovers.length} handovers as reviewed?`)) return;
    try {
      await Promise.all(handovers.map(h => api.reviewHandover(h._id)));
      addToast(`${handovers.length} handovers reviewed`, 'success');
      load();
    } catch (err) { addToast(err.message, 'error'); }
  };

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div className="breadcrumb">REVIEWS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Pending Reviews</h2>
            <p>{handovers.length} handovers awaiting your review</p>
          </div>
          {handovers.length > 1 && (
            <button className="btn btn-success" onClick={handleReviewAll}>
              ✓ Review All ({handovers.length})
            </button>
          )}
        </div>
      </div>

      {handovers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 8 }}>All caught up!</h3>
          <p className="text-muted">No pending handover reviews. Great work.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {handovers.map((h, i) => (
            <div key={h._id} className="card fade-in" style={{ border: '1px solid var(--red-border)', background: 'var(--red-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--red)' }}>
                      {h.bedNumber}
                    </span>
                    {h.patient && (
                      <>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{h.patient.name}</span>
                        <span className="text-muted text-sm">{h.patient.age}y · {h.patient.ward}</span>
                        <StatusBadge status={h.patient.status} />
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
                    {h.changes?.status && (
                      <div style={{ background: 'var(--surface)', padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div className="text-dim" style={{ fontSize: '0.68rem', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status Change</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--red)', textDecoration: 'line-through', opacity: 0.7 }}>{h.changes.status.from}</span>
                          <span className="text-dim">→</span>
                          <span style={{ color: 'var(--green)', fontWeight: 700 }}>{h.changes.status.to}</span>
                        </div>
                      </div>
                    )}
                    {(h.changes?.medications?.added?.length > 0 || h.changes?.medications?.removed?.length > 0) && (
                      <div style={{ background: 'var(--surface)', padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div className="text-dim" style={{ fontSize: '0.68rem', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medication Changes</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {h.changes.medications.added?.map(m => <span key={m} className="med-tag med-added">+{m}</span>)}
                          {h.changes.medications.removed?.map(m => <span key={m} className="med-tag med-removed">-{m}</span>)}
                        </div>
                      </div>
                    )}
                  </div>

                  {h.instructions && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--yellow)', marginBottom: 8 }}>
                      📋 <strong>Instructions:</strong> {h.instructions}
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>
                    From {h.createdBy?.name} ({h.createdBy?.role}) · {timeAgo(h.createdAt)} · Shift: {h.shiftStart}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn btn-success" onClick={() => handleReview(h._id)}>
                    ✓ Mark Reviewed
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${h.bedNumber}`)}>
                    View Bed →
                  </button>
                </div>
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
