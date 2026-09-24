# User Actions

## Configure social authentication

In the Supabase dashboard for the PrayerPal project:

1. Enable the Google and Apple authentication providers under **Authentication → Sign In / Providers**.
2. Add the required Google and Apple provider credentials.
3. Add `prayerpal://auth/callback` to **Authentication → URL Configuration → Redirect URLs**.
4. Confirm that the Google and Apple provider dashboards use the Supabase callback URL shown in the provider settings.

The app’s Google and Apple buttons use this redirect URL to return to the Expo app and restore the Supabase session.
