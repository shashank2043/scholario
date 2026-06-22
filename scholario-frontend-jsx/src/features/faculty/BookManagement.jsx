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
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LaunchIcon from '@mui/icons-material/Launch';

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

const GET_BOOKS_BY_FACULTY = gql`
  query GetBooksByFaculty($facultyId: ID!) {
    getBooksByFaculty(facultyId: $facultyId) {
      id
      title
      isbn
      state {
        type
      }
      createdAt
    }
  }
`;

const GET_FACULTY_LIST = gql`
  query GetFacultyList {
    getFacultyList {
      id
      fullName
      username
    }
  }
`;

const SUBMIT_FOR_REVIEW = gql`
  mutation SubmitForReview($bookId: ID!, $reviewerId: ID) {
    submitBookForReview(bookId: $bookId, reviewerId: $reviewerId) {
      id
      status
    }
  }
`;

const PUBLISH_BOOK = gql`
  mutation PublishBook($id: ID!) {
    publishBook(id: $id) {
      id
      state {
        type
      }
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

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
    }
  }
`;

const bookValidationSchema = yup.object({
  title: yup.string().required('Publication title is required'),
  isbn: yup.string().required('Registry ISBN is required'),
  description: yup.string(),
});

export const BookManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState("");

  const { data: profileData } = useQuery(GET_MY_PROFILE);
  const facultyId = profileData?.getMyProfile?.id;

  const { data: booksData, loading: booksLoading, refetch: refetchBooks } = useQuery(GET_BOOKS_BY_FACULTY, {
    variables: { facultyId },
    skip: !facultyId
  });

  const { data: facultyListData } = useQuery(GET_FACULTY_LIST);
  const { data: deptData, loading: deptLoading } = useQuery(GET_DEPARTMENTS);

  const [submitForReview] = useMutation(SUBMIT_FOR_REVIEW);
  const [publishBook] = useMutation(PUBLISH_BOOK);
  const [createBook] = useMutation(CREATE_BOOK);

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
        setIsCreateModalOpen(false);
        resetForm();
        refetchBooks();
        alert('New resource drafted successfully');
      } catch (err) {
        console.error('Error creating book:', err);
      }
    }
  });

  const handleReviewSubmit = async () => {
    if (!selectedBook || !selectedReviewer) return;
    try {
      await submitForReview({
        variables: {
          bookId: selectedBook.id,
          reviewerId: selectedReviewer
        }
      });
      setIsReviewModalOpen(false);
      setSelectedBook(null);
      setSelectedReviewer("");
      refetchBooks();
      alert('Publication submitted for peer review');
    } catch (err) {
      console.error('Error submitting for review:', err);
    }
  };

  const handlePublish = async (bookId) => {
    try {
      await publishBook({ variables: { id: bookId } });
      refetchBooks();
      alert('Publication finalized and published globally');
    } catch (err) {
      console.error(err);
    }
  };

  const books = booksData?.getBooksByFaculty || [];
  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (type) => {
    switch (type) {
      case 'PUBLISHED':
        return { bgcolor: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' };
      case 'REVIEW':
        return { bgcolor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
      case 'DRAFT':
        return { bgcolor: 'background.default', color: 'text.primary', borderColor: 'divider' };
      case 'ARCHIVED':
        return { bgcolor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' };
      default:
        return { bgcolor: 'background.default', color: 'text.primary', borderColor: 'divider' };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
            Publication Engine
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Manage your authored academic resources and review cycles
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setIsCreateModalOpen(true)}
          startIcon={<AddIcon />}
          sx={{ 
            fontWeight: 800, 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            borderRadius: 2.5,
            bgcolor: '#111827',
            color: '#fff',
            py: 1.5,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#1f2937',
              boxShadow: 'none'
            }
          }}
        >
          Draft New Resource
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField 
          fullWidth
          placeholder="Search registry by title or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: 'text.secondary' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' },
            }
          }}
        />
        <Button 
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ 
            fontWeight: 800, 
            fontSize: '11px', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em', 
            borderRadius: 3,
            borderColor: 'divider',
            color: 'text.secondary',
            py: 1.5,
            px: 3,
            '&:hover': {
              borderColor: '#d1d5db',
              bgcolor: 'background.default'
            }
          }}
        >
          Filter Registry
        </Button>
      </Box>

      <Card sx={{  borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Publication Entity</TableCell>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Registry ISBN</TableCell>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Operational Status</TableCell>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Creation Date</TableCell>
                <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Ops</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontFamily: 'monospace' }}>
              {booksLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Synchronizing Publication Data...
                  </TableCell>
                </TableRow>
              ) : filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    No matching resources in registry
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => {
                  const statusStyle = getStatusStyle(book.state.type);
                  return (
                    <TableRow key={book.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>{book.title}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2, fontSize: '12px', color: 'text.secondary' }}>{book.isbn}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={book.state.type} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: '9px', 
                            fontWeight: 800, 
                            borderRadius: 1.5,
                            bgcolor: statusStyle.bgcolor,
                            color: statusStyle.color,
                            borderColor: statusStyle.borderColor,
                            textTransform: 'uppercase'
                          }} 
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2, fontSize: '11px', color: 'text.secondary' }}>
                        {new Date(book.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {book.state.type === 'DRAFT' && (
                            <IconButton 
                              onClick={() => {
                                setSelectedBook(book);
                                setIsReviewModalOpen(true);
                              }}
                              size="small"
                              sx={{ bgcolor: '#f0f2fe', color: 'primary.main', borderRadius: 2, '&:hover': { bgcolor: '#e0e4fe' } }}
                              title="Submit for Review"
                            >
                              <SendIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                          {book.state.type === 'REVIEW' && (
                            <IconButton 
                              onClick={() => handlePublish(book.id)}
                              size="small"
                              sx={{ bgcolor: '#ecfdf5', color: '#10b981', borderRadius: 2, '&:hover': { bgcolor: '#d1fae5' } }}
                              title="Finalize Publication"
                            >
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Review Request Modal */}
      <Modal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        title="Peer Review Submission" 
        subtitle="Initiate the authorization cycle for this publication"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ p: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
              Target Entity
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'text.primary', mt: 0.5 }}>
              {selectedBook?.title}
            </Typography>
          </Box>
           
          <CustomSelect 
            label="Assigned Reviewer"
            options={facultyListData?.getFacultyList
              .filter((f) => f.id !== facultyId)
              .map((f) => ({ id: f.id, name: `${f.fullName} (@${f.username})` })) || []}
            value={selectedReviewer}
            onChange={setSelectedReviewer}
            placeholder="Select peer reviewer..."
          />

          <Box sx={{ p: 2.5, bgcolor: '#f0f2fe', border: '1px solid #e0e4fe', borderRadius: 2.5, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <LaunchIcon sx={{ color: 'primary.main', fontSize: 18, mt: 0.5 }} />
            <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 650, lineHeight: 1.5 }}>
              Peer review is a mandatory protocol. Reviewers will be notified of your submission via global telemetry.
            </Typography>
          </Box>

          <Button 
            onClick={handleReviewSubmit}
            disabled={!selectedReviewer}
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: '#111827', 
              color: '#fff', 
              py: 2, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderRadius: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1f2937', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
            }}
          >
            Finalize Review Request
          </Button>
        </Box>
      </Modal>

      {/* Draft Resource Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
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
            startIcon={createFormik.isSubmitting ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SendIcon />}
            sx={{ 
              bgcolor: '#111827', 
              color: '#fff', 
              py: 2, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderRadius: 3,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1f2937', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
            }}
          >
            Initialize Publication
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
