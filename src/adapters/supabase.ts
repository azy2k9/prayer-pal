import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AccountCredentials,
  AccountGateway,
  AuthenticatedUser,
  ActivePrayerLocation,
  PrayerDayContext,
  PrayerDayContextStore,
  PrayerOutcomeRecord,
  PrayerOutcomeStore,
  TimingConfiguration,
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

interface PrayerOutcomeRow {
  user_id: string;
  prayer_date: string;
  prayer: PrayerOutcomeRecord['prayer'];
  outcome: PrayerOutcomeRecord['outcome'];
  recorded_at: string;
  device_time_zone: string;
  location: ActivePrayerLocation;
  timing_configuration: TimingConfiguration;
  timing_configuration_version: string;
}

interface PrayerDayContextRow {
  user_id: string;
  prayer_date: string;
  time_zone: string;
  location: ActivePrayerLocation;
  timing_configuration: TimingConfiguration;
  timing_configuration_version: string;
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

export class SupabasePrayerOutcomeStore implements PrayerOutcomeStore {
  constructor(private readonly client: SupabaseClient) {}

  async list(userId: string, prayerDate: string): Promise<PrayerOutcomeRecord[]> {
    const { data, error } = await this.client
      .from('prayer_outcomes')
      .select('user_id, prayer_date, prayer, outcome, recorded_at, device_time_zone, location, timing_configuration, timing_configuration_version')
      .eq('user_id', userId)
      .eq('prayer_date', prayerDate);
    throwIfError(error);
    return ((data ?? []) as PrayerOutcomeRow[]).map((row) => this.recordFromRow(row));
  }

  async save(record: PrayerOutcomeRecord): Promise<void> {
    const { error } = await this.client.from('prayer_outcomes').upsert({
      user_id: record.userId,
      prayer_date: record.prayerDate,
      prayer: record.prayer,
      outcome: record.outcome,
      recorded_at: record.recordedAt,
      device_time_zone: record.deviceTimeZone,
      location: record.location,
      timing_configuration: record.timingConfiguration,
      timing_configuration_version: record.timingConfigurationVersion,
    }, { onConflict: 'user_id,prayer_date,prayer' });
    throwIfError(error);
  }

  private recordFromRow(row: PrayerOutcomeRow): PrayerOutcomeRecord {
    return {
      userId: row.user_id,
      prayerDate: row.prayer_date,
      prayer: row.prayer,
      outcome: row.outcome,
      recordedAt: row.recorded_at,
      deviceTimeZone: row.device_time_zone,
      location: row.location,
      timingConfiguration: row.timing_configuration,
      timingConfigurationVersion: row.timing_configuration_version,
    };
  }
}

export class SupabasePrayerDayContextStore implements PrayerDayContextStore {
  constructor(private readonly client: SupabaseClient) {}

  async get(userId: string, prayerDate: string): Promise<PrayerDayContext | null> {
    const { data, error } = await this.client
      .from('prayer_day_contexts')
      .select('user_id, prayer_date, time_zone, location, timing_configuration, timing_configuration_version')
      .eq('user_id', userId)
      .eq('prayer_date', prayerDate)
      .maybeSingle();
    throwIfError(error);
    return data ? this.contextFromRow(data as PrayerDayContextRow) : null;
  }

  async save(userId: string, context: PrayerDayContext): Promise<void> {
    const { error } = await this.client.from('prayer_day_contexts').upsert({
      user_id: userId,
      prayer_date: context.prayerDate,
      time_zone: context.timeZone,
      location: context.location,
      timing_configuration: context.timingConfiguration,
      timing_configuration_version: context.timingConfigurationVersion,
    }, { onConflict: 'user_id,prayer_date' });
    throwIfError(error);
  }

  private contextFromRow(row: PrayerDayContextRow): PrayerDayContext {
    return {
      prayerDate: row.prayer_date,
      timeZone: row.time_zone,
      location: row.location,
      timingConfiguration: row.timing_configuration,
      timingConfigurationVersion: row.timing_configuration_version,
    };
  }
}
