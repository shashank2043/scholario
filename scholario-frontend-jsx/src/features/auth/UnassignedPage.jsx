import { useAuth } from '../auth/AuthContext';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Navigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LogoutIcon from '@mui/icons-material/Logout';
import CircleIcon from '@mui/icons-material/FiberManualRecord';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      username
      email
      fullName
      roles
    }
  }
`;

export const UnassignedPage = () => {
  const { logout, username, role } = useAuth();
  
  const { loading } = useQuery(GET_MY_PROFILE, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('[Auth] User profile synced with backend:', data?.getMyProfile?.username);
    },
    onError: (error) => {
      console.error('[Auth] Profile sync failed:', error);
    }
  });

  if (role && role !== 'UNASSIGNED') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 2 
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', p: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Box display="flex" justifyContent="center" mb={3}>
            <Box 
              sx={{ 
                p: 2, 
                backgroundColor: '#fffbeb', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              {loading ? (
                <CircularProgress size={48} sx={{ color: '#d97706' }} />
              ) : (
                <WarningAmberIcon sx={{ fontSize: 48, color: '#d97706' }} />
              )}
            </Box>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {loading ? 'Synchronizing Account...' : 'Account Unassigned'}
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Hello <strong>{username}</strong>, your account has been successfully authenticated, but you haven't been assigned a functional role yet.
          </Typography>
          
          <Box 
            sx={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fef3c7', 
              borderRadius: 2, 
              p: 2, 
              mb: 4, 
              textAlign: 'left' 
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#b45309', mb: 1 }}>
              What should I do?
            </Typography>
            <List dense disablePadding>
              <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 6, color: '#b45309' }} />
                </ListItemIcon>
                <ListItemText primary="Your account is being registered in our system." sx={{ m: 0, '& .MuiTypography-root': { fontSize: '0.875rem', color: '#b45309' } }} />
              </ListItem>
              <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 6, color: '#b45309' }} />
                </ListItemIcon>
                <ListItemText primary="Contact your system administrator for role assignment." sx={{ m: 0, '& .MuiTypography-root': { fontSize: '0.875rem', color: '#b45309' } }} />
              </ListItem>
              <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 20, mt: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 6, color: '#b45309' }} />
                </ListItemIcon>
                <ListItemText primary="Request a role (Faculty, Student, or Librarian)." sx={{ m: 0, '& .MuiTypography-root': { fontSize: '0.875rem', color: '#b45309' } }} />
              </ListItem>
            </List>
          </Box>

          <Button
            variant="contained"
            color="inherit"
            fullWidth
            onClick={logout}
            startIcon={<LogoutIcon />}
            sx={{ 
              backgroundColor: '#1f2937', 
              color: '#fff', 
              py: 1.5, 
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#111827'
              }
            }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};
