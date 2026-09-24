import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { PrayerPalApplication } from './core/application';
import {
  DemoPrayerTimeProvider,
  SystemClock,
  SystemDeviceContext,
} from './adapters/in-memory';
import {
  PersistentPrayerOutcomeStore,
} from './adapters/persistent';
import { SupabaseAuthenticationGateway, SupabaseUserProfileStore } from './adapters/supabase';
import { ExpoNotificationGateway } from './adapters/expo-notifications';
import { SecureStoreKeyValueStore } from './adapters/secure-store';

export function createApplication(): PrayerPalApplication {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
  const localStorage = new SecureStoreKeyValueStore();
  return new PrayerPalApplication({
    clock: new SystemClock(),
    device: new SystemDeviceContext(),
    authentication: new SupabaseAuthenticationGateway(supabase),
    profiles: new SupabaseUserProfileStore(supabase),
    outcomes: new PersistentPrayerOutcomeStore(localStorage),
    prayerTime: new DemoPrayerTimeProvider(),
    notifications: new ExpoNotificationGateway(),
  });
}
