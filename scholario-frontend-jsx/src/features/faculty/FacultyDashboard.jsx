import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  TextField, 
  IconButton, 
  Chip, 
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import BookIcon from '@mui/icons-material/Book';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';

import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      fullName
    }
  }
`;

const GET_FACULTY_STATS = gql`
  query GetFacultyStats($facultyId: ID!) {
    getBooksByFaculty(facultyId: $facultyId) {
      id
      state {
        type
      }
    }
    getCoursesByFaculty(facultyId: $facultyId) {
      id
    }
    getFacultyPerformance(facultyId: $facultyId) {
      totalStudentEngagement
    }
    getMyNotifications {
      id
      type
      message
      createdAt
    }
  }
`;

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
    }
  }
`;

const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      id
      title
      isbn
    }
  }
`;

const bookValidationSchema = yup.object({
  title: yup.string().required('Publication title is required'),
  isbn: yup.string().required('Registry ISBN is required'),
  description: yup.string(),
});

const StatCard = ({ icon: Icon, label, value, darkBg, darkColor, lightBg, lightColor }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'primary.main',
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', p: '20px !important' }}>
      <Box>
        <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        display: 'flex', 
        bgcolor: (theme) => theme.palette.mode === 'dark' ? darkBg : lightBg, 
        color: (theme) => theme.palette.mode === 'dark' ? darkColor : lightColor 
      }}>
        <Icon />
      </Box>
    </CardContent>
  </Card>
);

export const FacultyDashboard = () => {
  const navigate = useNavigate();
  const { data: profileData } = useQuery(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: statsData, loading: statsLoading } = useQuery(GET_FACULTY_STATS, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS);
  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: ['GetFacultyStats'],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formik for Drafting a Resource
  const createFormik = useFormik({
    initialValues: {
      title: '',
      isbn: '',
      description: '',
      departmentId: ''
    },
    validationSchema: bookValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createBook({
          variables: {
            input: {
              title: values.title,
              isbn: values.isbn,
              description: values.description
            }
          }
        });
        setIsModalOpen(false);
        resetForm();
        navigate('/faculty/books');
      } catch (err) {
        console.error('Error creating book:', err);
      }
    }
  });

  const bookCount = statsData?.getBooksByFaculty.length || 0;
  const courseCount = statsData?.getCoursesByFaculty.length || 0;
  const publishedCount = statsData?.getBooksByFaculty.filter((b) => b.state.type === 'PUBLISHED').length || 0;
  const studentImpact = statsData?.getFacultyPerformance?.totalStudentEngagement || 0;
  const notifications = statsData?.getMyNotifications || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'end' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 1, borderRadius: 2, display: 'flex' }}>
              <DashboardIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 850, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Academic Command
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 600 }}>
            FACULTY_ID: {facultyId?.substring(0, 8) || 'SYNCING'} 
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setIsModalOpen(true)}
          startIcon={<AddCircleIcon />}
          sx={{ 
            fontWeight: 800, 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            borderRadius: 2.5,
            bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark',
              boxShadow: 'none'
            }
          }}
        >
          Draft New Resource
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={BookIcon} label="Authored Books" value={statsLoading ? '...' : bookCount} lightBg="#eff6ff" lightColor="#1d4ed8" darkBg="rgba(29, 78, 216, 0.15)" darkColor="#60a5fa" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={SchoolIcon} label="Active Courses" value={statsLoading ? '...' : courseCount} lightBg="#e0e7ff" lightColor="#4338ca" darkBg="rgba(67, 56, 202, 0.15)" darkColor="#818cf8" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={StarIcon} label="Published Works" value={statsLoading ? '...' : publishedCount} lightBg="#ecfdf5" lightColor="#047857" darkBg="rgba(4, 120, 87, 0.15)" darkColor="#34d399" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={PeopleIcon} label="Student Impact" value={statsLoading ? '...' : studentImpact} lightBg="#fffbeb" lightColor="#b45309" darkBg="rgba(180, 83, 9, 0.15)" darkColor="#fbbf24" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity Column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 18 }} /> Recent Activity Registry
              </Typography>
              <Button sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', p: 0, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}>
                View All Archive
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {notifications.length === 0 ? (
                <Box sx={{ border: '1px dashed', borderColor: 'divider', py: 6, textAlign: 'center', borderRadius: 3, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                    No recent activity detected
                  </Typography>
                </Box>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <Box 
                    key={notif.id} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.default', 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ w: 40, h: 40, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', p: 1 }}>
                        {notif.type === 'BOOK' ? <BookIcon sx={{ fontSize: 20 }} /> : <WarningIcon sx={{ fontSize: 20 }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '13.5px', fontWeight: 800, color: 'text.primary', leading: 1.2 }}>
                          {notif.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '9px', mt: 0.5, display: 'block' }}>
                          Type: {notif.type} // {new Date(notif.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                    <ChevronRightIcon sx={{ color: '#d1d5db' }} />
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Action Menu Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, border: 'none', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.1)' : '#111827', color: (theme) => theme.palette.mode === 'dark' ? 'text.primary' : '#fff' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#9ca3af', display: 'block', mb: 2.5 }}>
                Infrastructure Hub
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  onClick={() => navigate('/faculty/books')}
                  fullWidth 
                  variant="contained"
                  sx={{ 
                    justifyContent: 'space-between', 
                    py: 2, 
                    px: 2.5,
                    borderRadius: 3, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#1f2937', 
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary', boxShadow: 'none' }
                  }}
                  endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
                >
                  Publication Engine
                </Button>
                <Button 
                  onClick={() => navigate('/faculty/courses')}
                  fullWidth 
                  variant="contained"
                  sx={{ 
                    justifyContent: 'space-between', 
                    py: 2, 
                    px: 2.5,
                    borderRadius: 3, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#1f2937', 
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary', boxShadow: 'none' }
                  }}
                  endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
                >
                  Curriculum Master
                </Button>
                <Button 
                  onClick={() => navigate('/faculty/settings')}
                  fullWidth 
                  variant="contained"
                  sx={{ 
                    justifyContent: 'space-between', 
                    py: 2, 
                    px: 2.5,
                    borderRadius: 3, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#1f2937', 
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'action.hover', color: 'text.primary', boxShadow: 'none' }
                  }}
                  endIcon={<ChevronRightIcon sx={{ fontSize: 14 }} />}
                >
                  Identity Matrix
                </Button>
              </Box>
            </Card>

            <Box sx={{ 
              p: 3, 
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : '#f0f2fe', 
              border: '1px solid', 
              borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#e0e4fe', 
              borderRadius: 4, 
              display: 'flex', 
              gap: 1.5, 
              alignItems: 'flex-start' 
            }}>
              <WarningIcon sx={{ color: 'primary.main', fontSize: 20, mt: 0.5 }} />
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: (theme) => theme.palette.mode === 'dark' ? 'primary.light' : '#312e81', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                  Policy Alert
                </Typography>
                <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#4f46e5', fontWeight: 550, leading: 1.5, fontSize: '11px' }}>
                  All academic resources must undergo peer-review before global publication.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Draft Resource Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Draft Resource" 
        subtitle="Initialize a new publication in the Scholario registry"
      >
        <Box 
          component="form" 
          onSubmit={createFormik.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Publication Title
            </Typography>
            <TextField 
              fullWidth
              id="title"
              name="title"
              placeholder="e.g. Advanced Quantum Mechanics"
              value={createFormik.values.title}
              onChange={createFormik.handleChange}
              error={createFormik.touched.title && Boolean(createFormik.errors.title)}
              helperText={createFormik.touched.title && createFormik.errors.title}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: 'background.default',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'text.secondary' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                }
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
                  Registry ISBN
                </Typography>
                <TextField 
                  fullWidth
                  id="isbn"
                  name="isbn"
                  placeholder="978-..."
                  value={createFormik.values.isbn}
                  onChange={createFormik.handleChange}
                  error={createFormik.touched.isbn && Boolean(createFormik.errors.isbn)}
                  helperText={createFormik.touched.isbn && createFormik.errors.isbn}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: 'background.default',
                      '& fieldset': { borderColor: 'divider' },
                      '&:hover fieldset': { borderColor: 'text.secondary' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomSelect 
                label="Authored Dept"
                options={deptData?.getDepartments.map((d) => ({ id: d.id, name: d.name })) || []}
                value={createFormik.values.departmentId}
                onChange={(val) => createFormik.setFieldValue('departmentId', val)}
                placeholder={deptLoading ? "Syncing..." : "Select Unit"}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Resource Abstract
            </Typography>
            <TextField 
              fullWidth
              id="description"
              name="description"
              multiline
              rows={4}
              placeholder="Module summary and publication scope..."
              value={createFormik.values.description}
              onChange={createFormik.handleChange}
              error={createFormik.touched.description && Boolean(createFormik.errors.description)}
              helperText={createFormik.touched.description && createFormik.errors.description}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: 'background.default',
                  '& fieldset': { borderColor: 'divider' },
                  '&:hover fieldset': { borderColor: 'text.secondary' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                }
              }}
            />
          </Box>

          <Button 
            type="submit"
            disabled={createFormik.isSubmitting || deptLoading}
            variant="contained"
            fullWidth
            startIcon={createFormik.isSubmitting ? <CircularProgress size={14} sx={{ color: 'background.paper' }} /> : <SendIcon sx={{ fontSize: 16 }} />}
            sx={{ 
              bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
              '&:disabled': { bgcolor: 'action.disabled', color: 'text.disabled' }
            }}
          >
            Initialize Publication
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
