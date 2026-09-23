# Build PrayerPal: private, encouraging prayer consistency with friends and family

## Problem Statement

Muslims who want help staying consistent with the five daily Obligatory Prayers do not have a simple way to combine personal prayer tracking with private, supportive accountability among trusted friends and family. Existing experiences can be solitary, publicly performative, competitive, unclear about Qada Prayer, or difficult to trust with sensitive worship and location data.

PrayerPal currently has a well-defined domain model and a set of architectural decisions, but no application implementation. It needs one coherent product specification that turns those decisions into a buildable mobile experience and a staged route to launch. The supplied Pillars reference collection demonstrates a calm, approachable prayer experience and a strong launch asset system, but it is a separate product: its branding, product claims, and feature choices cannot be copied wholesale.

## Solution

Build PrayerPal as a mobile-first, free, ad-free product that helps a user understand today's Prayer Windows, record one Prayer Outcome for each Obligatory Prayer, review personal progress, and receive encouraging support inside private Prayer Circles.

The first complete product will provide:

- Required onboarding for display name, Active Prayer Location, and a notification-permission decision.
- A clearly named initial Hanafi Timing Configuration behind a replaceable prayer-time provider.
- Personal recording of completed, not completed, and Qada outcomes, with Jumu'ah replacing Dhuhr on Friday.
- Editable history with rewards, streaks, Prayer Rings, and Circle Celebrations recalculated from the current prayer record.
- Discoverable but private Prayer Circles with equal Circle Member permissions, approval-based discovery, and expiring single-use invite links.
- Positive-only Circle Activity History, configurable Prayer Completion Notifications, and supportive Encouragement without leaderboards.
- Immutable Circle Messages and Direct Messages with intentionally different membership lifecycles.
- Recoverable Account Deactivation, preserving personal history and message attribution while removing the person from circles.
- An original PrayerPal visual identity informed by the calm, legible, day/night-aware character of the Pillars references, without reusing Pillars branding or making Pillars' local-only data claim.

Delivery will proceed in vertical phases: product and privacy foundations; onboarding, timing, and the personal prayer loop; history and rewards; circles and private activity; encouragement and messaging; account lifecycle; then accessibility, launch assets, store readiness, and operational hardening.

## User Stories

1. As a prospective user, I want to understand that PrayerPal supports the five daily Obligatory Prayers, so that I can decide whether it fits my practice.
2. As a prospective user, I want PrayerPal's supportive and non-competitive purpose explained clearly, so that I know my worship will not be ranked against other people.
3. As a prospective user, I want clear and accurate privacy language, so that I understand which information stays private and which information is shared with Prayer Circle members.
4. As a prospective user, I want to know that the complete product is free and ad-free, so that I can use it without a subscription, paid tier, or advertising.
5. As a new user, I want to create an account or sign in, so that my prayer history and Prayer Circle relationships can be retained securely.
6. As a Circle Invite Link recipient without an account, I want to sign up and then continue into the invited Prayer Circle, so that onboarding does not lose my invitation.
7. As a new user, I want to provide a display name during onboarding, so that friends and family can recognise me in a Prayer Circle.
8. As a new user, I want to choose one Active Prayer Location during onboarding, so that PrayerPal can calculate relevant Prayer Windows.
9. As a privacy-conscious user, I want to choose my Active Prayer Location manually, so that continuous or background location access is not required.
10. As a new user, I want to make an explicit notification-permission decision, so that PrayerPal does not assume consent.
11. As a new user, I want to continue after declining system notification permission, so that notifications remain optional.
12. As a new user, I want profile photography and Prayer Circle membership to remain optional, so that I can start with only the information needed for the core experience.
13. As a user, I want to change my Active Prayer Location later, so that PrayerPal remains useful when I move or travel.
14. As a user, I want to see the location, named calculation method, juristic-school setting, and adjustments in my Timing Configuration, so that the basis of my Prayer Windows is transparent.
15. As a user, I want the initial Hanafi Timing Configuration to be named precisely, so that the word Hanafi is not presented as a complete explanation of all timing parameters.
16. As a user, I want a simple, legible interface with generous touch targets and clear states, so that I can use the app confidently regardless of age or technical familiarity.
17. As a user, I want to see today's tracked Obligatory Prayers and their Prayer Windows, so that I can orient myself within the prayer day.
18. As a user, I want the current or next Obligatory Prayer to be visually clear, so that I can understand the day at a glance.
19. As a user, I want Fajr, Dhuhr, Asr, Maghrib, and Isha represented as the normal daily set, so that the tracker matches the product's defined scope.
20. As a user, I want Jumu'ah to replace Dhuhr in Friday's tracked set, so that Friday is represented correctly.
21. As a user, I want to record an Obligatory Prayer as completed during its Prayer Window, so that my Prayer Outcome reflects an on-time completion.
22. As a user, I want to record an Obligatory Prayer as not completed, so that my prayer record can be honest and complete.
23. As a user, I want to record a missed Obligatory Prayer as Qada after completing it later, so that later completion is distinguished from on-time completion.
24. As a user, I want Jumu'ah to allow only completed or not completed, so that it cannot be recorded as Qada.
25. As a user, I want an unrecorded prayer to become not completed at local midnight, so that each finished prayer day has a defined record.
26. As a user, I want to update any Prayer Outcome on any historical date, so that mistakes and later Qada Prayers can be recorded honestly.
27. As a travelling user, I want my device timezone to define local midnight and the active prayer date, so that PrayerPal follows the day I am actually experiencing.
28. As a travelling user, I want existing prayer records to keep their original prayer dates when my timezone or Active Prayer Location changes, so that travel does not rewrite history.
29. As a user, I want each Obligatory Prayer represented as one outcome rather than separate Fard, Sunnah, or Witr components, so that tracking stays focused and simple.
30. As a user, I want PrayerPal to record my chosen outcome without issuing a religious ruling, so that the app supports practice without presenting itself as a religious authority.
31. As a user, I want my individual Prayer Outcomes to remain private unless they produce explicitly shared positive activity, so that misses and Qada details are not exposed.
32. As a user, I want a Prayer Ring showing daily completion progress, so that I can understand my day without a competitive score.
33. As a user, I want to review another date, so that I can inspect and correct my personal prayer history.
34. As a user, I want a gold Daily Prayer Badge for an on-time Prayer Completion, so that timely completion is recognised positively.
35. As a user, I want a silver Daily Prayer Badge for a Qada Prayer, so that completing a missed prayer is recognised without presenting it as on-time.
36. As a user, I want Qada Prayers to preserve my Consistency Streak, so that continued effort is recognised.
37. As a user, I want only days with every prayer completed during its Prayer Window to preserve my Perfect Prayer Streak, so that perfect and consistency-based progress remain distinct.
38. As a user, I want Weekly Prayer Streak and Monthly Prayer Streak summaries, so that I can understand medium-term consistency.
39. As a user, I want a special Annual Perfect Prayer Reward after 365 consecutive perfect days, so that exceptional long-term consistency is recognised.
40. As a user, I want rewards and streaks recalculated after any historical correction, so that they always reflect my current prayer history.
41. As a user, I want an invalidated Circle Celebration to be withdrawn after a relevant historical correction, so that shared celebrations remain truthful.
42. As a user, I do not want leaderboards, rankings, or public comparisons, so that worship is encouraged without becoming a competition.
43. As a user, I want to create a Prayer Circle for trusted friends or family, so that we can support one another.
44. As a Circle Member, I want a Prayer Circle to have a name, photo, description, and discoverability setting, so that members can recognise and describe the group.
45. As a Circle Member, I want to change a Prayer Circle's name, photo, description, or discoverability, so that the shared space can evolve without an owner role.
46. As a user, I want to search for discoverable Prayer Circles by name, so that I can find a group I know.
47. As a user browsing search results, I want to see only a Prayer Circle's name and member count, so that discovery does not reveal prayer activity.
48. As a user, I want to request membership in a Prayer Circle found by name, so that discoverability does not bypass member approval.
49. As a Circle Member, I want to approve a name-based join request, so that the existing group controls admission.
50. As a Circle Member, I want to generate a Circle Invite Link, so that I can invite a trusted person directly.
51. As a Circle Member, I want a Circle Invite Link to expire after two days and after one successful use, so that old or forwarded links have limited power.
52. As a Circle Member, I want to revoke an unused Circle Invite Link, so that I can invalidate an invitation when circumstances change.
53. As an existing user with a valid Circle Invite Link, I want to join immediately after signing in, so that a direct invitation does not require a second approval.
54. As a new user with a valid Circle Invite Link, I want to join immediately after signing up and completing required onboarding, so that the invitation flow remains continuous.
55. As a Circle Member, I want the same membership permissions as every other member, so that the Prayer Circle is a shared space rather than an owned organisation.
56. As the person who created a Prayer Circle, I want no permanent special authority, so that creating the group does not make me its owner.
57. As a Circle Member, I want to remove another member, so that the group can manage its own membership.
58. As a Circle Member, I want to leave freely, so that participation remains voluntary.
59. As a Circle Member, I do not want an artificial circle-size limit in the initial product, so that the app does not block legitimate friend or family groups.
60. As a user searching for circles, I do not want an empty Prayer Circle to appear, so that archived groups are not presented as active.
61. As a Circle Member, I want to see a member's shared Prayer Completion, so that I can offer support.
62. As a Circle Member, I want shared activity to hide whether a Prayer Completion was on time or Qada, so that private details are not exposed.
63. As a Circle Member, I do not want another member's not-completed outcomes shown, so that the circle remains positive and non-judgmental.
64. As a Circle Member, I want Circle Activity History for today, the current week, and the current month, so that support has useful but bounded context.
65. As a Circle Member, I want longer-term group context expressed through reward summaries instead of prayer-by-prayer history, so that sensitive detail is not retained in the social view indefinitely.
66. As a new Circle Member, I want access to shared activity only from the start of my membership and within the bounded history window, so that joining does not reveal pre-membership activity.
67. As a Circle Member, I want a generic Prayer Completion Notification when another member records a completion, so that I can respond without learning whether it was Qada.
68. As a notification recipient, I want to configure each notification type, so that I control interruptions without affecting anyone else's settings.
69. As a user, I do not want an “about to start” social notification in the initial product, so that PrayerPal stays focused on completed-prayer encouragement.
70. As a Circle Member, I want to send a supportive reaction or message after seeing a shared Prayer Completion, so that I can encourage the person directly in context.
71. As a Circle Member, I want a Circle Prayer Ring and Circle Celebration when every current member completes that day's tracked prayers, including Qada, so that the group can celebrate collective consistency without ranking anyone.
72. As a Circle Member, I want to send a Circle Message to all current members, so that the group can communicate within its shared prayer context.
73. As a user, I want to send a Direct Message to another person, so that encouragement can remain private.
74. As a message participant, I want Direct Messages to remain separate from Prayer Circle membership, so that leaving or removal does not erase a private conversation.
75. As a message reader, I want Circle Messages and Direct Messages to be immutable, so that conversation history does not change silently.
76. As a new Circle Member, I want to see Circle Messages only from the date I joined, so that older group conversation remains private to the earlier membership.
77. As a removed or departed Circle Member, I want to lose access to the Prayer Circle and its Circle Messages, so that membership remains the access boundary.
78. As a remaining Circle Member, I want past Circle Messages to remain after another member leaves or is removed, so that the group's history remains coherent.
79. As a Direct Message participant, I want the conversation and its history to remain available after shared Prayer Circle membership ends, so that private communication is not coupled to the group.
80. As a notification recipient, I want messaging notifications to follow my configurable notification settings, so that I control how conversations reach me.
81. As a user, I want to deactivate my account, so that I can stop participating without pretending my history was permanently erased.
82. As a user deactivating my account, I want to be removed from every Prayer Circle, so that my social membership ends immediately.
83. As a returning user, I want my archived prayer history and rewards restored, so that deactivation is recoverable.
84. As a returning user, I want to rejoin Prayer Circles explicitly rather than silently regaining old memberships, so that current members retain control of the circle boundary.
85. As a message reader, I want messages from a deactivated account to remain attributed to the person's display name, so that existing conversations remain understandable.
86. As a user, I want Account Deactivation described differently from permanent deletion, so that I understand that prayer history and rewards are archived for possible restoration.
87. As a user, I want a calm interface with supportive language and no score-like framing, so that the product feels encouraging rather than evaluative.
88. As a user, I want light and dark presentations that preserve legibility and state clarity, so that the app remains comfortable throughout the prayer day.
89. As a user with visual, motor, or motion sensitivity needs, I want scalable text, sufficient contrast, accessible labels, large touch targets, and reduced-motion support, so that I can use the core experience independently.
90. As an iOS or Android user, I want the same domain rules and privacy boundaries on either platform, so that PrayerPal behaves consistently across supported phones.
91. As a prospective user viewing a store listing, I want accurate screenshots and descriptions of PrayerPal's real behavior, so that marketing does not promise a feature or privacy model the product does not provide.
92. As a community member seeing a launch post, I want original PrayerPal branding and platform-appropriate media, so that I can recognise and share the product without confusing it with Pillars.

## Implementation Decisions

- PrayerPal is a greenfield mobile product. The target is consistent iOS and Android behavior; the cross-platform framework, backend technology, authentication provider, prayer-time provider, notification provider, and hosting platform are deliberately not selected by this product spec.
- Use the repository's domain glossary as the canonical language in product copy, code boundaries, analytics, support material, and tests. In particular, use Prayer Circle, Circle Member, Obligatory Prayer, Prayer Window, Timing Configuration, Prayer Outcome, Prayer Completion, Qada Prayer, Encouragement, Circle Message, Direct Message, and Account Deactivation as defined terms.
- Organise the product into deep domain modules for identity and onboarding, prayer timing, the personal prayer record, reward calculation, Prayer Circles and membership, shared activity and Encouragement, notifications, messaging, account lifecycle, and presentation/brand. Keep provider-specific SDKs behind replaceable boundaries.
- Model a user profile with a stable account identity, display name, optional profile photo, one Active Prayer Location, notification preferences, and active or deactivated lifecycle state.
- Required onboarding is complete only after the user has supplied a display name, selected an Active Prayer Location, and explicitly accepted or declined notification permission. Prayer Circle membership and profile photography do not block completion.
- Permit manual Active Prayer Location selection. Location permission may assist selection, but continuous or background location access is not a prerequisite for the core product.
- Start with one precisely named Hanafi Timing Configuration supplied through a replaceable provider boundary. Display its location, calculation method, juristic-school setting, and adjustments. Do not encode the word Hanafi as a substitute for the full configuration.
- The device timezone determines local midnight, the current prayer date, and Prayer Window evaluation. Persist enough event-time context—UTC timestamp, device timezone, local prayer date, Obligatory Prayer identity, and Timing Configuration version or snapshot—to prevent later location or timezone changes from silently re-dating historical records.
- Represent the personal record as one Prayer Outcome per user, prayer date, and Obligatory Prayer. Supported outcomes are completed, not completed, and Qada; Friday substitutes Jumu'ah for Dhuhr, and Jumu'ah does not accept Qada.
- Treat an unfinished Prayer Outcome as open during the prayer day and finalise it as not completed at local midnight. Allow the user to replace any historical outcome later.
- Do not separately model Fard, Sunnah, Witr, proof, verification, or religious adjudication in the initial outcome model.
- Make Prayer Outcome changes the source of truth. Derive Daily Prayer Badges, Prayer Rings, Consistency Streaks, Perfect Prayer Streaks, weekly and monthly summaries, the Annual Perfect Prayer Reward, and Circle Celebrations from the current history rather than storing them as irreversible achievements.
- On-time completion earns a gold Daily Prayer Badge. Qada earns a silver Daily Prayer Badge, preserves the Consistency Streak, and breaks the Perfect Prayer Streak. A not-completed outcome breaks both streak types.
- Recalculate all affected derived rewards after a historical change. If a change invalidates a Circle Celebration, withdraw that celebration and update affected Prayer Rings and summaries.
- Model Prayer Circles with mutable name, optional photo, optional description, discoverability, active or archived state, and a set of equal Circle Memberships. Do not model a creator-owner or administrator role.
- Centralise Prayer Circle authorisation around active membership. Every active Circle Member may approve name-based join requests, generate or revoke Circle Invite Links, remove another member, edit circle metadata and discoverability, and leave.
- A discoverable-circle query returns only circle name and member count. Prayer activity, Encouragement, Circle Messages, and member-level details require active membership.
- Model name-based discovery as an approval-required join request. Model Circle Invite Links as opaque, revocable, single-use credentials that expire two days after creation. Consume a link atomically so concurrent attempts cannot admit more than one user.
- Preserve a pending valid invitation through sign-in, sign-up, and required onboarding, then join the recipient directly without a second approval.
- Do not impose a Prayer Circle size limit in the initial product. When the final member leaves, archive the circle and remove it from discovery rather than deleting it.
- Create shared activity only from a Prayer Completion. Never create Circle Activity History from a not-completed outcome, and never expose whether a shared completion was on time or Qada.
- Limit detailed Circle Activity History to today, the current week, and the current month. Show longer-term progress only as aggregate reward summaries.
- Treat membership start and end timestamps as social-visibility boundaries. A new Circle Member sees shared activity and Circle Messages from their membership start onward; a former member cannot retrieve circle activity or messages after membership ends.
- Fan out a generic Prayer Completion Notification to eligible members of every relevant Prayer Circle, subject to each recipient's settings. Notification content must not disclose Qada, a missed prayer, or private historical detail.
- Keep each notification category independently configurable and degrade gracefully when operating-system permission is denied. The initial social product does not send “about to start” notifications.
- Model Encouragement as a positive reaction or supportive message attached to visible shared completion activity. Do not introduce negative reactions, nudges, shaming, rankings, or leaderboards.
- A Circle Celebration is eligible when every current Circle Member has completed every Obligatory Prayer for the same labelled prayer date, with Qada counting as complete. Each member's outcomes are evaluated using that member's own device-local prayer day and Timing Configuration; the shared celebration waits until all corresponding local days are complete.
- Model Circle Messages and Direct Messages as append-only Immutable Messages. The initial product has no edit or delete operation.
- Circle Message visibility follows active membership and begins at the recipient's membership start. Direct Message visibility belongs to the two conversation participants and remains independent of Prayer Circle membership.
- Removing or leaving a Prayer Circle revokes access to that circle and its messages but does not close or erase a Direct Message conversation. New Circle Members do not receive older Circle Messages.
- Account Deactivation removes the user from all Prayer Circles, archives prayer history and reward state for restoration, and leaves Immutable Messages in place with the recorded display name. Reactivation restores personal history and rewards but not old Circle Memberships.
- Enforce privacy rules in the service/data-access boundary, not only by hiding controls in the client. Tests must demonstrate that unauthorised users cannot query private outcomes, Qada detail, pre-membership history, or former-circle content.
- Store only the information needed for the product and publish accurate platform privacy disclosures. PrayerPal must not claim that no data leaves the device or that no data is collected, because accounts, Prayer Circles, notifications, and messaging require shared server-side data.
- The entire PrayerPal feature set remains free, with no advertising, subscriptions, paid memberships, or premium feature gates.
- Establish an original PrayerPal design system before feature UI proliferates. The Pillars references support a direction of calm navy foundations, warm peach/coral accents, clear typography, rounded cards, simple illustration, strong current-state emphasis, and coherent day/night presentation; they are a moodboard, not a source library.
- Create original PrayerPal app icons, logo, wordmark, illustrations, UI components, store screenshots, and social templates. Do not ship the Pillars crescent, wordmark, screenshots, illustrations, or marketing layouts unless separate ownership and reuse rights are established.
- Build accessibility into the design system: dynamic/scalable text, contrast that remains sufficient in light and dark presentations, non-colour state cues, screen-reader labels, large touch targets, and reduced-motion alternatives for decorative animation.
- Sequence delivery as vertical, demonstrable phases:
  1. Foundations: choose the client/backend stack, define authentication and privacy/security boundaries, establish the PrayerPal brand/design system, and implement deterministic clock and provider abstractions.
  2. Personal prayer loop: onboarding, Active Prayer Location, Timing Configuration display, Prayer Windows, Friday substitution, daily outcomes, local-midnight finalisation, and historical editing.
  3. Progress: Prayer Rings, badges, consistency and perfect streaks, weekly/monthly summaries, annual reward, and deterministic recalculation.
  4. Prayer Circles: creation, discovery, join requests, equal membership permissions, Circle Invite Links, archival, and membership visibility boundaries.
  5. Shared support: positive-only activity, bounded history, notifications, Encouragement, Circle Rings, and Circle Celebrations.
  6. Communication and lifecycle: Circle Messages, Direct Messages, Account Deactivation, restoration, and message attribution.
  7. Launch readiness: accessibility audit, security/privacy review, operational monitoring, original app-store and social assets, release-candidate testing, and iOS/Android publication preparation.
- Keep each phase usable through the same application-facing seam. Do not build rewards, circles, or messaging as disconnected demonstrations that bypass the real user journey.

## Testing Decisions

- The preferred and highest test seam is the user-visible mobile application backed by the real domain/service layer and deterministic test adapters. Drive complete journeys with one or more test accounts and assert only observable screens, notifications, persisted outcomes, access decisions, messages, and rewards.
- Use one principal end-to-end seam for the core journey: complete onboarding, view Prayer Windows, record and correct Prayer Outcomes, join a Prayer Circle, observe privacy-filtered shared activity, send Encouragement, exchange messages, and deactivate/reactivate an account.
- Introduce narrower contract seams only for external systems that cannot be made deterministic at the application seam: the prayer-time provider, authentication provider, operating-system push transport, and durable storage. Contract tests should verify PrayerPal's assumptions without duplicating third-party implementation tests.
- A good test describes externally meaningful behavior, controls time and timezone explicitly, and remains valid if internal modules or storage are refactored. Tests must not assert private helper calls, framework component trees, database table layouts, or incidental event ordering.
- The deterministic test environment must support setting the current instant, device timezone, Active Prayer Location, prayer-time provider response, notification permission, and delivery outcome.
- Cover normal daily tracking, local-midnight finalisation, historical correction, travel across timezones, Active Prayer Location changes, and preservation of historical prayer dates.
- Cover Friday substitution and prove that Jumu'ah replaces Dhuhr and rejects Qada while other applicable Obligatory Prayers accept Qada.
- Cover reward behavior for on-time completion, Qada, not completed, historical recalculation, 365-day perfection, and withdrawal of an invalidated Circle Celebration.
- Cover Prayer Circle permission symmetry: creator and later members can perform the same allowed membership and metadata operations, and no hidden owner capability exists.
- Cover both join paths: approval after name-based discovery and immediate membership through a valid Circle Invite Link after sign-in or sign-up.
- Cover Circle Invite Link expiry, revocation, single use, concurrent redemption, and continuation through onboarding.
- Cover discovery privacy: non-members can see only discoverable circle names and member counts and cannot retrieve prayer activity, member outcomes, messages, or Encouragement.
- Cover social privacy with adversarial tests: Qada and not-completed outcomes never appear in activity or notification payloads; new members cannot access pre-membership content; removed members immediately lose circle access; Direct Messages remain available to their participants.
- Cover bounded Circle Activity History for today, the current week, and the current month, including boundary changes caused by the viewer's date and timezone.
- Cover notification preference combinations and denied operating-system permission without blocking onboarding or core tracking.
- Cover Immutable Messages, join-date visibility, removal/leave behavior, Direct Message independence, deactivated-author attribution, and restoration after reactivation.
- Cover Account Deactivation removing all Circle Memberships while preserving restorable personal history and leaving old memberships unrestored.
- Run accessibility checks at the application seam for scalable text, semantic labels, focus order, contrast, touch target size, reduced motion, and state cues that do not rely on colour alone.
- Use visual regression checks only for stable design-system primitives and a small set of representative light/dark screens. Treat the Pillars collection as a qualitative reference, not as pixel-matching expected output.
- There is no executable application or existing test suite in the repository, so there is no code-level prior art to copy. The existing domain glossary and architectural decisions are the behavioral oracle; the first phase must establish the reusable application harness that later phases extend.

## Out of Scope

- Reusing, tracing, recolouring, or lightly modifying the Pillars logo, crescent icon, wordmark, illustrations, screenshots, videos, photographs, or promotional layouts as PrayerPal production assets.
- A Qibla compass or direction experience. It appears in the Pillars references but is not part of the current PrayerPal domain decisions.
- A menstruation pause mode. It appears in the Pillars references but its effect on Prayer Outcomes, streaks, sharing, and privacy has not been defined for PrayerPal.
- Multiple jurisprudential schools or a broad catalogue of calculation methods in the initial release; only one fully named Hanafi Timing Configuration is committed.
- Tracking Fard, Sunnah, Witr, optional prayers, prayer units, attendance proof, or verification by another person.
- Public prayer activity, public user profiles, follower networks, rankings, leaderboards, competitive scores, or negative reactions.
- Prayer-start countdown alerts, “about to start” social notifications, or a full adhan feature in the initial product.
- A creator-owner, administrator, moderator, or hierarchy of Prayer Circle roles; all initial Circle Members have equal permissions.
- A circle-size limit or the future close-friends notification concept.
- Message editing, message deletion, content moderation, reporting, and blocking in the initial messaging design. Their absence is a known safety risk rather than an assertion that they will never be needed.
- Permanent account erasure, data export, and jurisdiction-specific retention workflows. This spec defines Account Deactivation only; legal and privacy review must define any additional required account rights before launch.
- Advertising, subscriptions, paid tiers, premium memberships, or monetisation of core features.
- Desktop or web clients, wearables, widgets, and platform integrations beyond the initial iOS and Android mobile experience.
- Running a paid acquisition campaign, obtaining publisher accounts, or executing store submission; the product will prepare original release assets and a release candidate.

## Further Notes

- The source material comprises one domain glossary, nineteen architectural decisions, and fifty-five Pillars reference assets: six logo variants and forty-nine media assets spanning application/onboarding screens, app-store material, launch-story images and video, a Qibla photograph, and platform-specific social media formats.
- The Pillars collection consistently emphasises simplicity, a navy and warm-peach palette, rounded surfaces, friendly illustration, a visual prayer-day arc, strong light/dark treatment, privacy and no-ad messaging, iOS/Android availability, and reusable launch collateral. PrayerPal should learn from this coherence while establishing an original brand suited to private social encouragement.
- Pillars' store material includes a “Data Not Collected” position and onboarding copy claiming that personal data and location never leave the phone. That promise is structurally incompatible with PrayerPal's account, Prayer Circle, notification, and messaging requirements. PrayerPal's privacy advantage must instead come from data minimisation, explicit visibility rules, bounded social history, accurate disclosure, and strong access control.
- The Pillars assets are assumed to be reference material only. Ownership, licensing, trademark, consent, and model/property releases have not been established by the repository; none should be published or used derivatively until those rights are confirmed.
- This spec assumes an iOS and Android mobile product because the reference material and interactions are phone-oriented. It does not choose the implementation framework.
- For Circle Celebrations across timezones, “the same day” means the same displayed calendar-date label, with each member's Prayer Outcomes evaluated under that member's own device-local Prayer Day. This assumption prevents one member's timezone from redefining another member's record and should be validated during the first multi-user prototype.
- The current messaging decision intentionally has no moderation or blocking tools. Because immutable messages and equal member removal powers can create safety and abuse concerns, a launch review must explicitly accept or revise this risk without silently changing the recorded decision.
- The repository is currently planning-only: it has no application scaffold, source-control metadata, package manifest, executable tests, configured issue tracker, or triage-label mapping. This umbrella spec should be decomposed into dependency-ordered implementation tickets after the tracker and initial technology choices are configured.
