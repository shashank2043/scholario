import { createContext, useContext, useState, useEffect } from 'react';
import Keycloak from 'keycloak-js';
import { CircularProgress, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

const AuthContext = createContext(null);

let isKeycloakInitializing = false;
let keycloakInitialized = false;

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('scholario_active_role'));
  const [allRoles, setAllRoles] = useState([]);
  const [username, setUsername] = useState(null);
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

  const [show401Dialog, setShow401Dialog] = useState(false);

  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.detail?.status === 401) {
        setShow401Dialog(true);
      }
    };

    window.addEventListener('graphql-auth-error', handleAuthError);
    return () => {
      window.removeEventListener('graphql-auth-error', handleAuthError);
    };
  }, []);

  const switchRole = (newRole) => {
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
    return (
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          bgcolor: 'background.default',
          zIndex: 9999
        }}
      >
        <CircularProgress size={50} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2, fontWeight: 500, color: 'text.secondary' }}>
          Loading authentication...
        </Typography>
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ token, role, allRoles, username, authenticated, logout, switchRole }}>
      {children}
      <Dialog
        open={show401Dialog}
        onClose={() => setShow401Dialog(false)}
        aria-labelledby="auth-error-dialog-title"
        aria-describedby="auth-error-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
            }
          }
        }}
      >
        <DialogTitle id="auth-error-dialog-title" sx={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '15px' }}>
          Session Expired (401)
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="auth-error-dialog-description" sx={{ fontSize: '13px', color: 'text.secondary' }}>
            A request returned a 401 Unauthorized status indicating your secure session has expired or is invalid. Do you want to logout now?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setShow401Dialog(false)}
            variant="outlined"
            sx={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              borderRadius: 2, 
              color: 'text.secondary',
              borderColor: 'divider'
            }}
          >
            No
          </Button>
          <Button 
            onClick={() => {
              setShow401Dialog(false);
              logout();
            }}
            variant="contained"
            color="error"
            autoFocus
            sx={{ 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              borderRadius: 2 
            }}
          >
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { keycloak };
