import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearAuth, setAuthToken } from '../services/api';
import { BRAND } from '../config/branding';

function normalizeTenant(tenant) {
  if (!tenant) return null;
  return {
    ...tenant,
    currency: BRAND.currency,
    country: tenant.country || BRAND.country,
    countryCode: tenant.countryCode || BRAND.countryCode,
    locale: tenant.locale || BRAND.locale,
    timezone: tenant.timezone || BRAND.timezone,
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tj_fms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then((data) => {
        setUser(data.user);
        setTenant(normalizeTenant(data.tenant));
      })
      .catch(() => clearAuth())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.token);
    setUser(data.user);
    setTenant(normalizeTenant(data.tenant));
    return data;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setTenant(null);
  };

  return (
    <AuthContext.Provider value={{ user, tenant, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
