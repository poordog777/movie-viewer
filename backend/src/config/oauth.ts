import { env } from './env';

export const googleOAuthConfig = {
  clientID: env.googleClientId!,
  clientSecret: env.googleClientSecret!,
  callbackURL: `${env.apiUrl}/api/v1/auth/google/callback`,
  scope: ['profile', 'email']
};
