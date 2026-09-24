import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AccountCredentials,
  AuthenticatedUser,
  SocialAccountGateway,
  SocialAuthProvider,
} from '../core/types';
import { SupabaseAuthenticationGateway } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export class SupabaseSocialAuthenticationGateway implements SocialAccountGateway {
  private readonly account: SupabaseAuthenticationGateway;

  constructor(
    private readonly client: SupabaseClient,
    private readonly redirectTo = makeRedirectUri({ scheme: 'prayerpal', path: 'auth/callback' }),
  ) {
    this.account = new SupabaseAuthenticationGateway(client);
  }

  currentUser(): Promise<AuthenticatedUser | null> {
    return this.account.currentUser();
  }

  createAccount(credentials: AccountCredentials): Promise<AuthenticatedUser> {
    return this.account.createAccount(credentials);
  }

  signIn(credentials: AccountCredentials): Promise<AuthenticatedUser> {
    return this.account.signIn(credentials);
  }

  signOut(): Promise<void> {
    return this.account.signOut();
  }

  async signInWithProvider(provider: SocialAuthProvider): Promise<AuthenticatedUser> {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: this.redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) throw new Error(error.message);
    if (!data.url) {
      throw new Error(`Supabase did not return an OAuth URL for ${provider}.`);
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, this.redirectTo);
    if (result.type !== 'success') {
      throw new Error(`${provider[0].toUpperCase()}${provider.slice(1)} sign-in was cancelled.`);
    }

    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) {
      throw new Error(params.error_description ?? errorCode);
    }

    if (params.code) {
      const exchanged = await this.client.auth.exchangeCodeForSession(params.code);
      if (exchanged.error) throw new Error(exchanged.error.message);
      if (exchanged.data.user) return { userId: exchanged.data.user.id };
    } else if (params.access_token && params.refresh_token) {
      const session = await this.client.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (session.error) throw new Error(session.error.message);
      if (session.data.user) return { userId: session.data.user.id };
    }

    throw new Error(`Supabase did not return a session for ${provider} sign-in.`);
  }
}
