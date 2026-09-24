# Keep account onboarding behind replaceable provider boundaries

The first account-onboarding vertical slice will expose account creation, sign-in, sign-out, profile persistence, and Prayer Outcome persistence through the existing application ports. The Expo runtime uses platform-secure storage as a temporary local adapter so the mobile journey works across app restarts while the server integrations are not yet present. The application and domain modules do not depend on SecureStore or an authentication SDK.

This local adapter is an implementation bridge, not the product's final account or data architecture. It does not provide cross-device account access, server-side account recovery, or production authentication guarantees. The planned Supabase Auth and Postgres integrations remain the replacement boundary for a production release.

Operating-system notification permission is requested through the Expo Notifications adapter. Active Prayer Location is selected or entered manually; continuous and background location access are not required for onboarding.

## Consequences

- The issue #3 onboarding journey can be exercised on a real device and restored after an app restart.
- Deterministic tests can use the same ports with in-memory storage and notification adapters.
- A later authentication/data integration can replace the runtime adapters without changing application behavior or domain types.
- The local adapter must not be presented as a completed server-side authentication or privacy implementation.
