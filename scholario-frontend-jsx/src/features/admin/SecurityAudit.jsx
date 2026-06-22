import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
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

import ShieldAlertIcon from '@mui/icons-material/Shield';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import SecurityIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';

import { Modal } from '../../components/Modal';

const GET_VIOLATIONS = gql`
  query GetViolations($username: String) {
    getViolationReports(username: $username) {
      id
      username
      type
      severity
      description
      detectedAt
      resolved
    }
  }
`;

const ANALYZE_PATTERNS = gql`
  query AnalyzePatterns {
    analyzeUsagePatterns {
      id
      username
      type
      severity
      description
      detectedAt
    }
  }
`;

export const SecurityAudit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedViolation, setSelectedViolation] = useState(null);
  
  const { data, loading, refetch } = useQuery(GET_VIOLATIONS, {
    variables: { username: searchTerm || undefined }
  });

  const { data: patternData, loading: patternLoading } = useQuery(ANALYZE_PATTERNS);

  const violations = data?.getViolationReports || [];
  const patterns = patternData?.analyzeUsagePatterns || [];

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bgcolor: '#fef2f2',
          color: '#ef4444',
          borderColor: '#fecaca',
        };
      case 'HIGH':
        return {
          bgcolor: '#fff7ed',
          color: '#f97316',
          borderColor: '#ffedd5',
        };
      case 'MEDIUM':
        return {
          bgcolor: '#fffbeb',
          color: '#f59e0b',
          borderColor: '#fef3c7',
        };
      default:
        return {
          bgcolor: 'background.default',
          color: 'text.primary',
          borderColor: 'divider',
        };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
            Security Audit Log
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Global infrastructure telemetry & violation monitoring
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={() => refetch()}
          startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
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
          Refresh Telemetry
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Left Filters column */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card 
  sx={{ 
    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#111827' : 'background.paper', 
    color: 'text.primary',
    borderRadius: 3, 
    p: 3,
    border: (theme) => theme.palette.mode === 'light' ? '1px solid' : 'none',
    borderColor: 'divider'
  }}
>
  <Typography 
    variant="caption" 
    sx={{ 
      fontWeight: 800, 
      textTransform: 'uppercase', 
      letterSpacing: '0.1em', 
      color: 'text.secondary', 
      display: 'block', 
      mb: 2.5 
    }}
  >
    Security Overview
  </Typography>
  
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {/* Total Incidents */}
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
        {violations.length}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mt: 0.5, display: 'block' }}>
        Total Incidents
      </Typography>
    </Box>
    
    <Box sx={{ height: '1px', bgcolor: 'divider' }} />
    
    {/* Critical Alerts */}
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', lineHeight: 1 }}>
        {violations.filter((v) => v.severity === 'CRITICAL').length}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mt: 0.5, display: 'block' }}>
        Critical Alerts
      </Typography>
    </Box>
    
    <Box sx={{ height: '1px', bgcolor: 'divider' }} />
    
    {/* Resolved Nodes */}
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 900, color: 'success.main', lineHeight: 1 }}>
        {violations.filter((v) => v.resolved).length}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', mt: 0.5, display: 'block' }}>
        Resolved Nodes
      </Typography>
    </Box>
  </Box>
</Card>

            <Card sx={{  borderRadius: 3, p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterListIcon sx={{ fontSize: 16 }} /> Search Filters
              </Typography>
              <TextField 
                fullWidth
                placeholder="Search Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: 'background.default',
                    fontSize: '13px',
                    py: 0.5,
                    '& fieldset': { borderColor: 'divider' },
                    '&:hover fieldset': { borderColor: 'text.secondary' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                  }
                }}
              />
            </Card>
          </Box>
        </Grid>

        {/* Right violation list column */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{  borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                  <ShieldAlertIcon sx={{ color: '#ef4444', fontSize: 18 }} /> Active Violation Registry
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Subject</TableCell>
                      <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Incident Type</TableCell>
                      <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Severity</TableCell>
                      <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Timestamp</TableCell>
                      <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ fontFamily: 'monospace' }}>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Synchronizing Security Nodes...
                        </TableCell>
                      </TableRow>
                    ) : violations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          No Security Breaches Detected
                        </TableCell>
                      </TableRow>
                    ) : (
                      violations.map((v) => {
                        const sevStyle = getSeverityStyle(v.severity);
                        return (
                          <TableRow key={v.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '13px' }}>{v.username}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '9px', textTransform: 'uppercase' }}>
                                Node ID: {v.id.substring(0, 8)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                                {v.type.replace(/_/g, ' ')}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={v.severity} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '9px', 
                                  fontWeight: 800, 
                                  borderRadius: 1.5,
                                  bgcolor: sevStyle.bgcolor,
                                  color: sevStyle.color,
                                  borderColor: sevStyle.borderColor,
                                  textTransform: 'uppercase'
                                }} 
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2, fontSize: '11px', color: 'text.secondary' }}>
                              {new Date(v.detectedAt).toLocaleString()}
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <IconButton 
                                onClick={() => setSelectedViolation(v)}
                                size="small"
                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                              >
                                <InfoIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            <Card sx={{  borderRadius: 3 }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                  <SecurityIcon sx={{ color: 'primary.main', fontSize: 18 }} /> Usage Pattern Analysis
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                {patternLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : patterns.length === 0 ? (
                  <Box sx={{ border: '2px dashed #f3f4f6', py: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                      No Suspicious Patterns Detected
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {patterns.map((p) => {
                      const sevStyle = getSeverityStyle(p.severity);
                      return (
                        <Grid size={{ xs: 12, md: 6 }} key={p.id}>
                          <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'action.hover', '&:hover': { borderColor: '#d1d5db' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography sx={{ fontSize: '13px', fontWeight: 800, color: 'text.primary' }}>{p.username}</Typography>
                              <Chip 
                                label={p.severity} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '8px', 
                                  height: 16,
                                  fontWeight: 800, 
                                  borderRadius: 1,
                                  bgcolor: sevStyle.bgcolor,
                                  color: sevStyle.color,
                                  borderColor: sevStyle.borderColor,
                                  textTransform: 'uppercase'
                                }} 
                              />
                            </Box>
                            <Typography sx={{ fontSize: '12px', color: 'text.secondary', fontStyle: 'italic', leading: 1.5 }}>
                              "{p.description}"
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', mt: 2, fontFamily: 'monospace' }}>
                              {new Date(p.detectedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Modal
        isOpen={!!selectedViolation}
        onClose={() => setSelectedViolation(null)}
        title="Incident Forensics"
        subtitle="Detailed violation breakdown and resolution protocol"
      >
        {selectedViolation && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box 
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                border: '1px solid',
                display: 'flex',
                gap: 2,
                ...getSeverityStyle(selectedViolation.severity)
              }}
            >
              <WarningAmberIcon sx={{ mt: 0.5 }} />
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>
                  Security Breach Detected
                </Typography>
                <Typography sx={{ fontSize: '12px', mt: 0.5, fontWeight: 500, leading: 1.5 }}>
                  {selectedViolation.description}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                    Subject
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                    @{selectedViolation.username}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: '0.05em' }}>
                    Incident Type
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, mt: 0.5, color: 'text.primary', textTransform: 'capitalize' }}>
                    {selectedViolation.type.replace(/_/g, ' ').toLowerCase()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: '#111827', color: '#fff', p: 3, borderRadius: 3, border: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resolution Protocol
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  onClick={() => { alert('Isolating Node...'); setSelectedViolation(null); }}
                  variant="contained"
                  color="error"
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    fontWeight: 800, 
                    fontSize: '11px',
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderRadius: 2.5,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' }
                  }}
                >
                  Isolate Subject Node
                </Button>
                <Button 
                  onClick={() => { alert('Clearing Incident...'); setSelectedViolation(null); }}
                  variant="contained"
                  color="inherit"
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    fontWeight: 800, 
                    fontSize: '11px',
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em',
                    borderRadius: 2.5,
                    bgcolor: '#1f2937',
                    color: '#fff',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'text.primary', boxShadow: 'none' }
                  }}
                >
                  Mark as False Positive
                </Button>
              </Box>
            </Card>
          </Box>
        )}
      </Modal>
    </Box>
  );
};
