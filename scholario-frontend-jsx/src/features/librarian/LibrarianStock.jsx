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

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BookIcon from '@mui/icons-material/Book';
import WarningIcon from '@mui/icons-material/Warning';

import { Modal } from '../../components/Modal';

const GET_ALL_BOOKS = gql`
  query GetAllBooks {
    getAllBooks {
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

const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      id
      title
      isbn
    }
  }
`;

const validationSchema = yup.object({
  title: yup.string().required('Publication title is required'),
  isbn: yup.string().required('Registry ISBN is required'),
  description: yup.string(),
});

export const LibrarianStock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const { data, loading, refetch } = useQuery(GET_ALL_BOOKS);
  const [createBook, { loading: creating }] = useMutation(CREATE_BOOK);

  // Formik for Provision New Stock
  const formik = useFormik({
    initialValues: { title: '', isbn: '', description: '' },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createBook({
          variables: {
            input: values
          }
        });
        setIsStockModalOpen(false);
        resetForm();
        refetch();
      } catch (err) {
        console.error(err);
      }
    }
  });

  const books = data?.getAllBooks || [];
  const filteredBooks = books.filter((b) => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
            Inventory Matrix
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Global academic resource stock management
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          onClick={() => setIsStockModalOpen(true)}
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
          Add New Stock
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField 
          fullWidth
          placeholder="Search inventory by title or ISBN..."
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
          Sort Registry
        </Button>
      </Box>

      <Card sx={{  borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Resource Entity</TableCell>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Registry ISBN</TableCell>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Deployment Status</TableCell>
                <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>On-Boarding Date</TableCell>
                <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Ops</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ fontFamily: 'monospace' }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Scanning Inventory Nodes...
                  </TableCell>
                </TableRow>
              ) : filteredBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    No stock found in registry
                  </TableCell>
                </TableRow>
              ) : (
                filteredBooks.map((book) => (
                  <TableRow key={book.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <Box sx={{ p: 1, bgcolor: 'background.default', borderRadius: 2, display: 'flex', color: 'text.secondary' }}>
                            <BookIcon sx={{ fontSize: 16 }} />
                         </Box>
                         <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>{book.title}</Typography>
                      </Box>
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
                          bgcolor: book.state.type === 'PUBLISHED' ? '#ecfdf5' : '#f9fafb',
                          color: book.state.type === 'PUBLISHED' ? '#047857' : '#374151',
                          borderColor: book.state.type === 'PUBLISHED' ? '#a7f3d0' : '#e5e7eb',
                          textTransform: 'uppercase'
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2, fontSize: '11px', color: 'text.secondary' }}>
                      {new Date(book.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <MoreVertIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Provision New Stock Modal */}
      <Modal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        title="Provision New Stock" 
        subtitle="Manually board a new physical resource into the digital registry"
      >
        <Box 
          component="form" 
          onSubmit={formik.handleSubmit}
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
              placeholder="e.g. Modern Operating Systems"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
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
              Registry ISBN
            </Typography>
            <TextField 
              fullWidth
              id="isbn"
              name="isbn"
              placeholder="978-..."
              value={formik.values.isbn}
              onChange={formik.handleChange}
              error={formik.touched.isbn && Boolean(formik.errors.isbn)}
              helperText={formik.touched.isbn && formik.errors.isbn}
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
              Inventory Notes
            </Typography>
            <TextField 
              fullWidth
              id="description"
              name="description"
              multiline
              rows={4}
              placeholder="Condition, shelf location, or acquisition details..."
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
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

          <Box sx={{ p: 2.5, bgcolor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 2.5, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
             <WarningIcon sx={{ color: '#d97706', fontSize: 18, mt: 0.5 }} />
             <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 650, lineHeight: 1.5 }}>
               Manually added stock defaults to DRAFT status and requires validation before global circulation.
             </Typography>
          </Box>

          <Button 
            type="submit"
            disabled={!formik.values.title || !formik.values.isbn || creating}
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
            {creating ? 'Syncing...' : 'Initialize Stock Boarding'}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
