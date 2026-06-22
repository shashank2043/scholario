import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useLazyQuery } from '@apollo/client/react';
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

import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const GET_MY_ISSUES = gql`
  query GetMyIssues {
    getMyIssuedBooks {
      id
      bookId
      issueDate
      dueDate
      state {
        type
      }
      penaltyAmount
    }
  }
`;

const SEARCH_BOOKS = gql`
  query SearchBooks($title: String) {
    searchBooks(title: $title) {
      id
      title
      isbn
    }
  }
`;

const StatCard = ({ label, value, icon: Icon, darkBg, darkColor, lightBg, lightColor }) => (
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
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', p: '24px !important' }}>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ 
        width: 40, 
        height: 40, 
        bgcolor: (theme) => theme.palette.mode === 'dark' ? darkBg : lightBg, 
        color: (theme) => theme.palette.mode === 'dark' ? darkColor : lightColor, 
        borderRadius: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}>
        <Icon sx={{ fontSize: 20 }} />
      </Box>
    </CardContent>
  </Card>
);

export const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error } = useQuery(GET_MY_ISSUES);
  
  const [searchBooks, { data: searchData, loading: searching }] = useLazyQuery(SEARCH_BOOKS);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchBooks({ variables: { title: searchTerm } });
    }
  };

  const booksHeld = data?.getMyIssuedBooks.length || 0;
  
  const dueSoon = data?.getMyIssuedBooks.filter(issue => {
    const dueDate = new Date(issue.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length || 0;

  const totalFines = data?.getMyIssuedBooks.reduce((acc, issue) => acc + (issue.penaltyAmount || 0), 0) || 0;
  const reservations = 0; // Planned feature

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em', mb: 0.5 }}>
            My Library Activity
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Manage your academic resources and tracking.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />}
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
            History
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/student/search')}
            startIcon={<SearchIcon />}
            sx={{ 
              fontWeight: 800, 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              borderRadius: 2.5,
              bgcolor: 'primary.main', color: 'primary.contrastText',
              py: 1,
              px: 2,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: 'none'
              }
            }}
          >
            Find Books
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Books Held" value={booksHeld} icon={BookIcon} lightBg="#e0e7ff" lightColor="#4338ca" darkBg="rgba(67, 56, 202, 0.15)" darkColor="#818cf8" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Due Soon" value={dueSoon} icon={AccessTimeIcon} lightBg="#fffbeb" lightColor="#d97706" darkBg="rgba(217, 119, 6, 0.15)" darkColor="#fbbf24" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Total Fines" value={`$${totalFines}`} icon={WarningIcon} lightBg="#fef2f2" lightColor="#dc2626" darkBg="rgba(239, 68, 68, 0.15)" darkColor="#fca5a5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Reservations" value={reservations} icon={BookmarkIcon} lightBg="#ecfdf5" lightColor="#059669" darkBg="rgba(16, 185, 129, 0.15)" darkColor="#34d399" />
        </Grid>
      </Grid>

      {/* Split Content */}
      <Grid container spacing={4}>
        {/* Left main column: Borrowed list */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Currently Borrowed
              </Typography>
              <Chip 
                label={`${booksHeld} Units`} 
                size="small" 
                sx={{ 
                  ml: 2,
                  fontSize: '10px', 
                  fontWeight: 900, 
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(99, 102, 241, 0.08)', 
                  color: 'primary.main', 
                  borderRadius: 1.5 
                }} 
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={30} />
                  <Typography sx={{ mt: 2, color: 'text.secondary', fontWeight: 500, fontSize: '14px' }}>Loading your books...</Typography>
                </Box>
              ) : error ? (
                <Box sx={{ py: 8, textAlign: 'center', color: 'error.main' }}>
                  <WarningIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography sx={{ fontWeight: 700 }}>Error loading library data</Typography>
                </Box>
              ) : data?.getMyIssuedBooks.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
                  No active loans found.
                </Box>
              ) : (
                data?.getMyIssuedBooks.map((issue) => {
                  const dueDate = new Date(issue.dueDate);
                  const now = new Date();
                  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  const isOverdue = issue.state.type === 'OVERDUE';
                  const isDueSoon = diffDays <= 3 && diffDays >= 0;

                  return (
                    <Box 
                      key={issue.id} 
                      sx={{ 
                        p: 3, 
                        borderBottom: '1px solid', borderColor: 'divider', 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' }, 
                        alignItems: { xs: 'flex-start', sm: 'center' }, 
                        justifyContent: 'space-between',
                        gap: 2,
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ w: 48, h: 48, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'primary.main', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1.5 }}>
                          <BookIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '14px', fontWeight: 800, color: 'text.primary' }}>
                            Resource ID: {issue.bookId}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', display: 'block', mt: 0.25 }}>
                            REF: {issue.id.substring(0, 8)}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 1 }}>
                            <Chip 
                              label={isOverdue ? 'Overdue' : isDueSoon ? `Due in ${diffDays}d` : 'Secured'} 
                              size="small"
                              sx={{ 
                                fontSize: '9px', 
                                height: 18,
                                fontWeight: 800, 
                                borderRadius: 1,
                                bgcolor: isOverdue ? '#fef2f2' : isDueSoon ? '#fffbeb' : '#ecfdf5',
                                color: isOverdue ? '#b91c1c' : isDueSoon ? '#b45309' : '#047857',
                                border: '1px solid',
                                borderColor: isOverdue ? '#fecaca' : isDueSoon ? '#fde68a' : '#a7f3d0',
                                textTransform: 'uppercase'
                              }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                              Due {dueDate.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignSelf: { xs: 'stretch', sm: 'center' } }}>
                        <Button 
                          variant="contained" 
                          color="inherit"
                          sx={{ 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase', 
                            bgcolor: 'action.hover', 
                            color: 'text.primary',
                            borderRadius: 2,
                            boxShadow: 'none',
                            py: 1,
                            px: 2,
                            '&:hover': { bgcolor: '#e5e7eb', boxShadow: 'none' }
                          }}
                        >
                          Renew
                        </Button>
                        <Button 
                          variant="contained"
                          sx={{ 
                            fontSize: '10px', 
                            fontWeight: 800, 
                            textTransform: 'uppercase', 
                            bgcolor: 'primary.main', 
                            color: '#fff',
                            borderRadius: 2,
                            boxShadow: 'none',
                            py: 1,
                            px: 2,
                            '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' }
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right column: Search and Fines */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <Card sx={{ bgcolor: 'primary.main', color: '#fff', p: 3, borderRadius: 4, border: 'none', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 2 }}>
                Quick Discovery
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                  fullWidth
                  placeholder="Find academic resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : 'rgba(255, 255, 255, 0.15)', color: 'text.primary',
                      fontSize: '13px',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                      '&.Mui-focused fieldset': { borderColor: '#fff' },
                    },
                    '& input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      opacity: 1
                    }
                  }}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={searching}
                  variant="contained"
                  fullWidth
                  sx={{ 
                    bgcolor: 'background.paper', 
                    color: 'primary.main', 
                    py: 1.5,
                    fontWeight: 800, 
                    fontSize: '11px',
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderRadius: 3,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'primary.dark' : '#f5f7ff', boxShadow: 'none' },
                    '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.5)', color: 'primary.main' }
                  }}
                >
                  {searching ? 'Syncing...' : 'Execute Search'}
                </Button>

                {searchData?.searchBooks && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.1)', pt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.6)' }}>
                      Registry Matches
                    </Typography>
                    {searchData.searchBooks.slice(0, 3).map((book) => (
                      <Box 
                        key={book.id} 
                        sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(255, 255, 255, 0.05)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          borderRadius: 3, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          '&:hover .hold-btn': { opacity: 1 }
                        }}
                      >
                        <Box sx={{ overflow: 'hidden', pr: 1 }}>
                          <Typography sx={{ fontSize: '11px', fontWeight: 800, noWrap: true, textOverflow: 'ellipsis' }}>{book.title}</Typography>
                          <Typography sx={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace', mt: 0.25 }}>{book.isbn}</Typography>
                        </Box>
                        <Button 
                          className="hold-btn"
                          sx={{ 
                            fontSize: '9px', 
                            fontWeight: 900, 
                            textTransform: 'uppercase', 
                            bgcolor: 'background.paper', 
                            color: 'primary.main',
                            py: 0.5,
                            px: 1,
                            minWidth: 0,
                            borderRadius: 1.5,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': { bgcolor: '#f5f7ff' }
                          }}
                        >
                          Hold
                        </Button>
                      </Box>
                    ))}
                    {searchData.searchBooks.length === 0 && (
                      <Typography sx={{ fontSize: '11px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.6)' }}>
                        No nodes matched criteria.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Card>

            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 3 }}>
              <Box sx={{ w: 40, h: 40, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', 
    color: (theme) => theme.palette.mode === 'dark' ? '#fca5a5' : '#ef4444', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,py: 2 }}>
                <WarningIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.primary', letterSpacing: '0.05em' }}>
                Payments & Dues
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px', mt: 0.5, leading: 1.5 }}>
                Clear pending liabilities and view archival transaction history.
              </Typography>
              <Box sx={{ mt: 'auto', pt: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                  Active Balance
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary' }}>
                  ${totalFines.toFixed(2)}
                </Typography>
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
