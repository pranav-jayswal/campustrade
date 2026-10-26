import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session on first load so a page refresh doesn't log
  // the person out — the token itself lives in localStorage too, and
  // axiosClient attaches it to every request automatically.
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const persistSession = (data) => {
    const { token, ...profile } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  const login = async (email, password) => {
    const { data } = await axiosClient.post('/auth/login', { email, password });
    persistSession(data);
    return data;
  };

  const register = async (payload) => {
    // Support either object payload or (name, email, password)
    const body =
      typeof payload === 'object' && payload !== null
        ? payload
        : { name: arguments[0], email: arguments[1], password: arguments[2] };

    const { data } = await axiosClient.post('/auth/register', body);
    persistSession(data);
    return data;
  };

  const sendVerificationCode = async (payload) => {
    const { data } = await axiosClient.post('/auth/send-verification-code', payload);
    return data;
  };

  const verifyCodeAndRegister = async (email, code) => {
    const { data } = await axiosClient.post('/auth/verify-code', { email, code });
    persistSession(data);
    return data;
  };

  const updateProfile = async (profileData) => {
    const { data } = await axiosClient.put('/auth/profile', profileData);
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const deactivateAccount = async () => {
    const { data } = await axiosClient.put('/auth/deactivate');
    logout();
    return data;
  };

  const deleteAccount = async () => {
    const { data } = await axiosClient.delete('/auth/delete-account');
    logout();
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        sendVerificationCode,
        verifyCodeAndRegister,
        updateProfile,
        deactivateAccount,
        deleteAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
