import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AccountCredentials,
  AccountGateway,
  AuthenticatedUser,
  ActivePrayerLocation,
  UserProfile,
  UserProfileStore,
} from '../core/types';

interface UserProfileRow {
  user_id: string;
  display_name: string;
  active_prayer_location: ActivePrayerLocation;
  notification_permission: UserProfile['notificationPermission'];
  notification_decision: UserProfile['notificationDecision'];
  onboarding_complete: boolean;
}

function throwIfError(error: { message: string } | null): void {
  if (error) {
    throw new Error(error.message);
  }
}

export class SupabaseAuthenticationGateway implements AccountGateway {
  constructor(private readonly client: SupabaseClient) {}

  async currentUser(): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.client.auth.getSession();
    throwIfError(error);
    return data.session?.user.id ? { userId: data.session.user.id } : null;
  }

  async createAccount(credentials: AccountCredentials): Promise<AuthenticatedUser> {
    const { data, error } = await this.client.auth.signUp(credentials);
    throwIfError(error);
    if (!data.user) {
      throw new Error('Supabase did not return a user for the new account.');
    }
    if (!data.session) {
      throw new Error('Account created. Confirm the email address before continuing.');
    }
    return { userId: data.user.id };
  }

  async signIn(credentials: AccountCredentials): Promise<AuthenticatedUser> {
    const { data, error } = await this.client.auth.signInWithPassword(credentials);
    throwIfError(error);
    if (!data.user) {
      throw new Error('Supabase did not return a user for the signed-in account.');
    }
    return { userId: data.user.id };
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    throwIfError(error);
  }
}

export class SupabaseUserProfileStore implements UserProfileStore {
  constructor(private readonly client: SupabaseClient) {}

  async get(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('user_id, display_name, active_prayer_location, notification_permission, notification_decision, onboarding_complete')
      .eq('user_id', userId)
      .maybeSingle();
    throwIfError(error);
    return data ? this.profileFromRow(data as UserProfileRow) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    const { error } = await this.client.from('user_profiles').upsert({
      user_id: profile.userId,
      display_name: profile.displayName,
      active_prayer_location: profile.activePrayerLocation,
      notification_permission: profile.notificationPermission,
      notification_decision: profile.notificationDecision,
      onboarding_complete: profile.onboardingComplete,
    }, { onConflict: 'user_id' });
    throwIfError(error);
  }

  private profileFromRow(row: UserProfileRow): UserProfile {
    return {
      userId: row.user_id,
      displayName: row.display_name,
      activePrayerLocation: row.active_prayer_location,
      notificationPermission: row.notification_permission,
      notificationDecision: row.notification_decision,
      onboardingComplete: row.onboarding_complete,
    };
  }
}
