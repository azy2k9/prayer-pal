import { describe, expect, it } from 'vitest';
import { PrayerPalApplication } from '../src/core/application';
import {
  FixedClock,
  FixedDeviceContext,
  InMemoryAuthenticationGateway,
  InMemoryNotificationGateway,
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
  NotificationDeliveryOutcome,
  NotificationPermission,
  PrayerTimeProvider,
  PrayerWindowRequest,
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

function makeApplication({
  notificationPermission = 'granted',
  deliveryOutcome = 'delivered',
}: {
  notificationPermission?: NotificationPermission;
  deliveryOutcome?: NotificationDeliveryOutcome;
} = {}) {
  const prayerTime = new ControlledPrayerTimeProvider();
  const notifications = new InMemoryNotificationGateway(notificationPermission, deliveryOutcome);
  const application = new PrayerPalApplication({
    clock: new FixedClock(new Date('2026-09-24T10:00:00.000Z')),
    device: new FixedDeviceContext('UTC'),
    authentication: new InMemoryAuthenticationGateway({ userId: 'user-1' }),
    profiles: new InMemoryUserProfileStore(),
    outcomes: new InMemoryPrayerOutcomeStore(),
    prayerTime,
    notifications,
  });
  return { application, prayerTime, notifications };
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
});
