import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
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

import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import BookIcon from '@mui/icons-material/Book';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import WarningIcon from '@mui/icons-material/Warning';

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

const GET_COURSES_BY_FACULTY = gql`
  query GetCoursesByFaculty($facultyId: ID!) {
    getCoursesByFaculty(facultyId: $facultyId) {
      id
      courseCode
      title
      description
    }
  }
`;

const GET_ALL_BOOKS = gql`
  query GetAllBooks {
    getAllBooks {
      id
      title
      isbn
    }
  }
`;

const CREATE_COURSE = gql`
  mutation CreateCourse($input: CourseInput!) {
    createCourse(input: $input) {
      id
      courseCode
      title
    }
  }
`;

const ASSIGN_BOOK_TO_COURSE = gql`
  mutation AssignBookToCourse($input: CourseMaterialInput!) {
    assignBookToCourse(input: $input) {
      id
      bookId
      courseId
    }
  }
`;

const courseValidationSchema = yup.object({
  courseCode: yup.string().required('Course code is required'),
  title: yup.string().required('Course title is required'),
  description: yup.string(),
});

export const CourseManagement = () => {
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Form states for assigning book
  const [selectedBookId, setSelectedBookId] = useState('');

  const { data: profileData } = useQuery(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: coursesData, loading: coursesLoading, refetch: refetchCourses } = useQuery(GET_COURSES_BY_FACULTY, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: booksData } = useQuery(GET_ALL_BOOKS);

  const [createCourse] = useMutation(CREATE_COURSE);
  const [assignBook] = useMutation(ASSIGN_BOOK_TO_COURSE);

  // Formik for course creation
  const createFormik = useFormik({
    initialValues: {
      courseCode: '',
      title: '',
      description: '',
    },
    validationSchema: courseValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createCourse({
          variables: {
            input: {
              courseCode: values.courseCode,
              title: values.title,
              description: values.description,
              facultyId
            }
          }
        });
        setIsCourseModalOpen(false);
        resetForm();
        refetchCourses();
      } catch (err) {
        console.error(err);
      }
    }
  });

  const handleAssignBook = async () => {
    if (!selectedCourseId || !selectedBookId) return;
    try {
      await assignBook({
        variables: {
          input: {
            courseId: selectedCourseId,
            bookId: selectedBookId,
            mandatory: true
          }
        }
      });
      setIsAssignModalOpen(false);
      setSelectedBookId('');
      alert('Book assigned to course successfully');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
            Academic Courses
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Manage your courses and learning materials
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setIsCourseModalOpen(true)}
          startIcon={<AddIcon />}
          sx={{ 
            fontWeight: 800, 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            borderRadius: 2.5,
            bgcolor: 'primary.main',
            color: '#fff',
            py: 1.5,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: 'none'
            }
          }}
        >
          Initialize Course
        </Button>
      </Box>

      <Grid container spacing={3}>
        {coursesLoading ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={30} />
              <Typography variant="caption" sx={{ mt: 2, fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                Syncing Course Registry...
              </Typography>
            </Box>
          </Grid>
        ) : coursesData?.getCoursesByFaculty.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ border: '2px dashed', borderColor: 'divider', py: 8, px: 3, textAlign: 'center', borderRadius: 4, bgcolor: 'background.paper' }}>
               <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
               <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em', display: 'block' }}>
                 No active courses registered
               </Typography>
            </Box>
          </Grid>
        ) : (
          coursesData?.getCoursesByFaculty.map((course) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
              <Card 
                sx={{ 
                   
                  borderRadius: 4, 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={course.courseCode} 
                      size="small" 
                      sx={{ 
                        fontSize: '10px', 
                        fontWeight: 900, 
                        bgcolor: 'text.primary', 
                        color: 'background.paper',
                        borderRadius: 1.5,
                        textTransform: 'uppercase'
                      }} 
                    />
                    <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}>
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 850, textTransform: 'uppercase', color: 'text.primary', letterSpacing: '-0.01em', leading: 1.2 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '12px', leading: 1.5 }}>
                      {course.description || 'No description provided.'}
                    </Typography>
                  </Box>
                </CardContent>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: '1px solid', borderColor: 'divider', 
                    bgcolor: 'action.hover', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <BookIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Materials
                    </Typography>
                  </Box>
                  <Button 
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setIsAssignModalOpen(true);
                    }}
                    startIcon={<LinkIcon sx={{ fontSize: 12 }} />}
                    sx={{ 
                      fontSize: '10px', 
                      fontWeight: 800, 
                      textTransform: 'uppercase', 
                      color: 'primary.main',
                      p: 0,
                      minWidth: 0,
                      '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                    }}
                  >
                    Assign Book
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Course Modal */}
      <Modal 
        isOpen={isCourseModalOpen} 
        onClose={() => setIsCourseModalOpen(false)} 
        title="Initialize Course" 
        subtitle="Provision a new academic module in the global registry"
      >
        <Box 
          component="form" 
          onSubmit={createFormik.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Course Code
            </Typography>
            <TextField 
              fullWidth
              id="courseCode"
              name="courseCode"
              placeholder="e.g. CS101"
              value={createFormik.values.courseCode}
              onChange={createFormik.handleChange}
              error={createFormik.touched.courseCode && Boolean(createFormik.errors.courseCode)}
              helperText={createFormik.touched.courseCode && createFormik.errors.courseCode}
              inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace' } }}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Course Title
            </Typography>
            <TextField 
              fullWidth
              id="title"
              name="title"
              placeholder="e.g. Introduction to Neural Networks"
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Description
            </Typography>
            <TextField 
              fullWidth
              id="description"
              name="description"
              multiline
              rows={4}
              placeholder="Module objectives and coverage..."
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
            disabled={!createFormik.values.courseCode || !createFormik.values.title}
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText', 
              py: 2, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderRadius: 3,
              boxShadow: 'none',
              mt: 1,
              '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
              '&:disabled': { bgcolor: 'action.disabled', color: 'text.disabled' }
            }}
          >
            Finalize Module Registry
          </Button>
        </Box>
      </Modal>

      {/* Assign Book Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        title="Link Materials" 
        subtitle="Associate published books with this course module"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <CustomSelect 
            label="Target Resource"
            options={booksData?.getAllBooks.map((b) => ({ id: b.id, name: `${b.title} (ISBN: ${b.isbn})` })) || []}
            value={selectedBookId}
            onChange={setSelectedBookId}
            placeholder="Search published books..."
          />
          <Box sx={{ p: 2.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb', border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(217, 119, 6, 0.25)' : '#fef3c7', borderRadius: 2.5, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
             <WarningIcon sx={{ color: 'warning.main', fontSize: 18, mt: 0.5 }} />
             <Typography variant="caption" sx={{ color: (theme) => theme.palette.mode === 'dark' ? '#fbbf24' : '#b45309', fontWeight: 650, lineHeight: 1.5 }}>
               Only published and validated resources should be assigned to active courses.
             </Typography>
          </Box>
          <Button 
            onClick={handleAssignBook}
            disabled={!selectedBookId}
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: 'primary.main', 
              color: '#fff', 
              py: 2, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderRadius: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
            }}
          >
            Authorize Material Link
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
