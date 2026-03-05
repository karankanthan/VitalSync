import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getCurrentShift() {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return { label: 'Morning', cls: 'shift-Morning' };
  if (h >= 14 && h < 22) return { label: 'Afternoon', cls: 'shift-Afternoon' };
  return { label: 'Night', cls: 'shift-Night' };
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const shift = getCurrentShift();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: '⬛', label: 'Dashboard' },
    { to: '/patients', icon: '🛏', label: 'Patient Beds' },
    { to: '/handovers', icon: '🔄', label: 'Handovers' },
    { to: '/review', icon: '✅', label: 'Reviews' },
    ...(user?.role === 'admin' ? [{ to: '/admin', icon: '⚙️', label: 'Admin' }] : [])
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">💉</div>
        <h1>VitalSync</h1>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <span className={`shift-badge ${shift.cls}`}>
          ◉ {shift.label} Shift
        </span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role} · {user?.ward}</div>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Logout">↩</button>
      </div>
    </aside>
  );
}
