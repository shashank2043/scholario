import { createContext } from 'react';

export interface AuthContextType {
  token: string | null;
  role: string | null;
  allRoles: string[];
  username: string | null;
  authenticated: boolean;
  logout: () => void;
  switchRole: (newRole: string) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
