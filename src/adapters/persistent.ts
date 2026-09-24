import type {
  AccountCredentials,
  AccountGateway,
  AuthenticatedUser,
  KeyValueStore,
  PrayerOutcomeRecord,
  PrayerOutcomeStore,
  PrayerDayContext,
  PrayerDayContextStore,
  UserProfile,
  UserProfileStore,
} from '../core/types';

const ACCOUNTS_KEY = 'prayerpal.accounts.v1';
const SESSION_KEY = 'prayerpal.session.v1';
const PROFILE_KEY_PREFIX = 'prayerpal.profile.v1:';
const OUTCOMES_KEY_PREFIX = 'prayerpal.outcomes.v1:';
const DAY_CONTEXT_KEY_PREFIX = 'prayerpal.day-context.v1:';

type StoredAccount = AccountCredentials & { userId: string };

export class InMemoryKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.values.delete(key);
  }
}

export class PersistentAuthenticationGateway implements AccountGateway {
  constructor(private readonly storage: KeyValueStore) {}

  async currentUser(): Promise<AuthenticatedUser | null> {
    const sessionUserId = await this.storage.get(SESSION_KEY);
    if (!sessionUserId) return null;
    const accounts = await this.accounts();
    return accounts.some((account) => account.userId === sessionUserId) ? { userId: sessionUserId } : null;
  }

  async createAccount(credentials: AccountCredentials): Promise<AuthenticatedUser> {
    const email = credentials.email.trim().toLowerCase();
    const accounts = await this.accounts();
    if (accounts.some((account) => account.email === email)) {
      throw new Error('An account with this email already exists.');
    }
    const user = { userId: `account-${Date.now()}-${accounts.length + 1}` };
    accounts.push({ ...credentials, email, userId: user.userId });
    await this.saveAccounts(accounts);
    await this.storage.set(SESSION_KEY, user.userId);
    return user;
  }

  async signIn(credentials: AccountCredentials): Promise<AuthenticatedUser> {
    const email = credentials.email.trim().toLowerCase();
    const account = (await this.accounts()).find(
      (candidate) => candidate.email === email && candidate.password === credentials.password,
    );
    if (!account) throw new Error('The email address or password is incorrect.');
    await this.storage.set(SESSION_KEY, account.userId);
    return { userId: account.userId };
  }

  async signOut(): Promise<void> {
    await this.storage.remove(SESSION_KEY);
  }

  private async accounts(): Promise<StoredAccount[]> {
    const serialized = await this.storage.get(ACCOUNTS_KEY);
    return serialized ? JSON.parse(serialized) as StoredAccount[] : [];
  }

  private async saveAccounts(accounts: StoredAccount[]): Promise<void> {
    await this.storage.set(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

export class PersistentUserProfileStore implements UserProfileStore {
  constructor(private readonly storage: KeyValueStore) {}

  async get(userId: string): Promise<UserProfile | null> {
    const serialized = await this.storage.get(`${PROFILE_KEY_PREFIX}${userId}`);
    return serialized ? JSON.parse(serialized) as UserProfile : null;
  }

  async save(profile: UserProfile): Promise<void> {
    await this.storage.set(`${PROFILE_KEY_PREFIX}${profile.userId}`, JSON.stringify(profile));
  }
}

export class PersistentPrayerOutcomeStore implements PrayerOutcomeStore {
  constructor(private readonly storage: KeyValueStore) {}

  async list(userId: string, prayerDate: string): Promise<PrayerOutcomeRecord[]> {
    return (await this.records(userId)).filter((record) => record.prayerDate === prayerDate);
  }

  async save(record: PrayerOutcomeRecord): Promise<void> {
    const records = await this.records(record.userId);
    const index = records.findIndex(
      (candidate) => candidate.prayerDate === record.prayerDate && candidate.prayer === record.prayer,
    );
    if (index === -1) records.push(record);
    else records[index] = record;
    await this.storage.set(`${OUTCOMES_KEY_PREFIX}${record.userId}`, JSON.stringify(records));
  }

  private async records(userId: string): Promise<PrayerOutcomeRecord[]> {
    const serialized = await this.storage.get(`${OUTCOMES_KEY_PREFIX}${userId}`);
    return serialized ? JSON.parse(serialized) as PrayerOutcomeRecord[] : [];
  }
}

export class PersistentPrayerDayContextStore implements PrayerDayContextStore {
  constructor(private readonly storage: KeyValueStore) {}

  async get(userId: string, prayerDate: string): Promise<PrayerDayContext | null> {
    const serialized = await this.storage.get(`${DAY_CONTEXT_KEY_PREFIX}${userId}:${prayerDate}`);
    return serialized ? JSON.parse(serialized) as PrayerDayContext : null;
  }

  async save(userId: string, context: PrayerDayContext): Promise<void> {
    await this.storage.set(`${DAY_CONTEXT_KEY_PREFIX}${userId}:${context.prayerDate}`, JSON.stringify(context));
  }
}
