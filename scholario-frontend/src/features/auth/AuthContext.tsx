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

let isKeycloakInitializing = false;
let keycloakInitialized = false;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem('scholario_active_role'));
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (keycloakInitialized) {
      setLoading(false);
      return;
    }
    
    if (isKeycloakInitializing) return;
    isKeycloakInitializing = true;

    const initializeKeycloak = async () => {
      try {
        console.log('[Auth] Initializing Keycloak...');
        const auth = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256',
        });

        keycloakInitialized = true;
        setAuthenticated(auth);
        
        if (auth) {
          console.log('[Auth] Authenticated as:', keycloak.tokenParsed?.preferred_username);
          setToken(keycloak.token || null);
          setUsername(keycloak.tokenParsed?.preferred_username || null);
          
          const keycloakRoles = keycloak.realmAccess?.roles || [];
          const functionalRoles = ['ADMIN', 'FACULTY', 'LIBRARIAN', 'STUDENT'].filter(r => keycloakRoles.includes(r));
          
          if (functionalRoles.length === 0) functionalRoles.push('UNASSIGNED');
          setAllRoles(functionalRoles);

          if (!role || !functionalRoles.includes(role)) {
            const defaultRole = functionalRoles[0];
            setRole(defaultRole);
            localStorage.setItem('scholario_active_role', defaultRole);
          }
        }
      } catch (err) {
        console.error('[Auth] Initialization failed. Check if Keycloak server is running and realm "scholario" exists.', err);
      } finally {
        isKeycloakInitializing = false;
        setLoading(false);
      }
    };

    initializeKeycloak();
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
