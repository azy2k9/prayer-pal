import {
  currentPrayer,
  dayLabelForDate,
  localDateFor,
  nextPrayer,
  prayerWindowStatus,
  prayersForDate,
} from './prayer-calendar';
import type {
  AppSnapshot,
  AccountCredentials,
  AccountGateway,
  HomeSnapshot,
  OnboardingSnapshot,
  PrayerName,
  PrayerOutcome,
  PrayerPalDependencies,
  RecordPrayerOutcomeResult,
  SocialAccountGateway,
  SocialAuthProvider,
  TimingConfiguration,
  ActivePrayerLocation,
} from './types';

export const INITIAL_TIMING_CONFIGURATION: TimingConfiguration = {
  id: 'prayerpal-hanafi-mwl-v1',
  name: 'PrayerPal Hanafi · Muslim World League',
  calculationMethod: 'Muslim World League',
  juristicSchool: 'Hanafi',
  adjustments: {
    Fajr: 0,
    Dhuhr: 0,
    Asr: 0,
    Maghrib: 0,
    Isha: 0,
    Jumuah: 0,
  },
  version: '1',
};

export class PrayerPalApplication {
  constructor(private readonly dependencies: PrayerPalDependencies) {}

  async start(): Promise<AppSnapshot> {
    const user = await this.dependencies.authentication.currentUser();
    if (!user) {
      return { screen: 'welcome' };
    }

    const profile = await this.dependencies.profiles.get(user.userId);
    if (!profile || !profile.onboardingComplete) {
      return this.onboardingSnapshot(profile?.displayName ?? '', profile?.notificationPermission ?? 'undetermined');
    }

    return this.homeSnapshot(user.userId);
  }

  async createAccount(credentials: AccountCredentials): Promise<AppSnapshot> {
    const account = this.accountGateway();
    await account.createAccount(this.validatedCredentials(credentials));
    return this.start();
  }

  async signIn(credentials: AccountCredentials): Promise<AppSnapshot> {
    const account = this.accountGateway();
    await account.signIn(this.validatedCredentials(credentials));
    return this.start();
  }

  async signInWithProvider(provider: SocialAuthProvider): Promise<AppSnapshot> {
    const account = this.socialAccountGateway();
    await account.signInWithProvider(provider);
    return this.start();
  }

  async signOut(): Promise<AppSnapshot> {
    const account = this.accountGateway();
    await account.signOut();
    return this.start();
  }

  async completeOnboarding(input: {
    displayName: string;
    location: ActivePrayerLocation;
    notificationDecision: 'request' | 'declined';
  }): Promise<HomeSnapshot> {
    const user = await this.requireUser();
    const displayName = input.displayName.trim();
    if (!displayName) {
      throw new Error('A display name is required to complete onboarding.');
    }
    this.validateLocation(input.location);
    if (input.notificationDecision !== 'request' && input.notificationDecision !== 'declined') {
      throw new Error('A notification-permission decision is required to complete onboarding.');
    }

    const notificationPermission = input.notificationDecision === 'request'
      ? await this.dependencies.notifications.requestPermission()
      : 'denied';

    await this.dependencies.profiles.save({
      userId: user.userId,
      displayName,
      activePrayerLocation: { ...input.location, label: input.location.label.trim() },
      notificationPermission,
      notificationDecision: input.notificationDecision === 'request' ? 'accepted' : 'declined',
      onboardingComplete: true,
    });

    return this.homeSnapshot(user.userId);
  }

  async home(): Promise<HomeSnapshot> {
    const user = await this.requireUser();
    return this.homeSnapshot(user.userId);
  }

  async updateActivePrayerLocation(location: ActivePrayerLocation): Promise<HomeSnapshot> {
    const user = await this.requireUser();
    const profile = await this.requireProfile(user.userId);
    this.validateLocation(location);
    await this.dependencies.profiles.save({
      ...profile,
      activePrayerLocation: { ...location, label: location.label.trim() },
    });
    return this.homeSnapshot(user.userId);
  }

  async recordPrayerOutcome(input: {
    prayerDate: string;
    prayer: PrayerName;
    outcome: PrayerOutcome;
  }): Promise<RecordPrayerOutcomeResult> {
    const user = await this.requireUser();
    const profile = await this.requireProfile(user.userId);
    if (!prayersForDate(input.prayerDate).includes(input.prayer)) {
      throw new Error(`${input.prayer} is not part of the tracked prayers for ${input.prayerDate}.`);
    }
    if (input.prayer === 'Jumuah' && input.outcome === 'qada') {
      throw new Error('Jumuah cannot be recorded as Qada.');
    }

    const record = {
      userId: user.userId,
      prayerDate: input.prayerDate,
      prayer: input.prayer,
      outcome: input.outcome,
      recordedAt: this.dependencies.clock.now().toISOString(),
      deviceTimeZone: this.timeZone(),
      location: profile.activePrayerLocation,
      timingConfigurationVersion: INITIAL_TIMING_CONFIGURATION.version,
    };
    if (this.dependencies.dayContexts && !(await this.dependencies.dayContexts.get(user.userId, input.prayerDate))) {
      await this.dependencies.dayContexts.save(user.userId, {
        prayerDate: input.prayerDate,
        timeZone: record.deviceTimeZone,
        location: record.location,
        timingConfigurationVersion: record.timingConfigurationVersion,
      });
    }
    await this.dependencies.outcomes.save(record);
    return { record, notification: { status: 'not-applicable' } };
  }

  private async homeSnapshot(userId: string): Promise<HomeSnapshot> {
    const profile = await this.requireProfile(userId);
    const now = this.dependencies.clock.now();
    const deviceTimeZone = this.timeZone();
    const localDate = localDateFor(now, deviceTimeZone);
    const outcomes = await this.dependencies.outcomes.list(userId, localDate);
    const storedContext = await this.dependencies.dayContexts?.get(userId, localDate);
    let observedContext = storedContext
      ?? (outcomes[0] && {
        prayerDate: localDate,
        timeZone: outcomes[0].deviceTimeZone,
        location: outcomes[0].location,
        timingConfigurationVersion: outcomes[0].timingConfigurationVersion,
      });
    if (observedContext && !storedContext && this.dependencies.dayContexts) {
      await this.dependencies.dayContexts.save(userId, observedContext);
    }
    if (!observedContext && this.dependencies.dayContexts) {
      observedContext = {
        prayerDate: localDate,
        timeZone: deviceTimeZone,
        location: profile.activePrayerLocation,
        timingConfigurationVersion: INITIAL_TIMING_CONFIGURATION.version,
      };
      await this.dependencies.dayContexts.save(userId, observedContext);
    }
    const timeZone = deviceTimeZone;
    const location = profile.activePrayerLocation;
    const labelledLocation = observedContext?.location ?? location;
    const windows = await this.dependencies.prayerTime.getPrayerWindows({
      prayerDate: localDate,
      timeZone,
      location,
      timingConfiguration: INITIAL_TIMING_CONFIGURATION,
    });
    const outcomeByPrayer = new Map(outcomes.map((outcome) => [outcome.prayer, outcome.outcome]));

    const next = nextPrayer(windows, now);
    return {
      screen: 'home',
      displayName: profile.displayName,
      localDate,
      dayLabel: dayLabelForDate(localDate),
      location,
      timingConfiguration: INITIAL_TIMING_CONFIGURATION,
      windowTimeZone: deviceTimeZone,
      prayerDayContext: {
        prayerDate: localDate,
        timeZone: observedContext?.timeZone ?? deviceTimeZone,
        location: labelledLocation,
        timingConfigurationVersion: INITIAL_TIMING_CONFIGURATION.version,
      },
      notificationPermission: profile.notificationPermission,
      prayers: windows.map((window) => {
        const status = prayerWindowStatus(window, now);
        return {
          prayer: window.prayer,
          window,
          outcome: outcomeByPrayer.get(window.prayer) ?? null,
          status: status === 'upcoming' && window.prayer === next ? 'next' : status,
        };
      }),
      currentPrayer: currentPrayer(windows, now),
      nextPrayer: next,
    };
  }

  private onboardingSnapshot(displayName: string, notificationPermission: OnboardingSnapshot['notificationPermission']): OnboardingSnapshot {
    return { screen: 'onboarding', displayName, notificationPermission };
  }

  private async requireUser() {
    const user = await this.dependencies.authentication.currentUser();
    if (!user) {
      throw new Error('An authenticated user is required.');
    }
    return user;
  }

  private async requireProfile(userId: string) {
    const profile = await this.dependencies.profiles.get(userId);
    if (!profile || !profile.onboardingComplete) {
      throw new Error('Onboarding must be completed first.');
    }
    return profile;
  }

  private timeZone(): string {
    return this.dependencies.device.timeZone();
  }

  private validateLocation(location: ActivePrayerLocation): void {
    if (!location.label.trim()) {
      throw new Error('An Active Prayer Location is required.');
    }
    if (!Number.isFinite(location.latitude) || location.latitude < -90 || location.latitude > 90) {
      throw new Error('An Active Prayer Location must have a valid latitude.');
    }
    if (!Number.isFinite(location.longitude) || location.longitude < -180 || location.longitude > 180) {
      throw new Error('An Active Prayer Location must have a valid longitude.');
    }
  }

  private accountGateway(): AccountGateway {
    const authentication = this.dependencies.authentication as Partial<AccountGateway>;
    if (
      typeof authentication.createAccount !== 'function'
      || typeof authentication.signIn !== 'function'
      || typeof authentication.signOut !== 'function'
    ) {
      throw new Error('Account access is not configured.');
    }
    return authentication as AccountGateway;
  }

  private socialAccountGateway(): SocialAccountGateway {
    const authentication = this.dependencies.authentication as Partial<SocialAccountGateway>;
    if (typeof authentication.signInWithProvider !== 'function') {
      throw new Error('Social account access is not configured.');
    }
    return authentication as SocialAccountGateway;
  }

  private validatedCredentials(credentials: AccountCredentials): AccountCredentials {
    const email = credentials.email.trim().toLowerCase();
    if (!email) {
      throw new Error('An email address is required.');
    }
    if (!credentials.password) {
      throw new Error('A password is required.');
    }
    return { email, password: credentials.password };
  }
}
