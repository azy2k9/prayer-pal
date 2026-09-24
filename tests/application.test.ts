import { describe, expect, it } from 'vitest';
import { PrayerPalApplication } from '../src/core/application';
import {
  FixedClock,
  FixedDeviceContext,
  InMemoryAuthenticationGateway,
  InMemoryNotificationGateway,
  InMemoryPrayerDayContextStore,
  InMemoryPrayerOutcomeStore,
  InMemoryUserProfileStore,
} from '../src/adapters/in-memory';
import {
  InMemoryKeyValueStore,
  PersistentAuthenticationGateway,
  PersistentPrayerOutcomeStore,
  PersistentUserProfileStore,
} from '../src/adapters/persistent';
import type {
  AuthenticatedUser,
  NotificationDeliveryOutcome,
  NotificationPermission,
  PrayerTimeProvider,
  PrayerWindowRequest,
  SocialAccountGateway,
} from '../src/core/types';

const location = { label: 'London, United Kingdom', latitude: 51.5072, longitude: -0.1276 };

class ControlledPrayerTimeProvider implements PrayerTimeProvider {
  requests: PrayerWindowRequest[] = [];

  async getPrayerWindows(request: PrayerWindowRequest) {
    this.requests.push(request);
    return [
      { prayer: 'Fajr' as const, startsAt: '2026-09-24T04:00:00.000Z', endsAt: '2026-09-24T11:30:00.000Z' },
      { prayer: 'Dhuhr' as const, startsAt: '2026-09-24T11:30:00.000Z', endsAt: '2026-09-24T14:45:00.000Z' },
      { prayer: 'Asr' as const, startsAt: '2026-09-24T14:45:00.000Z', endsAt: '2026-09-24T17:30:00.000Z' },
      { prayer: 'Maghrib' as const, startsAt: '2026-09-24T17:30:00.000Z', endsAt: '2026-09-24T19:00:00.000Z' },
      { prayer: 'Isha' as const, startsAt: '2026-09-24T19:00:00.000Z', endsAt: '2026-09-24T20:30:00.000Z' },
    ];
  }
}

class ControlledSocialAuthenticationGateway implements SocialAccountGateway {
  private user: AuthenticatedUser | null = null;

  async currentUser(): Promise<AuthenticatedUser | null> {
    return this.user;
  }

  async createAccount(): Promise<AuthenticatedUser> {
    this.user = { userId: 'social-user' };
    return this.user;
  }

  async signIn(): Promise<AuthenticatedUser> {
    this.user = { userId: 'social-user' };
    return this.user;
  }

  async signInWithProvider(): Promise<AuthenticatedUser> {
    this.user = { userId: 'social-user' };
    return this.user;
  }

  async signOut(): Promise<void> {
    this.user = null;
  }
}

function makeApplication({
  notificationPermission = 'granted',
  deliveryOutcome = 'delivered',
}: {
  notificationPermission?: NotificationPermission;
  deliveryOutcome?: NotificationDeliveryOutcome;
} = {}) {
  const prayerTime = new ControlledPrayerTimeProvider();
  const notifications = new InMemoryNotificationGateway(notificationPermission, deliveryOutcome);
  const profiles = new InMemoryUserProfileStore();
  const outcomes = new InMemoryPrayerOutcomeStore();
  const dayContexts = new InMemoryPrayerDayContextStore();
  const device = new FixedDeviceContext('UTC');
  const application = new PrayerPalApplication({
    clock: new FixedClock(new Date('2026-09-24T10:00:00.000Z')),
    device,
    authentication: new InMemoryAuthenticationGateway({ userId: 'user-1' }),
    profiles,
    outcomes,
    dayContexts,
    prayerTime,
    notifications,
  });
  return { application, prayerTime, notifications, outcomes, device, dayContexts };
}

function makePersistentApplication(storage: InMemoryKeyValueStore) {
  const prayerTime = new ControlledPrayerTimeProvider();
  const notifications = new InMemoryNotificationGateway('undetermined');
  const application = new PrayerPalApplication({
    clock: new FixedClock(new Date('2026-09-24T10:00:00.000Z')),
    device: new FixedDeviceContext('UTC'),
    authentication: new PersistentAuthenticationGateway(storage),
    profiles: new PersistentUserProfileStore(storage),
    outcomes: new PersistentPrayerOutcomeStore(storage),
    prayerTime,
    notifications,
  });
  return { application, prayerTime, notifications };
}

describe('PrayerPal application seam', () => {
  it('creates an account and retains its completed onboarding across application restarts', async () => {
    const storage = new InMemoryKeyValueStore();
    const firstLaunch = makePersistentApplication(storage);

    expect(await firstLaunch.application.start()).toEqual({ screen: 'welcome' });
    expect(await firstLaunch.application.createAccount({
      email: 'amina@example.com',
      password: 'a-strong-password',
    })).toMatchObject({ screen: 'onboarding' });

    const home = await firstLaunch.application.completeOnboarding({
      displayName: 'Amina',
      location: { label: 'Makkah, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
      notificationDecision: 'declined',
    });
    expect(home.displayName).toBe('Amina');
    expect(home.location.label).toBe('Makkah, Saudi Arabia');

    const restarted = makePersistentApplication(storage);
    const restored = await restarted.application.start();

    expect(restored).toMatchObject({
      screen: 'home',
      displayName: 'Amina',
      location: { label: 'Makkah, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
      notificationPermission: 'denied',
    });
  });

  it('can sign in to an existing account after signing out', async () => {
    const storage = new InMemoryKeyValueStore();
    const firstLaunch = makePersistentApplication(storage);
    await firstLaunch.application.createAccount({ email: 'amina@example.com', password: 'password' });
    await firstLaunch.application.completeOnboarding({ displayName: 'Amina', location, notificationDecision: 'declined' });

    expect(await firstLaunch.application.signOut()).toEqual({ screen: 'welcome' });
    expect(await firstLaunch.application.signIn({ email: 'amina@example.com', password: 'password' })).toMatchObject({
      screen: 'home',
      displayName: 'Amina',
    });
  });

  it('exposes social provider sign-in through the application seam', async () => {
    const authentication = new ControlledSocialAuthenticationGateway();
    const application = new PrayerPalApplication({
      clock: new FixedClock(new Date('2026-09-24T10:00:00.000Z')),
      device: new FixedDeviceContext('UTC'),
      authentication,
      profiles: new InMemoryUserProfileStore(),
      outcomes: new InMemoryPrayerOutcomeStore(),
      prayerTime: new ControlledPrayerTimeProvider(),
      notifications: new InMemoryNotificationGateway('undetermined'),
    });

    expect(await application.signInWithProvider('google')).toEqual({
      screen: 'onboarding',
      displayName: '',
      notificationPermission: 'undetermined',
    });
  });

  it('runs the onboarding-to-prayer-completion smoke journey through replaceable boundaries', async () => {
    const { application, prayerTime, notifications } = makeApplication();

    expect(await application.start()).toEqual({
      screen: 'onboarding',
      displayName: '',
      notificationPermission: 'undetermined',
    });

    const home = await application.completeOnboarding({
      displayName: 'Amina',
      location,
      notificationDecision: 'request',
    });

    expect(home.screen).toBe('home');
    expect(home.localDate).toBe('2026-09-24');
    expect(home.prayers.map(({ prayer }) => prayer)).toEqual(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']);
    expect(home.currentPrayer).toBe('Fajr');
    expect(home.nextPrayer).toBe('Dhuhr');
    expect(home.prayers.map(({ prayer, status }) => [prayer, status])).toEqual([
      ['Fajr', 'current'],
      ['Dhuhr', 'next'],
      ['Asr', 'upcoming'],
      ['Maghrib', 'upcoming'],
      ['Isha', 'upcoming'],
    ]);
    expect(home.prayerDayContext).toEqual({
      prayerDate: '2026-09-24',
      timeZone: 'UTC',
      location,
      timingConfigurationVersion: '1',
    });
    expect(prayerTime.requests[0]).toMatchObject({
      prayerDate: '2026-09-24',
      timeZone: 'UTC',
      location,
    });

    const result = await application.recordPrayerOutcome({
      prayerDate: '2026-09-24',
      prayer: 'Fajr',
      outcome: 'completed',
    });

    expect(result.record.outcome).toBe('completed');
    expect(result.notification).toEqual({ status: 'not-applicable' });
    expect(notifications.delivered).toHaveLength(0);
    expect((await application.home()).prayers[0].outcome).toBe('completed');
  });

  it('keeps notification permission and delivery outcomes deterministic at the provider boundary', async () => {
    const { notifications } = makeApplication({ notificationPermission: 'denied', deliveryOutcome: 'failed' });

    expect(await notifications.permission()).toBe('denied');
    expect(notifications.delivered).toHaveLength(0);

    notifications.setPermission('granted');
    expect(await notifications.deliver({
      kind: 'prayer-completion',
      body: 'A Circle Member recorded a Prayer Completion.',
    })).toBe('failed');
    expect(notifications.delivered).toHaveLength(1);
  });

  it('grants the demo notification request while preserving an explicit decline', async () => {
    const { application, notifications } = makeApplication({ notificationPermission: 'undetermined' });

    await application.completeOnboarding({ displayName: 'Amina', location, notificationDecision: 'request' });
    expect(await notifications.permission()).toBe('granted');

    const declined = makeApplication({ notificationPermission: 'undetermined' });
    const declinedHome = await declined.application.completeOnboarding({ displayName: 'Amina', location, notificationDecision: 'declined' });
    expect(declinedHome.notificationPermission).toBe('denied');
  });

  it('applies the Friday Jumuah rule at the application boundary', async () => {
    const { application } = makeApplication();
    await application.completeOnboarding({ displayName: 'Amina', location, notificationDecision: 'declined' });

    await expect(application.recordPrayerOutcome({
      prayerDate: '2026-09-25',
      prayer: 'Jumuah',
      outcome: 'qada',
    })).rejects.toThrow('Jumuah cannot be recorded as Qada.');

    await expect(application.recordPrayerOutcome({
      prayerDate: '2026-09-25',
      prayer: 'Dhuhr',
      outcome: 'completed',
    })).rejects.toThrow('Dhuhr is not part of the tracked prayers');
  });

  it('keeps an observed prayer outcome labelled with the location and timezone in effect when it was recorded', async () => {
    const { application, outcomes, device, prayerTime } = makeApplication();
    await application.completeOnboarding({ displayName: 'Amina', location, notificationDecision: 'declined' });

    await application.recordPrayerOutcome({ prayerDate: '2026-09-24', prayer: 'Fajr', outcome: 'completed' });
    await application.updateActivePrayerLocation({ label: 'Makkah, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 });
    device.setTimeZone('America/Los_Angeles');

    const observedHome = await application.home();
    expect(observedHome.location).toEqual({ label: 'Makkah, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 });
    expect(prayerTime.requests.at(-1)).toMatchObject({
      location: { label: 'Makkah, Saudi Arabia' },
      timeZone: 'America/Los_Angeles',
    });
    expect(observedHome.prayerDayContext).toMatchObject({
      prayerDate: '2026-09-24',
      timeZone: 'UTC',
      location,
    });

    const [record] = await outcomes.list('user-1', '2026-09-24');
    expect(record).toMatchObject({
      prayerDate: '2026-09-24',
      deviceTimeZone: 'UTC',
      location,
      timingConfigurationVersion: '1',
    });
  });

  it('persists the labelled context when a prayer day is first observed, before any outcome is recorded', async () => {
    const { application, dayContexts } = makeApplication();
    await application.completeOnboarding({ displayName: 'Amina', location, notificationDecision: 'declined' });
    await application.home();
    await application.updateActivePrayerLocation({ label: 'Makkah, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 });

    expect(await dayContexts.get('user-1', '2026-09-24')).toEqual({
      prayerDate: '2026-09-24',
      timeZone: 'UTC',
      location,
      timingConfigurationVersion: '1',
    });
    expect((await application.home()).prayerDayContext.location).toEqual(location);
  });
});
