# Establish an Expo client and replaceable provider boundaries

PrayerPal will use an Expo React Native client with TypeScript as its mobile runtime, targeting iOS and Android from one application codebase. The first runnable shell uses in-memory adapters so the application seam is deterministic in local development and continuous integration.

The application boundary is `PrayerPalApplication`. It depends on ports for authentication, user profile and Prayer Outcome storage, the prayer-time provider, the clock, and notification permission/delivery. The initial provider choices are recorded as integration targets behind those ports: Supabase Auth and Postgres for account and durable server-side data, Aladhan with an explicitly configured Hanafi/ Muslim World League method for Prayer Windows, Expo Notifications for operating-system notification permission and delivery, and platform-secure storage for session credentials. No provider SDK is allowed to leak into the application or domain modules.

The deterministic adapters are not a production data policy. They make it possible to control the current instant, device timezone, Active Prayer Location, provider response, notification permission, and notification delivery outcome while the real integrations are added in later vertical slices.

## Consequences

- The branded shell and later journeys can be exercised through the same application-facing seam on iOS, Android, and in CI.
- Provider integration can change without rewriting PrayerPal behavior or its tests.
- The first shell does not claim that authentication, durable storage, prayer-time networking, or push delivery are production-ready; those are explicit next integrations.
