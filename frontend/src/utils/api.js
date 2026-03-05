const BASE = '/api';

function getToken() {
  return localStorage.getItem('vs_token');
}

function headers(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...extra
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: headers(options.headers)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/auth/me'),
  seed: () => request('/auth/seed', { method: 'POST' }),

  // Patients
  getPatients: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/patients${q ? '?' + q : ''}`);
  },
  getPatient: (bed) => request(`/patients/${bed}`),
  getChanges: () => request('/patients/changes'),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (bed, data) =>
    request(`/patients/${bed}/update`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (bed) => request(`/patients/${bed}`, { method: 'DELETE' }),

  // Handovers
  getHandovers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/handovers${q ? '?' + q : ''}`);
  },
  getUnreviewed: () => request('/handovers/unreviewed'),
  reviewHandover: (id) => request(`/handovers/${id}/review`, { method: 'POST' }),

  // Admin
  getAnalytics: () => request('/admin/analytics'),
  getStaff: () => request('/admin/staff'),
  addStaff: (data) => request('/admin/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id, data) =>
    request(`/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};
