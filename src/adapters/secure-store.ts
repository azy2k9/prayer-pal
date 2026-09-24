import * as SecureStore from 'expo-secure-store';
import type { KeyValueStore } from '../core/types';

/**
 * The runtime adapter keeps account session and local demo data behind the
 * same replaceable storage port used by deterministic tests.
 */
export class SecureStoreKeyValueStore implements KeyValueStore {
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async remove(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
