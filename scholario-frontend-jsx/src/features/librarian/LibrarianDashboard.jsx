import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import BookIcon from '@mui/icons-material/Book';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import GetAppIcon from '@mui/icons-material/GetApp';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import HistoryIcon from '@mui/icons-material/History';

import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const ISSUE_BOOK = gql`
  mutation IssueBook($bookId: ID!, $userId: ID!) {
    issueBook(input: { bookId: $bookId, userId: $userId }) {
      id
      dueDate
      state { type }
    }
  }
`;

const RETURN_BOOK = gql`
  mutation ReturnBook($issueId: ID!, $userId: ID!) {
    returnBook(input: { issueId: $issueId, userId: $userId }) {
      id
      returnDate
      state { type }
    }
  }
`;

const GET_DUE_DATES = gql`
  query GetDueDates {
    getDueDates {
      id
      bookId
      userId
      issueDate
      dueDate
      returnDate
      state {
        type
      }
    }
  }
`;

const GET_STUDENTS = gql`
  query GetStudents {
    getStudentList {
      id
      fullName
    }
  }
`;

const GET_BOOKS = gql`
  query GetBooks {
    getAllBooks {
      id
      title
    }
  }
`;

const GET_LIBRARIAN_STATS = gql`
  query GetLibrarianStats {
    getLibrarianStats {
      activeIssues
      overdueIssues
      returnedToday
      activeReservations
    }
  }
`;

const StatCard = ({ title, value, icon: Icon, darkBg, darkColor, lightBg, lightColor }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      borderRadius: 3,
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: '#6366f1',
        transform: 'translateY(-2px)'
      }
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', p: '20px !important' }}>
      <Box>
        <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ 
        ml: 2, 
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

const ActionCard = ({ title, description, icon: Icon, color, onClick }) => {
  const isIndigo = color === 'indigo';
  return (
    <Button
      fullWidth
      onClick={onClick}
      variant="contained"
      sx={{
        textAlign: 'left',
        justifyContent: 'flex-start',
        p: 2.5,
        borderRadius: 4,
        bgcolor: isIndigo ? '#6366f1' : '#10b981',
        color: '#fff',
        boxShadow: isIndigo ? '0 4px 14px rgba(99, 102, 241, 0.15)' : '0 4px 14px rgba(16, 185, 129, 0.15)',
        textTransform: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '&:hover': {
          bgcolor: isIndigo ? '#4f46e5' : '#059669',
          boxShadow: isIndigo ? '0 6px 20px rgba(99, 102, 241, 0.25)' : '0 6px 20px rgba(16, 185, 129, 0.25)',
        }
      }}
    >
      <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2.5, display: 'flex' }}>
        <Icon sx={{ fontSize: 24 }} />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '15px' }}>{title}</Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '11px', fontWeight: 500, mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
      <LaunchIcon sx={{ fontSize: 18, opacity: 0.6 }} />
    </Button>
  );
};

export const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const [issueMutation] = useMutation(ISSUE_BOOK);
  const [returnMutation] = useMutation(RETURN_BOOK);
  
  const { loading, error, data, refetch } = useQuery(GET_DUE_DATES);
  const { data: studentsData } = useQuery(GET_STUDENTS);
  const { data: booksData } = useQuery(GET_BOOKS);
  const { data: statsData } = useQuery(GET_LIBRARIAN_STATS);

  // Formik for Issuing Book
  const issueFormik = useFormik({
    initialValues: { studentId: '', bookId: '' },
    validationSchema: yup.object({
      studentId: yup.string().required('Please select a student'),
      bookId: yup.string().required('Please select a book'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await issueMutation({ 
          variables: { bookId: values.bookId, userId: values.studentId } 
        });
        setIsIssueModalOpen(false);
        resetForm();
        refetch();
      } catch (err) {
        console.error('Failed to issue book:', err);
      }
    }
  });

  // Formik for Confirm Return
  const returnFormik = useFormik({
    initialValues: { studentId: '', issueId: '' },
    validationSchema: yup.object({
      studentId: yup.string().required('Please select a student'),
      issueId: yup.string().required('Please select an active loan'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await returnMutation({ 
          variables: { issueId: values.issueId, userId: values.studentId } 
        });
        setIsReturnModalOpen(false);
        resetForm();
        refetch();
      } catch (err) {
        console.error('Failed to return book:', err);
      }
    }
  });

  const studentOptions = studentsData?.getStudentList.map((s) => ({ id: s.id, name: s.fullName })) || [];
  const bookOptions = booksData?.getAllBooks.map((b) => ({ id: b.id, name: b.title })) || [];
  
  const activeIssuesForStudent = data?.getDueDates.filter(
    (issue) => issue.userId === returnFormik.values.studentId && issue.state.type !== 'RETURNED'
  ) || [];

  const issueOptions = activeIssuesForStudent.map((issue) => {
    const book = booksData?.getAllBooks.find((b) => b.id === issue.bookId);
    return {
      id: issue.id,
      name: book ? `${book.title} (Due: ${new Date(issue.dueDate).toLocaleDateString()})` : `Issue #${issue.id.substring(0, 8)}`
    };
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
            Librarian Hub
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Manage circulation, track assets, and handle student requests.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<GetAppIcon />}
            sx={{ 
              fontWeight: 800, 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              borderRadius: 2.5,
              borderColor: 'divider',
              color: 'text.primary',
              py: 1,
              px: 2,
              '&:hover': {
                borderColor: '#d1d5db',
                bgcolor: 'background.default'
              }
            }}
          >
            Export Logs
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/librarian/stock')}
            startIcon={<AddIcon />}
            sx={{ 
              fontWeight: 800, 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              borderRadius: 2.5,
              bgcolor: '#111827',
              color: '#fff',
              py: 1,
              px: 2,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1f2937',
                boxShadow: 'none'
              }
            }}
          >
            Add Stock
          </Button>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Active Issues" value={statsData?.getLibrarianStats.activeIssues.toString() || "0"} icon={BookIcon} lightBg="#e0e7ff" lightColor="#4338ca" darkBg="rgba(67, 56, 202, 0.15)" darkColor="#818cf8" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Overdue" value={statsData?.getLibrarianStats.overdueIssues.toString() || "0"} icon={WarningIcon} lightBg="#fee2e2" lightColor="#ef4444" darkBg="rgba(239, 68, 68, 0.15)" darkColor="#fca5a5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Returned (Today)" value={statsData?.getLibrarianStats.returnedToday.toString() || "0"} icon={CheckCircleIcon} lightBg="#ecfdf5" lightColor="#047857" darkBg="rgba(16, 185, 129, 0.15)" darkColor="#34d399" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Reservations" value={statsData?.getLibrarianStats.activeReservations.toString() || "0"} icon={AccessTimeIcon} lightBg="#fffbeb" lightColor="#d97706" darkBg="rgba(217, 119, 6, 0.15)" darkColor="#fbbf24" />
        </Grid>
      </Grid>

      {/* Main Split Content */}
      <Grid container spacing={4}>
        {/* Circulation Desk QUICK ACTIONS */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', ml: 0.5 }}>
              Circulation Desk
            </Typography>
            <ActionCard 
              title="Issue Book" 
              description="Record a new book loan to a student" 
              icon={LibraryAddIcon} 
              color="indigo" 
              onClick={() => setIsIssueModalOpen(true)}
            />
            <ActionCard 
              title="Confirm Return" 
              description="Process a returned book and update inventory" 
              icon={RefreshIcon} 
              color="emerald" 
              onClick={() => setIsReturnModalOpen(true)}
            />
            
            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#bfdbfe', borderRadius: 4 }}>
              <Typography sx={{ fontWeight: 800, color: (theme) => theme.palette.mode === 'dark' ? '#93c5fd' : '#1e3a8a', display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontSize: '13px', textTransform: 'uppercase' }}>
                <HistoryIcon sx={{ fontSize: 16 }} /> Quick Tip
              </Typography>
              <Typography sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'text.secondary' : '#1e40af', fontSize: '11px', leading: 1.5, fontWeight: 550 }}>
                Always verify the book condition before confirming a return to maintain accurate resource tracking.
              </Typography>
            </Card>
          </Box>
        </Grid>

        {/* Live log table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: 'primary.main', fontSize: 18 }} /> Recent Circulation
              </Typography>
              <Chip label="Live Log" size="small" sx={{ fontSize: '10px', fontWeight: 700, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', color: 'primary.main' }} />
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Book</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Student</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Status</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 650, fontSize: '0.875rem' }}>
                        Loading circulation data...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'error.main', fontWeight: 650, fontSize: '0.875rem' }}>
                        Failed to load activity log.
                      </TableCell>
                    </TableRow>
                  ) : data?.getDueDates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 650, fontSize: '0.875rem' }}>
                        No recent activity found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.getDueDates.map((issue) => {
                      const book = booksData?.getAllBooks.find((b) => b.id === issue.bookId);
                      const student = studentsData?.getStudentList.find((s) => s.id === issue.userId);
                      return (
                        <TableRow key={issue.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell sx={{ py: 2 }}>
                            <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '13.5px' }}>{book?.title || `Book #${issue.bookId}`}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '9px', textTransform: 'uppercase' }}>
                              ID: {issue.id.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2, fontSize: '12px', color: 'text.secondary' }}>
                            {student?.fullName || `User #${issue.userId}`}
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={issue.state.type} 
                              size="small" 
                              sx={{ 
                                fontSize: '9px', 
                                fontWeight: 800, 
                                borderRadius: 1.5,
                                bgcolor: issue.state.type === 'RETURNED' ? '#ecfdf5' : issue.state.type === 'OVERDUE' ? '#fef2f2' : '#fffbeb',
                                color: issue.state.type === 'RETURNED' ? '#047857' : issue.state.type === 'OVERDUE' ? '#b91c1c' : '#b45309',
                                textTransform: 'uppercase'
                              }} 
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2, fontSize: '12px', color: 'text.primary', fontWeight: 700 }}>
                            {new Date(issue.dueDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Book"
        subtitle="Create a new lending record for a student"
      >
        <Box 
          component="form" 
          onSubmit={issueFormik.handleSubmit} 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <CustomSelect 
            label="Select Student"
            options={studentOptions}
            value={issueFormik.values.studentId}
            onChange={(val) => issueFormik.setFieldValue('studentId', val)}
            placeholder="Search for a student..."
          />
          {issueFormik.touched.studentId && issueFormik.errors.studentId && (
            <Typography variant="caption" sx={{ color: 'error.main', mt: -2 }}>{issueFormik.errors.studentId}</Typography>
          )}

          <CustomSelect 
            label="Select Book"
            options={bookOptions}
            value={issueFormik.values.bookId}
            onChange={(val) => issueFormik.setFieldValue('bookId', val)}
            placeholder="Search for a book..."
          />
          {issueFormik.touched.bookId && issueFormik.errors.bookId && (
            <Typography variant="caption" sx={{ color: 'error.main', mt: -2 }}>{issueFormik.errors.bookId}</Typography>
          )}

          <Button 
            type="submit"
            disabled={!issueFormik.values.studentId || !issueFormik.values.bookId}
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
              mt: 1,
              '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
            }}
          >
            Issue Book
          </Button>
        </Box>
      </Modal>

      {/* Confirm Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Confirm Return"
        subtitle="Process a book return and clear the active issue"
      >
        <Box 
          component="form" 
          onSubmit={returnFormik.handleSubmit} 
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <CustomSelect 
            label="Select Student"
            options={studentOptions}
            value={returnFormik.values.studentId}
            onChange={(val) => {
              returnFormik.setFieldValue('studentId', val);
              returnFormik.setFieldValue('issueId', '');
            }}
            placeholder="Search for a student..."
          />
          {returnFormik.touched.studentId && returnFormik.errors.studentId && (
            <Typography variant="caption" sx={{ color: 'error.main', mt: -2 }}>{returnFormik.errors.studentId}</Typography>
          )}

          <CustomSelect 
            label="Active Issue"
            options={issueOptions}
            value={returnFormik.values.issueId}
            onChange={(val) => returnFormik.setFieldValue('issueId', val)}
            placeholder={returnFormik.values.studentId ? "Select an active loan..." : "Select a student first"}
          />
          {returnFormik.touched.issueId && returnFormik.errors.issueId && (
            <Typography variant="caption" sx={{ color: 'error.main', mt: -2 }}>{returnFormik.errors.issueId}</Typography>
          )}

          <Button 
            type="submit"
            disabled={!returnFormik.values.studentId || !returnFormik.values.issueId}
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: '#10b981', 
              color: '#fff', 
              py: 2, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              borderRadius: 3,
              boxShadow: 'none',
              mt: 1,
              '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
              '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
            }}
          >
            Confirm Return
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
