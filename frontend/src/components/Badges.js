export function StatusBadge({ status }) {
  const map = {
    critical: { cls: 'badge-critical', dot: '●', label: 'Critical' },
    stable: { cls: 'badge-stable', dot: '●', label: 'Stable' },
    observation: { cls: 'badge-observation', dot: '●', label: 'Observation' },
    'discharge-ready': { cls: 'badge-discharge', dot: '●', label: 'Discharge Ready' }
  };
  const s = map[status] || { cls: '', dot: '●', label: status };
  return (
    <span className={`badge ${s.cls}`}>
      {s.dot} {s.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  return <span className={`badge badge-role-${role}`}>{role}</span>;
}

export function ShiftBadge({ shift }) {
  return <span className={`shift-badge shift-${shift}`}>{shift}</span>;
}
