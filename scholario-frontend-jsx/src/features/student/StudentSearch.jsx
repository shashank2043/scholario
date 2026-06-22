import { useState } from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery, useMutation } from '@apollo/client/react';
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
  CircularProgress,
  InputAdornment
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import BookIcon from '@mui/icons-material/Book';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

import { Modal } from '../../components/Modal';

const SEARCH_BOOKS = gql`
  query SearchBooks($title: String, $isbn: String) {
    searchBooks(title: $title, isbn: $isbn) {
      id
      title
      isbn
      description
      state {
        type
      }
    }
  }
`;

const RESERVE_BOOK = gql`
  mutation ReserveBook($bookId: ID!) {
    reserveBook(bookId: $bookId) {
      id
      status
      reservedAt
    }
  }
`;

export const StudentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [searchBooks, { data, loading }] = useLazyQuery(SEARCH_BOOKS);
  const [reserveBook, { loading: reserving }] = useMutation(RESERVE_BOOK);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchBooks({ variables: { title: searchTerm } });
    }
  };

  const handleReserve = async (bookId) => {
    try {
      await reserveBook({ variables: { bookId } });
      alert('Book reserved successfully!');
      setSelectedBook(null);
    } catch (err) {
      console.error(err);
      alert('Failed to reserve book.');
    }
  };

  const books = data?.searchBooks || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box component="header">
        <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
          Global Library Search
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Discover academic resources and reserve them for study
        </Typography>
      </Box>

      <Box sx={{ maxWidth: '700px' }}>
        <Box 
          component="form" 
          onSubmit={handleSearch}
          sx={{ display: 'flex', gap: 2 }}
        >
          <TextField 
            fullWidth
            placeholder="Search by title, ISBN, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                bgcolor: 'background.paper',
                py: 1,
                px: 2,
                fontSize: '16px',
                '& fieldset': { borderColor: 'divider', borderWidth: 2 },
                '&:hover fieldset': { borderColor: 'text.secondary' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              }
            }}
          />
          <Button 
            type="submit"
            disabled={loading}
            variant="contained"
            sx={{ 
              bgcolor: '#111827', 
              color: '#fff', 
              px: 4,
              borderRadius: 4,
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1f2937', boxShadow: 'none' }
            }}
          >
            {loading ? 'Searching...' : 'Explore'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={30} />
              <Typography variant="caption" sx={{ mt: 2, fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                Accessing Global Registry...
              </Typography>
            </Box>
          </Grid>
        ) : books.length === 0 && searchTerm ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ border: '2px dashed #e5e7eb', py: 8, px: 3, textAlign: 'center', borderRadius: 4, bgcolor: '#ffffff' }}>
               <WarningIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
               <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em', display: 'block' }}>
                 No matching resources found
               </Typography>
            </Box>
          </Grid>
        ) : (
          books.map((book) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={book.id}>
              <Card 
                sx={{ 
                   
                  borderRadius: 4, 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#6366f1',
                    transform: 'translateY(-2px)',
                    '& .book-icon-container': {
                      bgcolor: 'primary.main',
                      color: '#ffffff'
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box 
                    className="book-icon-container"
                    sx={{ 
                      w: 44, 
                      h: 44, 
                      bgcolor: 'background.default', 
                      color: 'text.secondary', 
                      borderRadius: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      transition: 'all 0.3s'
                    }}
                  >
                    <BookIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 850, textTransform: 'uppercase', color: 'text.primary', letterSpacing: '-0.01em', leading: 1.2, flexGrow: 1 }}>
                    {book.title}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 700, tracking: '0.05em', textTransform: 'uppercase' }}>
                    ISBN: {book.isbn}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                    <Button 
                      onClick={() => setSelectedBook(book)}
                      variant="contained"
                      color="inherit"
                      fullWidth
                      sx={{ 
                        py: 1.25,
                        fontSize: '10px', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        bgcolor: 'action.hover', 
                        color: 'text.primary',
                        borderRadius: 2.5,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#e5e7eb', boxShadow: 'none' }
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      onClick={() => handleReserve(book.id)}
                      disabled={book.state.type !== 'PUBLISHED' || reserving}
                      variant="contained"
                      sx={{ 
                        py: 1.25,
                        minWidth: 44,
                        px: 0,
                        bgcolor: 'primary.main', 
                        color: '#fff',
                        borderRadius: 2.5,
                        boxShadow: 'none',
                        '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
                        '&:disabled': { bgcolor: '#e5e7eb', color: 'text.secondary' }
                      }}
                    >
                      <BookmarkIcon sx={{ fontSize: 18 }} />
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Selected Book Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title="Resource Forensics"
        subtitle="Detailed publication data and availability status"
      >
        {selectedBook && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
               <Typography variant="h6" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary', mb: 1, leading: 1.2 }}>
                 {selectedBook.title}
               </Typography>
               <Typography variant="body2" sx={{ color: 'text.secondary', leading: 1.5, fontWeight: 500 }}>
                 {selectedBook.description || 'No digital abstract available for this resource.'}
               </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                     <Box sx={{ w: 8, h: 8, borderRadius: '50%', bgcolor: selectedBook.state.type === 'PUBLISHED' ? '#10b981' : '#ef4444' }} />
                     <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary' }}>
                       {selectedBook.state.type}
                     </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ p: 2.5, bgcolor: 'background.paper', borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                    Registry Code
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.primary', display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                    {selectedBook.isbn}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: '#111827', color: '#fff', p: 3, borderRadius: 3, border: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: '#818cf8' }}>
                 <CheckCircleIcon sx={{ fontSize: 18 }} />
                 <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   Acquisition Protocol
                 </Typography>
              </Box>
              <Button 
                onClick={() => handleReserve(selectedBook.id)}
                disabled={selectedBook.state.type !== 'PUBLISHED' || reserving}
                variant="contained"
                fullWidth
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: '#fff', 
                  py: 1.75,
                  fontWeight: 800, 
                  fontSize: '11px',
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  borderRadius: 2.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
                  '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.12)', color: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                {reserving ? 'Processing...' : 'Reserve for Collection'}
              </Button>
            </Card>
          </Box>
        )}
      </Modal>
    </Box>
  );
};
