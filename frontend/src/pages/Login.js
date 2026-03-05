import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seed();
      setError('');
      alert('Demo accounts created! Try logging in.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSeeding(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@vitalsync.com', password: 'admin123' },
      doctor: { email: 'rajesh@vitalsync.com', password: 'doctor123' },
      nurse: { email: 'priya@vitalsync.com', password: 'nurse123' }
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-header">
          <div className="login-logo">💉</div>
          <h1>VitalSync</h1>
          <p>Hospital Handover Management System</p>
        </div>

        <div className="login-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Sign In</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-control"
                placeholder="doctor@hospital.com"
                value={email} onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-control"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <div className="login-demo" style={{ marginTop: 20 }}>
            <p>Demo Accounts</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('admin')}>Admin</button>
              <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('doctor')}>Doctor</button>
              <button className="btn btn-ghost btn-sm" onClick={() => fillDemo('nurse')}>Nurse</button>
            </div>
            <div className="demo-cred">admin@vitalsync.com / <span>admin123</span></div>
            <div className="demo-cred">rajesh@vitalsync.com / <span>doctor123</span></div>
            <div className="demo-cred">priya@vitalsync.com / <span>nurse123</span></div>
            <button
              className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
              onClick={handleSeed} disabled={seeding}
            >
              {seeding ? 'Seeding...' : '⚡ Seed Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
