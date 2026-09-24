import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createApplication } from './runtime';
import { DEMO_LOCATION, MANUAL_LOCATION_OPTIONS } from './adapters/in-memory';
import type { AppSnapshot, HomeSnapshot, PrayerName } from './core/types';

const COLORS = {
  navy: '#172A46',
  peach: '#F58B74',
  cream: '#FFF8F2',
  ink: '#26364B',
  muted: '#6A7788',
  white: '#FFFFFF',
  border: '#E7DDD5',
  success: '#2F7D61',
};

export default function App() {
  const application = useMemo(() => createApplication(), []);
  const [snapshot, setSnapshot] = useState<AppSnapshot | null>(null);

  useEffect(() => {
    void application.start().then(setSnapshot);
  }, [application]);

  if (!snapshot) {
    return <CenteredMessage message="Opening PrayerPal…" />;
  }

  if (snapshot.screen === 'onboarding') {
    return <OnboardingScreen application={application} snapshot={snapshot} onComplete={setSnapshot} />;
  }

  if (snapshot.screen === 'home') {
    return <HomeScreen application={application} snapshot={snapshot} onChange={setSnapshot} />;
  }

  return <WelcomeScreen application={application} onAuthenticated={setSnapshot} />;
}

function WelcomeScreen({
  application,
  onAuthenticated,
}: {
  application: ReturnType<typeof createApplication>;
  onAuthenticated: (snapshot: AppSnapshot) => void;
}) {
  const [mode, setMode] = useState<'create' | 'sign-in'>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function authenticate() {
    try {
      setError(null);
      const snapshot = mode === 'create'
        ? await application.createAccount({ email, password })
        : await application.signIn({ email, password });
      onAuthenticated(snapshot);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to access your account.';
      if (message.startsWith('Account created.')) {
        setMode('sign-in');
      }
      setError(message);
    }
  }

  return (
    <Screen>
      <BrandMark />
      <Text style={styles.eyebrow}>Private encouragement for every prayer day</Text>
      <Text style={styles.title}>{mode === 'create' ? 'Make space for a steadier prayer day.' : 'Welcome back to PrayerPal.'}</Text>
      <Text style={styles.body}>Your account keeps your onboarding profile and Active Prayer Location available when you return. Prayer Circle membership is optional.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{mode === 'create' ? 'Create your account' : 'Sign in to your account'}</Text>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          accessibilityLabel="Email address"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          accessibilityLabel="Password"
          autoCapitalize="none"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={() => void authenticate()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{mode === 'create' ? 'Create account' : 'Sign in'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setError(null);
            setMode(mode === 'create' ? 'sign-in' : 'create');
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>{mode === 'create' ? 'I already have an account' : 'Create a new account'}</Text>
        </Pressable>
      </View>
      <Text style={styles.footnote}>Prayer Outcomes remain private. Prayer Circles share only positive Prayer Completion activity.</Text>
      <StatusBar style="dark" />
    </Screen>
  );
}

function OnboardingScreen({
  application,
  snapshot,
  onComplete,
}: {
  application: ReturnType<typeof createApplication>;
  snapshot: Extract<AppSnapshot, { screen: 'onboarding' }>;
  onComplete: (snapshot: AppSnapshot) => void;
}) {
  const [displayName, setDisplayName] = useState(snapshot.displayName);
  const [location, setLocation] = useState(DEMO_LOCATION);
  const [locationLabel, setLocationLabel] = useState(DEMO_LOCATION.label);
  const [latitude, setLatitude] = useState(String(DEMO_LOCATION.latitude));
  const [longitude, setLongitude] = useState(String(DEMO_LOCATION.longitude));
  const [error, setError] = useState<string | null>(null);

  function updateManualLocation(next: { label?: string; latitude?: string; longitude?: string }) {
    const nextLabel = next.label ?? locationLabel;
    const nextLatitude = next.latitude ?? latitude;
    const nextLongitude = next.longitude ?? longitude;
    setLocationLabel(nextLabel);
    setLatitude(nextLatitude);
    setLongitude(nextLongitude);
    setLocation({
      label: nextLabel,
      latitude: Number.parseFloat(nextLatitude),
      longitude: Number.parseFloat(nextLongitude),
    });
  }

  function chooseLocation(nextLocation: typeof DEMO_LOCATION) {
    setLocation(nextLocation);
    setLocationLabel(nextLocation.label);
    setLatitude(String(nextLocation.latitude));
    setLongitude(String(nextLocation.longitude));
  }

  async function complete(notificationDecision: 'request' | 'declined') {
    try {
      setError(null);
      onComplete(await application.completeOnboarding({
        displayName,
        location,
        notificationDecision,
      }));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to complete onboarding.');
    }
  }

  return (
    <Screen>
      <BrandMark />
      <Text style={styles.eyebrow}>A gentler way to keep going</Text>
      <Text style={styles.title}>Welcome to PrayerPal</Text>
      <Text style={styles.body}>
        A private, encouraging space for your five daily Obligatory Prayers. No rankings. No ads.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>A few things to get started</Text>
        <Text style={styles.label}>Display name</Text>
        <TextInput
          accessibilityLabel="Display name"
          autoCapitalize="words"
          onChangeText={setDisplayName}
          placeholder="How should friends recognise you?"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={displayName}
        />
        <Text style={styles.label}>Active Prayer Location</Text>
        <Text style={styles.locationHint}>Choose it manually. PrayerPal does not need continuous or background location access.</Text>
        <View style={styles.locationOptions}>
          {MANUAL_LOCATION_OPTIONS.map((option) => {
            const selected = option.label === location.label;
            return (
              <Pressable
                key={option.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Active Prayer Location: ${option.label}`}
                onPress={() => chooseLocation(option)}
                style={[styles.locationChoice, selected && styles.selectedLocationChoice]}
              >
                <Text style={styles.locationName}>{option.label}</Text>
                <Text style={styles.locationHint}>{selected ? 'Selected' : 'Select this location'}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.locationHint}>Or enter a location manually</Text>
        <TextInput
          accessibilityLabel="Manual location name"
          onChangeText={(value) => updateManualLocation({ label: value })}
          placeholder="Location name"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
          value={locationLabel}
        />
        <View style={styles.coordinateRow}>
          <TextInput
            accessibilityLabel="Manual location latitude"
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) => updateManualLocation({ latitude: value })}
            placeholder="Latitude"
            placeholderTextColor={COLORS.muted}
            style={[styles.input, styles.coordinateInput]}
            value={latitude}
          />
          <TextInput
            accessibilityLabel="Manual location longitude"
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) => updateManualLocation({ longitude: value })}
            placeholder="Longitude"
            placeholderTextColor={COLORS.muted}
            style={[styles.input, styles.coordinateInput]}
            value={longitude}
          />
        </View>
        <Text style={styles.label}>Notifications</Text>
        <Text style={styles.locationHint}>You can continue if you decline. You can change this later.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={() => void complete('request')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Allow notifications and continue</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void complete('declined')} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Continue without notifications</Text>
        </Pressable>
      </View>
      <Text style={styles.footnote}>Your Prayer Outcomes stay private. Circle activity shares only positive Prayer Completion activity.</Text>
      <StatusBar style="dark" />
    </Screen>
  );
}

function HomeScreen({
  application,
  snapshot,
  onChange,
}: {
  application: ReturnType<typeof createApplication>;
  snapshot: HomeSnapshot;
  onChange: (snapshot: AppSnapshot) => void;
}) {
  async function record(prayer: PrayerName, outcome: 'completed' | 'not-completed') {
    await application.recordPrayerOutcome({ prayerDate: snapshot.localDate, prayer, outcome });
    onChange(await application.home());
  }

  return (
    <Screen>
      <View style={styles.homeHeader}>
        <BrandMark compact />
        <Text style={styles.date}>{snapshot.dayLabel}, {snapshot.localDate}</Text>
        <Text style={styles.title}>Peace be with you, {snapshot.displayName}</Text>
        <Text style={styles.body}>One prayer at a time is still progress.</Text>
      </View>

      <View style={styles.ringCard}>
        <View>
          <Text style={styles.cardTitle}>Today's Prayer Ring</Text>
          <Text style={styles.progress}>{snapshot.prayers.filter(({ outcome }) => outcome === 'completed' || outcome === 'qada').length} of {snapshot.prayers.length} completed</Text>
        </View>
        <View accessible accessibilityLabel="Prayer Ring progress" style={styles.ring}>
          <Text style={styles.ringMark}>✦</Text>
        </View>
      </View>

      {snapshot.prayers.map(({ prayer, window, outcome }) => (
        <View key={prayer} style={[styles.prayerCard, snapshot.nextPrayer === prayer && styles.currentPrayerCard]}>
          <View style={styles.prayerInfo}>
            <Text style={styles.prayerName}>{displayPrayerName(prayer)}</Text>
            <Text style={styles.prayerTime}>{formatTime(window.startsAt)} – {formatTime(window.endsAt)}</Text>
            {snapshot.nextPrayer === prayer ? <Text style={styles.currentLabel}>CURRENT OR NEXT</Text> : null}
          </View>
          {outcome ? (
            <Text style={styles.outcome}>{outcome === 'completed' ? 'Completed' : outcome === 'qada' ? 'Qada' : 'Not completed'}</Text>
          ) : (
            <View style={styles.actionRow}>
              <Pressable accessibilityLabel={`Mark ${prayer} completed`} onPress={() => void record(prayer, 'completed')} style={styles.smallPrimaryButton}>
                <Text style={styles.smallPrimaryText}>Done</Text>
              </Pressable>
              <Pressable accessibilityLabel={`Mark ${prayer} not completed`} onPress={() => void record(prayer, 'not-completed')} style={styles.smallSecondaryButton}>
                <Text style={styles.smallSecondaryText}>Not yet</Text>
              </Pressable>
            </View>
          )}
        </View>
      ))}

      <View style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Your Timing Configuration</Text>
        <Text style={styles.detailsName}>{snapshot.timingConfiguration.name}</Text>
        <Text style={styles.locationHint}>{snapshot.location.label} · {snapshot.timingConfiguration.calculationMethod} · {snapshot.timingConfiguration.juristicSchool}</Text>
        <Text style={styles.locationHint}>Adjustments: none</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => void application.signOut().then(onChange)} style={styles.signOutButton}>
        <Text style={styles.secondaryButtonText}>Sign out</Text>
      </Pressable>
      <StatusBar style="dark" />
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
    </SafeAreaView>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={styles.brandDot}><Text style={styles.brandDotText}>✦</Text></View>
      <Text style={[styles.brand, compact && styles.brandCompact]}>PrayerPal</Text>
    </View>
  );
}

function CenteredMessage({ message }: { message: string }) {
  return <View style={styles.centered}><Text style={styles.body}>{message}</Text></View>;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

function displayPrayerName(prayer: PrayerName): string {
  return prayer === 'Jumuah' ? "Jumu'ah" : prayer;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.cream },
  container: { padding: 24, paddingBottom: 48, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cream, padding: 24 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 20 },
  brandDot: { alignItems: 'center', backgroundColor: COLORS.peach, borderRadius: 18, height: 36, justifyContent: 'center', width: 36 },
  brandDotText: { color: COLORS.navy, fontSize: 20 },
  brand: { color: COLORS.navy, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  brandCompact: { fontSize: 20 },
  eyebrow: { color: COLORS.success, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: COLORS.navy, fontSize: 34, fontWeight: '800', letterSpacing: -1, lineHeight: 40 },
  body: { color: COLORS.ink, fontSize: 17, lineHeight: 25 },
  card: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 24, borderWidth: 1, gap: 12, padding: 20 },
  cardTitle: { color: COLORS.navy, fontSize: 18, fontWeight: '800' },
  label: { color: COLORS.ink, fontSize: 14, fontWeight: '700', marginTop: 6 },
  input: { borderColor: COLORS.border, borderRadius: 12, borderWidth: 1, color: COLORS.ink, fontSize: 16, minHeight: 52, paddingHorizontal: 14 },
  locationChoice: { backgroundColor: '#FFF1EB', borderRadius: 12, padding: 14 },
  locationOptions: { gap: 8 },
  selectedLocationChoice: { borderColor: COLORS.peach, borderWidth: 2 },
  coordinateRow: { flexDirection: 'row', gap: 8 },
  coordinateInput: { flex: 1 },
  locationName: { color: COLORS.navy, fontSize: 16, fontWeight: '700' },
  locationHint: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  error: { color: '#B33F3F', fontSize: 14 },
  primaryButton: { alignItems: 'center', backgroundColor: COLORS.navy, borderRadius: 14, minHeight: 52, justifyContent: 'center', marginTop: 8, paddingHorizontal: 14 },
  primaryButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  secondaryButton: { alignItems: 'center', borderColor: COLORS.navy, borderRadius: 14, borderWidth: 1, minHeight: 52, justifyContent: 'center', paddingHorizontal: 14 },
  secondaryButtonText: { color: COLORS.navy, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  footnote: { color: COLORS.muted, fontSize: 13, lineHeight: 19, paddingHorizontal: 4 },
  homeHeader: { gap: 8 },
  date: { color: COLORS.success, fontSize: 14, fontWeight: '700', marginTop: -8 },
  ringCard: { alignItems: 'center', backgroundColor: COLORS.navy, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  progress: { color: COLORS.white, fontSize: 16, marginTop: 6 },
  ring: { alignItems: 'center', borderColor: COLORS.peach, borderRadius: 38, borderWidth: 5, height: 76, justifyContent: 'center', width: 76 },
  ringMark: { color: COLORS.peach, fontSize: 28 },
  prayerCard: { alignItems: 'center', backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 18, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 82, padding: 16 },
  currentPrayerCard: { borderColor: COLORS.peach, borderWidth: 2 },
  prayerInfo: { flex: 1, gap: 4 },
  prayerName: { color: COLORS.navy, fontSize: 18, fontWeight: '800' },
  prayerTime: { color: COLORS.muted, fontSize: 14 },
  currentLabel: { color: COLORS.peach, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  actionRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  smallPrimaryButton: { alignItems: 'center', backgroundColor: COLORS.success, borderRadius: 10, justifyContent: 'center', minHeight: 42, paddingHorizontal: 14 },
  smallPrimaryText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  smallSecondaryButton: { alignItems: 'center', borderColor: COLORS.border, borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 42, paddingHorizontal: 12 },
  smallSecondaryText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  outcome: { color: COLORS.success, fontSize: 14, fontWeight: '800' },
  detailsCard: { backgroundColor: '#FFF1EB', borderRadius: 18, gap: 6, padding: 18 },
  detailsName: { color: COLORS.navy, fontSize: 15, fontWeight: '700' },
  signOutButton: { alignItems: 'center', borderColor: COLORS.border, borderRadius: 14, borderWidth: 1, minHeight: 48, justifyContent: 'center' },
});
