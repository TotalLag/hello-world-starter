import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Platform-specific secure storage implementation
import { SecureStorage } from './secureStorage';

// NOTE: This is one of the few appropriate uses of Zustand in our architecture.
// The auth token:
// 1. Is not server state (it's given once by the server)
// 2. Needs to be persisted securely between sessions
// 3. Must be accessible throughout the app
// 4. Is used to enable/disable TanStack Query operations
interface TokenState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  hasToken: () => boolean;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      hasToken: () => Boolean(get().token),
    }),
    {
      name: 'auth-token-storage',
      storage: createJSONStorage(() => SecureStorage),
    }
  )
);
