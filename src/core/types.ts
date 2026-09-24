export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' | 'Jumuah';

export type PrayerOutcome = 'completed' | 'not-completed' | 'qada';

export type NotificationPermission = 'undetermined' | 'granted' | 'denied';

export type NotificationDecision = 'accepted' | 'declined';

export type NotificationDeliveryOutcome = 'delivered' | 'failed';

export interface ActivePrayerLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export interface TimingConfiguration {
  id: string;
  name: string;
  calculationMethod: string;
  juristicSchool: 'Hanafi';
  adjustments: Readonly<Record<PrayerName, number>>;
  version: string;
}

export interface PrayerWindow {
  prayer: PrayerName;
  startsAt: string;
  endsAt: string;
}

export type PrayerWindowStatus = 'elapsed' | 'current' | 'next' | 'upcoming';

export interface PrayerWindowRequest {
  prayerDate: string;
  timeZone: string;
  location: ActivePrayerLocation;
  timingConfiguration: TimingConfiguration;
}

export interface PrayerOutcomeRecord {
  userId: string;
  prayerDate: string;
  prayer: PrayerName;
  outcome: PrayerOutcome;
  recordedAt: string;
  deviceTimeZone: string;
  location: ActivePrayerLocation;
  timingConfigurationVersion: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  activePrayerLocation: ActivePrayerLocation;
  notificationPermission: NotificationPermission;
  notificationDecision: NotificationDecision;
  onboardingComplete: boolean;
}

export interface AuthenticatedUser {
  userId: string;
}

export interface Clock {
  now(): Date;
}

export interface DeviceContext {
  timeZone(): string;
}

export interface AuthenticationGateway {
  currentUser(): Promise<AuthenticatedUser | null>;
}

export interface AccountCredentials {
  email: string;
  password: string;
}

export type SocialAuthProvider = 'google' | 'apple';

export interface AccountGateway extends AuthenticationGateway {
  createAccount(credentials: AccountCredentials): Promise<AuthenticatedUser>;
  signIn(credentials: AccountCredentials): Promise<AuthenticatedUser>;
  signOut(): Promise<void>;
}

export interface SocialAccountGateway extends AccountGateway {
  signInWithProvider(provider: SocialAuthProvider): Promise<AuthenticatedUser>;
}

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface UserProfileStore {
  get(userId: string): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
}

export interface PrayerOutcomeStore {
  list(userId: string, prayerDate: string): Promise<PrayerOutcomeRecord[]>;
  save(record: PrayerOutcomeRecord): Promise<void>;
}

export interface PrayerDayContextStore {
  get(userId: string, prayerDate: string): Promise<PrayerDayContext | null>;
  save(userId: string, context: PrayerDayContext): Promise<void>;
}

export interface PrayerTimeProvider {
  getPrayerWindows(request: PrayerWindowRequest): Promise<PrayerWindow[]>;
}

export interface PrayerCompletionNotification {
  kind: 'prayer-completion';
  body: 'A Circle Member recorded a Prayer Completion.';
}

export interface NotificationGateway {
  permission(): Promise<NotificationPermission>;
  requestPermission(): Promise<NotificationPermission>;
  deliver(notification: PrayerCompletionNotification): Promise<NotificationDeliveryOutcome>;
}

export interface PrayerPalDependencies {
  clock: Clock;
  device: DeviceContext;
  authentication: AuthenticationGateway;
  profiles: UserProfileStore;
  outcomes: PrayerOutcomeStore;
  dayContexts?: PrayerDayContextStore;
  prayerTime: PrayerTimeProvider;
  notifications: NotificationGateway;
}

export interface OnboardingSnapshot {
  screen: 'onboarding';
  displayName: string;
  notificationPermission: NotificationPermission;
}

export interface WelcomeSnapshot {
  screen: 'welcome';
}

export interface PrayerEntry {
  prayer: PrayerName;
  window: PrayerWindow;
  outcome: PrayerOutcome | null;
  status: PrayerWindowStatus;
}

export interface PrayerDayContext {
  prayerDate: string;
  timeZone: string;
  location: ActivePrayerLocation;
  timingConfigurationVersion: string;
}

export interface HomeSnapshot {
  screen: 'home';
  displayName: string;
  localDate: string;
  dayLabel: string;
  location: ActivePrayerLocation;
  timingConfiguration: TimingConfiguration;
  windowTimeZone: string;
  prayerDayContext: PrayerDayContext;
  notificationPermission: NotificationPermission;
  prayers: PrayerEntry[];
  currentPrayer: PrayerName | null;
  nextPrayer: PrayerName | null;
}

export type AppSnapshot = WelcomeSnapshot | OnboardingSnapshot | HomeSnapshot;

export type NotificationResult =
  | { status: 'not-applicable' }
  | { status: 'skipped-permission'; permission: NotificationPermission }
  | { status: 'delivered' }
  | { status: 'failed' };

export interface RecordPrayerOutcomeResult {
  record: PrayerOutcomeRecord;
  notification: NotificationResult;
}
