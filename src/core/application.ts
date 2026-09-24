import {
  dayLabelForDate,
  localDateFor,
  nextPrayer,
  prayersForDate,
} from './prayer-calendar';
import type {
  AppSnapshot,
  HomeSnapshot,
  OnboardingSnapshot,
  PrayerName,
  PrayerOutcome,
  PrayerPalDependencies,
  RecordPrayerOutcomeResult,
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
    if (!input.location.label.trim()) {
      throw new Error('An Active Prayer Location is required to complete onboarding.');
    }

    const notificationPermission = input.notificationDecision === 'request'
      ? await this.dependencies.notifications.requestPermission()
      : 'denied';

    await this.dependencies.profiles.save({
      userId: user.userId,
      displayName,
      activePrayerLocation: input.location,
      notificationPermission,
      onboardingComplete: true,
    });

    return this.homeSnapshot(user.userId);
  }

  async home(): Promise<HomeSnapshot> {
    const user = await this.requireUser();
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
    await this.dependencies.outcomes.save(record);
    return { record, notification: { status: 'not-applicable' } };
  }

  private async homeSnapshot(userId: string): Promise<HomeSnapshot> {
    const profile = await this.requireProfile(userId);
    const now = this.dependencies.clock.now();
    const timeZone = this.timeZone();
    const localDate = localDateFor(now, timeZone);
    const windows = await this.dependencies.prayerTime.getPrayerWindows({
      prayerDate: localDate,
      timeZone,
      location: profile.activePrayerLocation,
      timingConfiguration: INITIAL_TIMING_CONFIGURATION,
    });
    const outcomes = await this.dependencies.outcomes.list(userId, localDate);
    const outcomeByPrayer = new Map(outcomes.map((outcome) => [outcome.prayer, outcome.outcome]));

    return {
      screen: 'home',
      displayName: profile.displayName,
      localDate,
      dayLabel: dayLabelForDate(localDate),
      location: profile.activePrayerLocation,
      timingConfiguration: INITIAL_TIMING_CONFIGURATION,
      notificationPermission: profile.notificationPermission,
      prayers: windows.map((window) => ({
        prayer: window.prayer,
        window,
        outcome: outcomeByPrayer.get(window.prayer) ?? null,
      })),
      nextPrayer: nextPrayer(windows, now),
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
}
