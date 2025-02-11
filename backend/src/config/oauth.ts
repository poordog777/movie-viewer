import { env } from './env';

export const googleOAuthConfig = {
  clientID: env.googleClientId!,
  clientSecret: env.googleClientSecret!,
  callbackURL: `${env.apiUrl}/api/v1/auth/google/callback`,
  scope: ['profile', 'email']
};

// state 參數管理
export class StateManager {
  private static states = new Set<string>();
  private static readonly EXPIRY_TIME = 60 * 60 * 1000; // 60 分鐘
  private static timers = new Set<NodeJS.Timeout>();

  static generateState(): string {
    const state = Math.random().toString(36).substring(2);
    this.states.add(state);

    // 設定狀態過期
    const timer = setTimeout(() => {
      this.states.delete(state);
      this.timers.delete(timer);
    }, this.EXPIRY_TIME);

    this.timers.add(timer);
    return state;
  }

  static verifyState(state: string): boolean {
    const isValid = this.states.has(state);
    if (isValid) {
      this.states.delete(state);
    }
    return isValid;
  }

  static clearExpiredStates(): void {
    this.states.clear();
  }

  static clearTimers(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}