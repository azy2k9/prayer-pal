import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAuthenticationGateway, SupabaseUserProfileStore } from '../src/adapters/supabase';

const profile = {
  userId: 'user-1',
  displayName: 'Amina',
  activePrayerLocation: { label: 'London, United Kingdom', latitude: 51.5072, longitude: -0.1276 },
  notificationPermission: 'denied' as const,
  notificationDecision: 'declined' as const,
  onboardingComplete: true,
};

function makeClient({ session = null as { user: { id: string } } | null } = {}) {
  let savedProfile: Record<string, unknown> | null = null;
  const client = {
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      signUp: async () => ({ data: { user: { id: 'user-1' }, session: { user: { id: 'user-1' } } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: savedProfile,
            error: null,
          }),
        }),
      }),
      upsert: async (nextProfile: Record<string, unknown>) => {
        savedProfile = nextProfile;
        return { error: null };
      },
    }),
  } as unknown as SupabaseClient;
  return { client, getSavedProfile: () => savedProfile };
}

describe('Supabase provider adapters', () => {
  it('maps Supabase Auth sessions and account actions to the authentication port', async () => {
    const { client } = makeClient({ session: { user: { id: 'user-1' } } });
    const authentication = new SupabaseAuthenticationGateway(client);

    expect(await authentication.currentUser()).toEqual({ userId: 'user-1' });
    expect(await authentication.createAccount({ email: 'amina@example.com', password: 'password' })).toEqual({ userId: 'user-1' });
    expect(await authentication.signIn({ email: 'amina@example.com', password: 'password' })).toEqual({ userId: 'user-1' });
    await expect(authentication.signOut()).resolves.toBeUndefined();
  });

  it('maps the onboarding profile to the Postgres profile row', async () => {
    const { client, getSavedProfile } = makeClient();
    const profiles = new SupabaseUserProfileStore(client);

    await profiles.save(profile);
    expect(getSavedProfile()).toEqual({
      user_id: 'user-1',
      display_name: 'Amina',
      active_prayer_location: profile.activePrayerLocation,
      notification_permission: 'denied',
      notification_decision: 'declined',
      onboarding_complete: true,
    });

    expect(await profiles.get('user-1')).toEqual(profile);
  });
});
