export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface AuthContextType extends AuthState {
  login: (authData: LoginResponse) => Promise<void>;
  logout: () => void;
}

export interface LoginResponse {
  user: User;
  token: string;
}