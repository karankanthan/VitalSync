import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { StatusBadge, ShiftBadge } from '../components/Badges';
import { useToast } from '../components/Toast';

const COMMON_MEDS = ['Antibiotic IV', 'Oxygen 5L', 'Paracetamol', 'Painkiller', 'Saline IV', 'Morphine', 'Insulin', 'Aspirin'];

export default function PatientDetail() {
  const { bed } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  // Update form state
  const [newStatus, setNewStatus] = useState('');
  const [addMeds, setAddMeds] = useState([]);
  const [removeMeds, setRemoveMeds] = useState([]);
  const [notes, setNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medInput, setMedInput] = useState('');

  useEffect(() => { load(); }, [bed]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getPatient(bed);
      setPatient(data.patient);
      setHandovers(data.handovers || []);
      setNewStatus(data.patient.status);
    } catch (err) { addToast(err.message, 'error'); navigate('/patients'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.updatePatient(bed, {
        status: newStatus,
        addMeds,
        removeMeds,
        notes,
        instructions
      });
      addToast('Patient updated & handover created', 'success');
      setShowUpdate(false);
      setAddMeds([]); setRemoveMeds([]); setNotes(''); setInstructions('');
      load();
    } catch (err) { addToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDischarge = async () => {
    if (!window.confirm(`Discharge patient from bed ${bed}? This cannot be undone.`)) return;
    try {
      await api.deletePatient(bed);
      addToast(`Patient discharged from bed ${bed}`, 'success');
      navigate('/patients');
    } catch (err) { addToast(err.message, 'error'); }
  };

  const toggleRemoveMed = (med) => {
    setRemoveMeds(prev => prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]);
  };

  const addCustomMed = (med) => {
    if (med && !addMeds.includes(med)) {
      setAddMeds(prev => [...prev, med]);
      setMedInput('');
    }
  };

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;
  if (!patient) return null;

  const statusColor = { critical: 'var(--red)', stable: 'var(--green)', observation: 'var(--yellow)', 'discharge-ready': 'var(--orange)' };

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <span className="breadcrumb">PATIENTS / {bed}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <span className="bed-num" style={{ fontSize: '1.8rem' }}>{patient.bedNumber}</span>
            <StatusBadge status={patient.status} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{patient.name}</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            {patient.age} years · {patient.ward} Ward · {patient.diagnosis || 'No diagnosis recorded'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowUpdate(!showUpdate)}>
            {showUpdate ? '✕ Cancel' : '✏️ Quick Update'}
          </button>
          <button className="btn btn-danger" onClick={handleDischarge}>Discharge</button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Left column */}
        <div>
          {/* Current info */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Current Status</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                Updated {timeAgo(patient.lastUpdated)}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="text-dim text-sm" style={{ marginBottom: 4 }}>STATUS</div>
                <div style={{ fontFamily: 'var(--font-mono)', color: statusColor[patient.status], fontWeight: 700, fontSize: '1rem' }}>
                  {patient.status?.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-dim text-sm" style={{ marginBottom: 4 }}>WARD</div>
                <div style={{ fontWeight: 600 }}>{patient.ward}</div>
              </div>
              <div>
                <div className="text-dim text-sm" style={{ marginBottom: 4 }}>UPDATED BY</div>
                <div style={{ fontWeight: 600 }}>{patient.updatedBy?.name || '—'}</div>
              </div>
              <div>
                <div className="text-dim text-sm" style={{ marginBottom: 4 }}>ROLE</div>
                <div style={{ color: 'var(--accent)' }}>{patient.updatedBy?.role || '—'}</div>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Medications ({patient.medications?.length || 0})</span>
            </div>
            {patient.medications?.length === 0 ? (
              <div className="text-dim text-sm">No medications recorded</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {patient.medications?.map(m => (
                  <span key={m} className="med-tag" style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', padding: '5px 12px', fontSize: '0.82rem' }}>
                    💊 {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {patient.notes && (
            <div className="card">
              <div className="card-header"><span className="card-title">Notes</span></div>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', lineHeight: 1.6 }}>{patient.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Quick Update Panel */}
          {showUpdate && (
            <div className="card" style={{ marginBottom: 20, border: '1px solid var(--accent)', background: 'rgba(0,212,255,0.03)' }}>
              <div className="card-header">
                <span className="card-title text-accent">⚡ Quick Update</span>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="stable">Stable</option>
                  <option value="critical">Critical</option>
                  <option value="observation">Observation</option>
                  <option value="discharge-ready">Discharge Ready</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Remove Medications (click to toggle)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {patient.medications?.map(m => (
                    <span key={m} className={`med-tag ${removeMeds.includes(m) ? 'med-removed' : ''}`}
                      style={{ cursor: 'pointer', border: '1px solid var(--border)', background: removeMeds.includes(m) ? 'var(--red-bg)' : 'var(--surface2)', color: removeMeds.includes(m) ? 'var(--red)' : 'var(--text2)', padding: '5px 12px' }}
                      onClick={() => toggleRemoveMed(m)}>
                      {removeMeds.includes(m) ? '✕ ' : ''}{m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Add Medications</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="form-control" style={{ flex: 1 }} placeholder="Type medication..." value={medInput}
                    onChange={e => setMedInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomMed(medInput)} />
                  <button className="btn btn-ghost btn-sm" onClick={() => addCustomMed(medInput)}>Add</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {COMMON_MEDS.filter(m => !patient.medications?.includes(m)).map(m => (
                    <button key={m} className="btn btn-ghost btn-sm" style={{ fontSize: '0.72rem' }} onClick={() => addCustomMed(m)}>{m}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {addMeds.map(m => (
                    <span key={m} className="med-tag med-added" style={{ cursor: 'pointer' }} onClick={() => setAddMeds(p => p.filter(x => x !== m))}>+{m} ✕</span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Handover Instructions</label>
                <textarea className="form-control" rows={2} placeholder="Instructions for next shift..."
                  value={instructions} onChange={e => setInstructions(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Notes Update</label>
                <textarea className="form-control" rows={2} placeholder="Update clinical notes..."
                  value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <button className="btn btn-primary" onClick={handleUpdate} disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Saving...' : '💾 Save & Create Handover'}
              </button>
            </div>
          )}

          {/* Handover History */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Handover History</span>
              <span className="text-dim text-sm">{handovers.length} entries</span>
            </div>
            {handovers.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <div className="empty-icon">📋</div>
                <p>No handovers yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {handovers.map(h => (
                  <div key={h._id} style={{ padding: '12px', borderRadius: 'var(--radius)', background: 'var(--bg3)', border: `1px solid ${h.isReviewed ? 'var(--green-border)' : 'var(--red-border)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <ShiftBadge shift={h.shiftStart} />
                      <span style={{ fontSize: '0.72rem', color: h.isReviewed ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {h.isReviewed ? '✓ Reviewed' : '⏳ Pending'}
                      </span>
                    </div>
                    {h.changes?.status && (
                      <div className="change-item" style={{ marginBottom: 4 }}>
                        <span className="text-dim text-sm">Status:</span>
                        <span className="change-from">{h.changes.status.from}</span>
                        <span className="change-arrow">→</span>
                        <span className="change-to">{h.changes.status.to}</span>
                      </div>
                    )}
                    {h.instructions && <div style={{ fontSize: '0.8rem', color: 'var(--yellow)', marginTop: 6 }}>📋 {h.instructions}</div>}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 8 }}>
                      By {h.createdBy?.name} · {timeAgo(h.createdAt)}
                      {h.isReviewed && ` · Reviewed by ${h.reviewedBy?.name}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
