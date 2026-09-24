# PrayerPal

PrayerPal is a free, ad-free mobile experience that helps friends and family support one another in completing the five daily Obligatory Prayers.

The product combines a private personal prayer record with encouraging, non-competitive Prayer Circles. A user can understand their Prayer Windows, record Prayer Outcomes, review derived progress, and share only positive Prayer Completion activity with trusted Circle Members.

## Product principles

- **Encouragement over competition:** PrayerPal has Encouragement, Circle Celebrations, Prayer Rings, and rewards—not leaderboards or rankings.
- **Privacy by boundary:** Prayer Outcomes remain private. Circle membership controls shared activity, Qada details and not-completed outcomes are never exposed as circle activity, and Circle Activity History is bounded.
- **Honest, editable history:** Users can correct any Prayer Outcome on any date. Rewards and streaks are recalculated from the current record.
- **Clear prayer model:** The initial product tracks Fajr, Dhuhr, Asr, Maghrib, and Isha as single outcomes; Jumu'ah replaces Dhuhr on Friday.
- **Free for everyone:** The complete product has no subscriptions, paid tiers, or advertising.

## Current status

PrayerPal now has a runnable Expo/React Native foundation. Start the mobile shell with `npm install && npm start`, or run the application seam checks with `npm test` and `npm run typecheck`. The implementation roadmap is recorded in the [PrayerPal product specification](docs/prayerpal-product-spec.md), and the foundation runtime/provider choices are recorded in [ADR-0020](docs/adr/0020-foundation-runtime-and-provider-boundaries.md).

The domain glossary is in [CONTEXT.md](CONTEXT.md), and architectural decisions are recorded in [docs/adr](docs/adr/). Agents should follow the repository guidance in [AGENTS.md](AGENTS.md).

## Planned product areas

1. Foundations, privacy boundaries, authentication, and the original PrayerPal design system.
2. Onboarding, Active Prayer Location, Hanafi Timing Configuration, Prayer Windows, and daily outcomes.
3. Prayer Rings, Daily Prayer Badges, streaks, the Annual Perfect Prayer Reward, and history recalculation.
4. Prayer Circle creation, discovery, join requests, equal permissions, invite links, and archival.
5. Positive-only shared activity, configurable Prayer Completion Notifications, Encouragement, and Circle Celebrations.
6. Immutable Circle Messages, Direct Messages, Account Deactivation, and restoration.
7. Accessibility, security and privacy review, release testing, and original store/social launch assets.

## Reference material

The [inspiration](inspiration/) directory contains visual and product references from the similar Pillars app, including logos, prayer screens, onboarding, app-store listings, launch material, and social formats. These references inform the visual direction only. PrayerPal must use original branding and must not copy Pillars assets, claims, or features without confirmed rights.

In particular, PrayerPal cannot make Pillars' “data never leaves your phone” claim: Prayer Circles, notifications, and messaging require carefully disclosed server-side data. Qibla and menstruation-pause behavior appear in the references but are not part of the current PrayerPal scope.

## GitHub workflow

Issues and specs live in GitHub Issues and are managed with the GitHub CLI. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md) for the repository workflow and [docs/agents/triage-labels.md](docs/agents/triage-labels.md) for the triage vocabulary.

Before creating or editing issues, authenticate with `gh auth login` and verify with `gh auth status`.
