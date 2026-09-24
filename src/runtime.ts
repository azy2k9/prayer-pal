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
import { SupabasePrayerDayContextStore, SupabasePrayerOutcomeStore, SupabaseUserProfileStore } from './adapters/supabase';
import { SupabaseSocialAuthenticationGateway } from './adapters/supabase-social-auth';
import { ExpoNotificationGateway } from './adapters/expo-notifications';

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
  return new PrayerPalApplication({
    clock: new SystemClock(),
    device: new SystemDeviceContext(),
    authentication: new SupabaseSocialAuthenticationGateway(supabase),
    profiles: new SupabaseUserProfileStore(supabase),
    outcomes: new SupabasePrayerOutcomeStore(supabase),
    dayContexts: new SupabasePrayerDayContextStore(supabase),
    prayerTime: new DemoPrayerTimeProvider(),
    notifications: new ExpoNotificationGateway(),
  });
}
