import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress
} from '@mui/material';

import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
    }
  }
`;

export const StudentCourses = () => {
  const { data: profileData, loading } = useQuery(GET_MY_PROFILE);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box component="header">
        <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
          My Academic Modules
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Tracking enrolled courses and associated learning materials
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card 
            sx={{ 
               
              borderRadius: 5,
              py: 8,
              px: 3,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
             <Box sx={{ w: 80, h: 80, bgcolor: '#f0f2fe', color: 'primary.main', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <SchoolIcon sx={{ fontSize: 40 }} />
             </Box>
             <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.primary', mb: 1 }}>
               Enrollment Matrix Pending
             </Typography>
             <Typography variant="body2" sx={{ color: 'text.secondary', maxW: '300px', mx: 'auto', fontWeight: 500, lineHeight: 1.5 }}>
               The digital course registry is being synchronized with your student ID.
             </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'text.secondary', ml: 1 }}>
               Digital Syllabus Feed
             </Typography>
             <Card sx={{ bgcolor: '#111827', color: '#fff', p: 3, borderRadius: 5, border: 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                   <Box sx={{ w: 8, h: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                   <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#10b981' }}>
                     Global Telemetry Active
                   </Typography>
                </Box>
                <Typography sx={{ fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary', lineHeight: 1.6 }}>
                   [SYSTEM] Scanning academic nodes...<br/>
                   [SYSTEM] Verifying enrollment tokens...<br/>
                   [STABLE] Connection established.
                </Typography>
             </Card>
             
             <Card sx={{  borderRadius: 5, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: 'text.primary' }}>
                   <BookIcon sx={{ color: 'primary.main' }} />
                   <Typography variant="caption" sx={{ fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     Material Archive
                   </Typography>
                </Box>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary', fontStyle: 'italic', fontWeight: 500 }}>
                  "Access to course materials will be enabled upon module authorization."
                </Typography>
             </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
