import { PrayerPalApplication } from './core/application';
import {
  DemoPrayerTimeProvider,
  InMemoryAuthenticationGateway,
  InMemoryNotificationGateway,
  InMemoryPrayerOutcomeStore,
  InMemoryUserProfileStore,
  SystemClock,
  SystemDeviceContext,
} from './adapters/in-memory';

export function createApplication(): PrayerPalApplication {
  return new PrayerPalApplication({
    clock: new SystemClock(),
    device: new SystemDeviceContext(),
    authentication: new InMemoryAuthenticationGateway(),
    profiles: new InMemoryUserProfileStore(),
    outcomes: new InMemoryPrayerOutcomeStore(),
    prayerTime: new DemoPrayerTimeProvider(),
    notifications: new InMemoryNotificationGateway('undetermined'),
  });
}
