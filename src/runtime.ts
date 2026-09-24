import { PrayerPalApplication } from './core/application';
import {
  DemoPrayerTimeProvider,
  SystemClock,
  SystemDeviceContext,
} from './adapters/in-memory';
import {
  PersistentAuthenticationGateway,
  PersistentPrayerOutcomeStore,
  PersistentUserProfileStore,
} from './adapters/persistent';
import { ExpoNotificationGateway } from './adapters/expo-notifications';
import { SecureStoreKeyValueStore } from './adapters/secure-store';

export function createApplication(): PrayerPalApplication {
  const storage = new SecureStoreKeyValueStore();
  return new PrayerPalApplication({
    clock: new SystemClock(),
    device: new SystemDeviceContext(),
    authentication: new PersistentAuthenticationGateway(storage),
    profiles: new PersistentUserProfileStore(storage),
    outcomes: new PersistentPrayerOutcomeStore(storage),
    prayerTime: new DemoPrayerTimeProvider(),
    notifications: new ExpoNotificationGateway(),
  });
}
