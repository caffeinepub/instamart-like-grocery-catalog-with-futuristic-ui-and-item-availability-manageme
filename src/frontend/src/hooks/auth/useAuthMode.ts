import { useState, useEffect } from 'react';

type AuthMode = 'customer' | 'vendor';

const STORAGE_KEY = 'mylocalkart_auth_mode';

export function useAuthMode() {
  const [mode, setModeState] = useState<AuthMode>(() => {
    if (typeof window === 'undefined') return 'customer';
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'vendor' ? 'vendor' : 'customer') as AuthMode;
  });

  const setMode = (newMode: AuthMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }, [mode]);

  return { mode, setMode };
}
