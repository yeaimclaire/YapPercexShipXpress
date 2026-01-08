import { create } from 'zustand';
import Cookies from 'js-cookie';

const AUTH_STORAGE_KEY = 'yapperce_auth';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user, token) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user, token })
      );
    }
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    const token = Cookies.get('token');
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          set({
            user: parsed.user || null,
            token: parsed.token || token || null,
            isAuthenticated: !!(parsed.token || token),
          });
          return;
        } catch (error) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    }

    if (token) {
      // Token exists but user isn't cached yet
      set({ token, isAuthenticated: true });
    }
  },
}));

export default useAuthStore;
