import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

interface AuthContextType {
  token: string | null;
  role: string | null;
  allRoles: string[];
  username: string | null;
  authenticated: boolean;
  logout: () => void;
  switchRole: (newRole: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem('scholario_active_role'));
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then((auth) => {
        setAuthenticated(auth);
        if (auth) {
          setToken(keycloak.token || null);
          setUsername(keycloak.tokenParsed?.preferred_username || null);
          
          const keycloakRoles = keycloak.realmAccess?.roles || [];
          const functionalRoles = ['ADMIN', 'FACULTY', 'LIBRARIAN', 'STUDENT'].filter(r => keycloakRoles.includes(r));
          
          if (functionalRoles.length === 0) {
            functionalRoles.push('UNASSIGNED');
          }
          
          setAllRoles(functionalRoles);

          // If current role is not in the new roles list, or no role set, pick highest priority
          if (!role || !functionalRoles.includes(role)) {
            const defaultRole = functionalRoles[0];
            setRole(defaultRole);
            localStorage.setItem('scholario_active_role', defaultRole);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        console.error('Keycloak initialization failed');
        setLoading(false);
      });
  }, []);

  const switchRole = (newRole: string) => {
    if (allRoles.includes(newRole)) {
      setRole(newRole);
      localStorage.setItem('scholario_active_role', newRole);
    }
  };

  const logout = () => {
    localStorage.removeItem('scholario_active_role');
    keycloak.logout();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ token, role, allRoles, username, authenticated, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { keycloak };
