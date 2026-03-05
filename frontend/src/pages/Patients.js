import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Layout from '../components/Layout';
import { StatusBadge } from '../components/Badges';
import { useToast } from '../components/Toast';

const WARDS = ['All', 'ICU', 'General', 'Maternity'];
const STATUSES = ['All', 'critical', 'stable', 'observation', 'discharge-ready'];
const COMMON_MEDS = ['Antibiotic IV', 'Oxygen 5L', 'Paracetamol', 'Painkiller', 'Saline IV', 'Morphine', 'Insulin', 'Aspirin'];

export default function Patients() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data.patients);
    } catch (err) { addToast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const filtered = patients.filter(p => {
    const matchSearch = !search ||
      p.bedNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());
    const matchWard = wardFilter === 'All' || p.ward === wardFilter;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchWard && matchStatus;
  });

  if (loading) return <Layout><div className="loading-center"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div className="breadcrumb">PATIENTS</div>
        <div className="flex items-center justify-between">
          <div>
            <h2>Patient Beds</h2>
            <p>{patients.length} total beds occupied</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Admit Patient</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search bed number or patient name..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="btn-icon" style={{ border: 'none', background: 'none', fontSize: '0.8rem' }} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className="form-control" style={{ width: 140 }} value={wardFilter} onChange={e => setWardFilter(e.target.value)}>
          {WARDS.map(w => <option key={w}>{w}</option>)}
        </select>
        <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛏</div>
          <p>No patients found</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bed</th><th>Patient</th><th>Age</th><th>Ward</th><th>Status</th>
                <th>Diagnosis</th><th>Medications</th><th>Updated</th><th>By</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td><span className="bed-num">{p.bedNumber}</span></td>
                  <td className="font-bold">{p.name}</td>
                  <td className="text-muted">{p.age}y</td>
                  <td className="text-muted">{p.ward}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td className="text-muted text-sm">{p.diagnosis || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200 }}>
                      {p.medications?.slice(0, 2).map(m => (
                        <span key={m} className="med-tag" style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>{m}</span>
                      ))}
                      {p.medications?.length > 2 && <span className="text-dim text-sm">+{p.medications.length - 2}</span>}
                    </div>
                  </td>
                  <td className="text-dim text-sm">{timeAgo(p.lastUpdated)}</td>
                  <td className="text-sm text-muted">{p.updatedBy?.name?.split(' ')[0] || '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/patients/${p.bedNumber}`)}>
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); load(); addToast('Patient admitted', 'success'); }} />}
    </Layout>
  );
}

function AddPatientModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    bedNumber: '', name: '', age: '', ward: 'ICU',
    status: 'stable', diagnosis: '', medications: [], notes: ''
  });
  const [medInput, setMedInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addMed = (med) => {
    if (med && !form.medications.includes(med)) {
      set('medications', [...form.medications, med]);
      setMedInput('');
    }
  };

  const removeMed = (med) => set('medications', form.medications.filter(m => m !== med));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await api.createPatient({ ...form, age: Number(form.age) });
      onAdded();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Admit New Patient</span>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Bed Number *</label>
            <input className="form-control" placeholder="B12" value={form.bedNumber} onChange={e => set('bedNumber', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input className="form-control" placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Age *</label>
            <input className="form-control" type="number" placeholder="45" value={form.age} onChange={e => set('age', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Ward *</label>
            <select className="form-control" value={form.ward} onChange={e => set('ward', e.target.value)}>
              <option>ICU</option><option>General</option><option>Maternity</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="stable">Stable</option>
              <option value="critical">Critical</option>
              <option value="observation">Observation</option>
              <option value="discharge-ready">Discharge Ready</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Diagnosis</label>
            <input className="form-control" placeholder="Pneumonia" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Medications</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-control" placeholder="Add medication..." value={medInput} onChange={e => setMedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMed(medInput)} style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm" onClick={() => addMed(medInput)}>Add</button>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {COMMON_MEDS.map(m => (
              <button key={m} className="btn btn-ghost btn-sm" onClick={() => addMed(m)} style={{ fontSize: '0.72rem' }}>{m}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {form.medications.map(m => (
              <span key={m} className="med-tag med-added" style={{ cursor: 'pointer' }} onClick={() => removeMed(m)}>{m} ✕</span>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={2} placeholder="Initial notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Admitting...' : 'Admit Patient'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
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
