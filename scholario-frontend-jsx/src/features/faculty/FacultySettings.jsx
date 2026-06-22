import { useEffect } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  Chip, 
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import UserIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';
import ShieldIcon from '@mui/icons-material/Shield';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      username
      email
      fullName
      roles
      department {
        name
        code
      }
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: ProfileInput!) {
    updateUserProfile(input: $input) {
      id
      fullName
      email
    }
  }
`;

const validationSchema = yup.object({
  fullName: yup.string().required('Full identity name is required'),
  email: yup.string().email('Enter a valid email address').required('Registry email is required'),
});

export const FacultySettings = () => {
  const { data, loading, refetch } = useQuery(GET_MY_PROFILE);
  const [updateProfile, { loading: updating }] = useMutation(UPDATE_PROFILE);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await updateProfile({
          variables: {
            input: values
          }
        });
        alert('Profile updated successfully');
        refetch();
      } catch (err) {
        console.error(err);
        alert('Failed to update profile');
      }
    },
  });

  useEffect(() => {
    if (data?.getMyProfile) {
      formik.setValues({
        fullName: data.getMyProfile.fullName || '',
        email: data.getMyProfile.email || '',
      });
    }
  }, [data]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 8 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2, fontWeight: 900, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
          Accessing Secure Profile...
        </Typography>
      </Box>
    );
  }

  const profile = data?.getMyProfile;

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box component="header">
        <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
          Faculty Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Manage your academic identity and portal settings
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{  borderRadius: 3, p: 3, textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  w: 80, 
                  h: 80, 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText', mx: 'auto', 
                  mb: 2,
                  boxShadow: (theme) => `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`
                }}
              >
                <UserIcon sx={{ fontSize: 40, color: 'inherit' }} />
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'text.primary' }}>
                {profile?.fullName}
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 700, mt: 0.5, display: 'block', mb: 3 }}>
                @{profile?.username}
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2.5, border: '1px solid', borderColor: 'divider', textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                  <SchoolIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Department
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'text.primary' }}>
                  {profile?.department?.name || 'Unassigned'}
                </Typography>
                <Typography sx={{ fontSize: '10px', fontFamily: 'monospace', color: 'text.secondary', mt: 0.5 }}>
                  {profile?.department?.code || 'N/A'}
                </Typography>
              </Box>
            </Card>

            <Card sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.1)' : '#111827', color: (theme) => theme.palette.mode === 'dark' ? 'text.primary' : '#fff', p: 3, borderRadius: 3, border: 'none' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShieldIcon sx={{ fontSize: 16 }} /> Portal Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Auth Level</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main', textTransform: 'uppercase' }}>Faculty</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>Global Access</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: '#10b981', textTransform: 'uppercase' }}>Enabled</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card 
            component="form" 
            onSubmit={formik.handleSubmit}
            sx={{ 
               
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'text.primary' }}>
                Identity Settings
              </Typography>
            </Box>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <UserIcon sx={{ fontSize: 14 }} /> Full Identity Name
                </Typography>
                <TextField 
                  fullWidth
                  id="fullName"
                  name="fullName"
                  variant="outlined"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'background.default', '& fieldset': { borderColor: 'divider' },
                      '&:hover fieldset': { borderColor: 'text.secondary' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MailIcon sx={{ fontSize: 14 }} /> Registry Email
                </Typography>
                <TextField 
                  fullWidth
                  id="email"
                  name="email"
                  variant="outlined"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: 'background.default', '& fieldset': { borderColor: 'divider' },
                      '&:hover fieldset': { borderColor: 'text.secondary' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    }
                  }}
                />
              </Box>

              <Box sx={{ pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContext: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  onClick={() => refetch()}
                  startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                  sx={{ 
                    color: 'text.secondary', 
                    fontSize: '11px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    '&:hover': { bgcolor: 'background.default' }
                  }}
                >
                  Reload Data
                </Button>
                
                <Button 
                  type="submit"
                  disabled={updating}
                  variant="contained"
                  startIcon={updating ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SaveIcon />}
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: '#fff', 
                    py: 1.5, 
                    px: 3,
                    fontWeight: 800, 
                    fontSize: '11px',
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderRadius: 3,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
                    '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
                  }}
                >
                  Synchronize Changes
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3,  borderRadius: 3, p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <ShieldIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> Infrastructure Security
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                Reset your secure access credentials.
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              sx={{ 
                fontSize: '10px', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                borderRadius: 2,
                borderColor: 'divider',
                color: 'text.primary',
                px: 2.5,
                py: 1,
                '&:hover': { borderColor: '#d1d5db', bgcolor: 'background.default' }
              }}
            >
              Change Password
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
