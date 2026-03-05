import React, { createContext, useContext, useState, useEffect } from 'react';
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vs_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (token) {
    API.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const data = res.data;
        if (data.user) setUser(data.user);
        else logout();
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  } else {
    setLoading(false);
  }
}, [token]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    const data = res.data;
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('vs_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('vs_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
