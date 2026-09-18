import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Helper to get tab-isolated token
export const getStoredAuthToken = () => {
  try {
    const isAdminRoute = (typeof window !== 'undefined' && window.location.hash) 
      ? window.location.hash.toLowerCase().includes('admin')
      : false;

    if (isAdminRoute) {
      // In admin route, check tab-specific admin session
      const adminTok = sessionStorage.getItem('alansar_admin_token') || sessionStorage.getItem('nexus_token') || sessionStorage.getItem('alansar_token');
      if (adminTok) return adminTok;
      return null;
    }

    // In customer storefront route, check tab session first (per-tab isolation)
    const tabTok = sessionStorage.getItem('nexus_token') || sessionStorage.getItem('alansar_token');
    if (tabTok) return tabTok;

    // If customer was remembered in localStorage, load it into this tab
    const custTok = localStorage.getItem('nexus_customer_token');
    if (custTok) {
      sessionStorage.setItem('nexus_token', custTok);
      return custTok;
    }
  } catch (e) {}
  return null;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredAuthToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global cleanup of legacy cross-account application flags
  useEffect(() => {
    try {
      localStorage.removeItem('alansar_qard_applied_global');
      localStorage.removeItem('alansar_vip_applied_global');
      localStorage.removeItem('alansar_qard_applied_guest');
      localStorage.removeItem('alansar_vip_applied_guest');
    } catch (e) {}
  }, []);

  const refreshUser = async () => {
    const activeToken = token || getStoredAuthToken();
    if (!activeToken) return null;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
    return null;
  };

  // Initialize and verify stored token
  useEffect(() => {
    async function checkAuth() {
      const activeToken = token || getStoredAuthToken();
      if (!activeToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${activeToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  const login = async (identifier, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);

      // Store in THIS TAB's sessionStorage so tabs stay completely independent
      try {
        sessionStorage.setItem('nexus_token', data.token);
        sessionStorage.setItem('alansar_token', data.token);

        if (data.user?.role === 'admin') {
          sessionStorage.setItem('alansar_admin_token', data.token);
          // Ensure admin token never bleeds into global storefront localStorage
          localStorage.removeItem('nexus_token');
          localStorage.removeItem('alansar_token');
        } else {
          sessionStorage.removeItem('alansar_admin_token');
          // Normal customer: save to tab, and optionally persistent customer key
          localStorage.setItem('nexus_customer_token', data.token);
        }
      } catch (e) {}

      return data;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);

      try {
        sessionStorage.setItem('nexus_token', data.token);
        sessionStorage.setItem('alansar_token', data.token);
        localStorage.setItem('nexus_customer_token', data.token);
      } catch (e) {}

      return data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    const wasAdmin = user?.role === 'admin';
    setUser(null);
    setToken(null);

    try {
      // Clear THIS TAB's storage only
      sessionStorage.removeItem('nexus_token');
      sessionStorage.removeItem('alansar_token');
      sessionStorage.removeItem('alansar_admin_token');

      // If customer logged out from this tab, clear customer persistent token
      if (!wasAdmin) {
        localStorage.removeItem('nexus_customer_token');
        localStorage.removeItem('nexus_token');
      }
      // If admin logged out, leave customer localStorage untouched so storefront tabs stay logged in!
      
      localStorage.removeItem('alansar_qard_applied_global');
      localStorage.removeItem('alansar_vip_applied_global');
      localStorage.removeItem('alansar_qard_applied_guest');
      localStorage.removeItem('alansar_vip_applied_guest');
    } catch (e) {}
  };

  const updateProfile = async (updates) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Update failed');
      }
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const changePassword = async (current_password, new_password) => {
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ current_password, new_password })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Password change failed');
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete account');
      }
      logout();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const isAdmin = user && user.role === 'admin';
  const isSuperAdmin = Boolean(user && user.role === 'admin' && !user.is_staff);

  const hasPermission = (permKey) => {
    if (!user || user.role !== 'admin') return false;
    if (!user.is_staff) return true; // Super admin has full unconstrained access
    if (!Array.isArray(user.permissions)) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permKey);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isSuperAdmin,
        hasPermission,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        changePassword,
        deleteAccount,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
