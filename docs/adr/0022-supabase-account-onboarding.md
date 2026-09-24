# Use Supabase Auth and Postgres for account onboarding

Issue #3 replaces the temporary local account bridge with Supabase Auth for email/password and Google/Apple OAuth account access, and Postgres for the required onboarding profile. The Expo runtime restores Supabase sessions through its persisted client storage; profile reads and writes go through an adapter using the authenticated Supabase client. The `user_profiles` table is protected by row-level security so an authenticated user can access only their own profile.

The application and domain modules continue to depend on the existing ports and do not import Supabase SDK types. In-memory adapters remain available for deterministic tests. Missing Supabase runtime configuration is an explicit startup error; the production runtime does not silently fall back to local fake accounts.

The current slice keeps Prayer Outcome persistence behind the existing local deterministic adapter until the dependent personal-record issue defines its Postgres schema and authorization rules. This does not make local Prayer Outcome storage a production privacy policy.

## Consequences

- Account identity and onboarding profile data are shared across app launches and devices through Supabase.
- Google and Apple sign-in return through the `prayerpal://auth/callback` app scheme and use the same restored Supabase session as email/password access.
- The Supabase project must have email/password authentication enabled and the profile migration applied.
- Email-confirmation settings affect whether sign-up immediately returns a session; the app reports that state instead of bypassing verification.
- The provider integration remains replaceable at the application boundary.
