/**
 * @file secureStorage.ts
 * @description Provides a platform-agnostic secure storage solution.
 *
 * This module abstracts the underlying storage mechanism for sensitive data,
 * such as authentication tokens. It conforms to the `ZustandStorage` interface,
 * making it compatible with Zustand's `persist` middleware.
 *
 * Key features:
 * - Uses `expo-secure-store` for native platforms (iOS, Android), leveraging
 *   OS-level secure storage (Keychain/Keystore).
 * - Falls back to `localStorage` for web platforms.
 * - Provides a consistent async API for `getItem`, `setItem`, and `removeItem`.
 *
 * For a learner:
 * - This demonstrates a common pattern for handling platform differences in a
 *   cross-platform application (Expo + Web).
 * - Understand the importance of secure storage for sensitive items like auth tokens.
 * - Note how `Platform.OS` from `react-native` is used for conditional logic.
 * - `expo-secure-store` is crucial for security on mobile devices as it encrypts data.
 *   `localStorage` on the web is not encrypted but is standard for client-side storage;
 *   for highly sensitive web tokens, server-managed HttpOnly cookies are an alternative.
 */
import { Platform } from 'react-native';
// `expo-secure-store` provides access to the underlying native secure enclave
// (Keychain on iOS, EncryptedSharedPreferences/Keystore on Android).
// Ensure `expo-secure-store` is listed as a dependency in `apps/expo-mobile/package.json`
// and installed in the native project.
import * as SecureStore from 'expo-secure-store';

/**
 * Interface for a storage object compatible with Zustand's `persist` middleware.
 * Zustand's `persist` middleware allows for state to be saved and rehydrated from
 * various storage solutions (e.g., localStorage, AsyncStorage, or custom ones like this).
 *
 * The methods can be either synchronous (like `localStorage`) or asynchronous.
 * Since `expo-secure-store` is async, our implementation uses async methods.
 */
interface ZustandStorage {
  /** Retrieves an item from storage. */
  getItem: (name: string) => Promise<string | null> | string | null;
  /** Saves an item to storage. */
  setItem: (name: string, value: string) => Promise<void> | void;
  /** Removes an item from storage. */
  removeItem: (name: string) => Promise<void> | void;
}

/**
 * `SecureStorage` implements the `ZustandStorage` interface.
 * It provides a unified way to store data securely on native platforms
 * and uses `localStorage` as a fallback for web environments.
 *
 * This object is typically passed to Zustand's `createJSONStorage` function,
 * which then wraps it to handle JSON serialization/deserialization.
 */
export const SecureStorage: ZustandStorage = {
  /**
   * Retrieves an item from storage.
   * - On web, uses `localStorage.getItem()` (synchronous, but wrapped in Promise for consistency).
   * - On native, uses `SecureStore.getItemAsync()`.
   * @param name - The key of the item to retrieve.
   * @returns A promise that resolves to the stored string value, or null if not found or an error occurs.
   */
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      // `localStorage` is synchronous.
      return localStorage.getItem(name);
    }
    // On native platforms, use `expo-secure-store`.
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      // Log error and return null to indicate failure.
      // In a production app, this might involve more sophisticated error reporting.
      console.error('SecureStorage: getItemAsync failed for key', name, error);
      return null;
    }
  },

  /**
   * Saves an item to storage.
   * - On web, uses `localStorage.setItem()`.
   * - On native, uses `SecureStore.setItemAsync()`.
   * @param name - The key of the item to save.
   * @param value - The string value to store.
   * @returns A promise that resolves when the operation is complete.
   */
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
      return; // localStorage is synchronous, so we can return directly.
    }
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStorage: setItemAsync failed for key', name, error);
      // Depending on the app's needs, this might throw the error
      // or have other side effects if storing the token fails.
    }
  },

  /**
   * Removes an item from storage.
   * - On web, uses `localStorage.removeItem()`.
   * - On native, uses `SecureStore.deleteItemAsync()`.
   * @param name - The key of the item to remove.
   * @returns A promise that resolves when the operation is complete.
   */
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
      return; // localStorage is synchronous.
    }
    try {
      // Note: `deleteItemAsync` is the correct method for expo-secure-store.
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error(
        'SecureStorage: deleteItemAsync failed for key',
        name,
        error
      );
    }
  },
};
