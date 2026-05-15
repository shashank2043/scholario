import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { keycloak, keycloakState } from '../../lib/keycloak';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(localStorage.getItem('scholario_active_role'));
  const [allRoles, setAllRoles] = useState<string[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(!keycloakState.initialized);

  useEffect(() => {
    if (keycloakState.started || keycloakState.initialized) {
        if (keycloakState.initialized) {
            const t = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(t);
        }
        return;
    }
    keycloakState.started = true;

    const initializeKeycloak = async () => {
      try {
        const auth = await keycloak.init({
          onLoad: 'login-required',
          checkLoginIframe: false,
          pkceMethod: 'S256',
        });

        keycloakState.initialized = true;
        setAuthenticated(auth);
        
        if (auth) {
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
        console.error('[Auth] Initialization failed.', err);
      } finally {
        keycloakState.started = false;
        setLoading(false);
      }
    };

    initializeKeycloak();
  }, [role]);

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
