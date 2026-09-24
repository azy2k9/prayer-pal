import { localDateTimeToUtc, prayersForDate } from '../core/prayer-calendar';
import type {
  ActivePrayerLocation,
  AuthenticatedUser,
  AuthenticationGateway,
  Clock,
  DeviceContext,
  NotificationDeliveryOutcome,
  NotificationGateway,
  NotificationPermission,
  PrayerCompletionNotification,
  PrayerName,
  PrayerOutcomeRecord,
  PrayerOutcomeStore,
  PrayerTimeProvider,
  PrayerWindow,
  PrayerWindowRequest,
  UserProfile,
  UserProfileStore,
} from '../core/types';

export class FixedClock implements Clock {
  constructor(private readonly instant: Date) {}

  now(): Date {
    return new Date(this.instant);
  }
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class FixedDeviceContext implements DeviceContext {
  constructor(private readonly zone: string) {}

  timeZone(): string {
    return this.zone;
  }
}

export class SystemDeviceContext implements DeviceContext {
  timeZone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

export class InMemoryAuthenticationGateway implements AuthenticationGateway {
  constructor(private readonly user: AuthenticatedUser | null = { userId: 'local-demo-user' }) {}

  async currentUser(): Promise<AuthenticatedUser | null> {
    return this.user;
  }
}

export class InMemoryUserProfileStore implements UserProfileStore {
  private readonly profiles = new Map<string, UserProfile>();

  async get(userId: string): Promise<UserProfile | null> {
    return this.profiles.get(userId) ?? null;
  }

  async save(profile: UserProfile): Promise<void> {
    this.profiles.set(profile.userId, profile);
  }
}

export class InMemoryPrayerOutcomeStore implements PrayerOutcomeStore {
  private readonly records = new Map<string, PrayerOutcomeRecord>();

  async list(userId: string, prayerDate: string): Promise<PrayerOutcomeRecord[]> {
    return [...this.records.values()].filter(
      (record) => record.userId === userId && record.prayerDate === prayerDate,
    );
  }

  async save(record: PrayerOutcomeRecord): Promise<void> {
    this.records.set(`${record.userId}:${record.prayerDate}:${record.prayer}`, record);
  }
}

const DEMO_PRAYER_TIMES: Readonly<Record<PrayerName, string>> = {
  Fajr: '05:00',
  Dhuhr: '12:30',
  Asr: '15:45',
  Maghrib: '18:30',
  Isha: '20:00',
  Jumuah: '12:30',
};

export class DemoPrayerTimeProvider implements PrayerTimeProvider {
  async getPrayerWindows(request: PrayerWindowRequest): Promise<PrayerWindow[]> {
    const prayers = [...prayersForDate(request.prayerDate)];

    return prayers.map((prayer, index) => {
      const startsAt = localDateTimeToUtc(request.prayerDate, DEMO_PRAYER_TIMES[prayer], request.timeZone);
      const nextPrayer = prayers[index + 1];
      const endsAt = nextPrayer
        ? localDateTimeToUtc(request.prayerDate, DEMO_PRAYER_TIMES[nextPrayer], request.timeZone)
        : new Date(startsAt.getTime() + 90 * 60 * 1000);
      return { prayer, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
    });
  }
}

export class InMemoryNotificationGateway implements NotificationGateway {
  readonly delivered: PrayerCompletionNotification[] = [];

  constructor(
    private currentPermission: NotificationPermission = 'undetermined',
    private readonly deliveryOutcome: NotificationDeliveryOutcome = 'delivered',
  ) {}

  async permission(): Promise<NotificationPermission> {
    return this.currentPermission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (this.currentPermission === 'undetermined') {
      this.currentPermission = 'granted';
    }
    return this.currentPermission;
  }

  async deliver(notification: PrayerCompletionNotification): Promise<NotificationDeliveryOutcome> {
    this.delivered.push(notification);
    return this.deliveryOutcome;
  }

  setPermission(permission: NotificationPermission): void {
    this.currentPermission = permission;
  }
}

export const DEMO_LOCATION: ActivePrayerLocation = {
  label: 'London, United Kingdom',
  latitude: 51.5072,
  longitude: -0.1276,
};
