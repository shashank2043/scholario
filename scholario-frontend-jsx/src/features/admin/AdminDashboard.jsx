import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton
} from '@mui/material';
import ShieldAlertIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import WarningIcon from '@mui/icons-material/Warning';
import BusinessIcon from '@mui/icons-material/Business';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const GET_VIOLATIONS = gql`
  query GetViolations {
    getViolationReports {
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

const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
    }
  }
`;

const GET_UNASSIGNED_USERS = gql`
  query GetUnassignedUsers {
    getUnassignedUsers {
      id
      username
      fullName
    }
  }
`;

const ASSIGN_ROLE = gql`
  mutation AssignRole($userId: ID!, $role: Role!) {
    assignRole(userId: $userId, role: $role) {
      id
      username
      roles
    }
  }
`;

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

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { data, loading, error } = useQuery(GET_VIOLATIONS);
  const { data: allUsersData, loading: usersLoading } = useQuery(GET_ALL_USERS);
  const { data: unassignedData, refetch: refetchUnassigned } = useQuery(GET_UNASSIGNED_USERS);

  const [assignRole] = useMutation(ASSIGN_ROLE);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await assignRole({ variables: { userId: selectedUser, role: selectedRole } });
      setIsRoleModalOpen(false);
      setSelectedUser('');
      setSelectedRole('');
      refetchUnassigned();
      alert('Role assigned successfully');
    } catch (err) {
      console.error('Failed to assign role:', err);
    }
  };

  if (error) return (
    <Box sx={{ p: 3, bgcolor: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 2, color: '#c53030' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <ShieldAlertIcon sx={{ fontSize: 18 }} /> SYSTEM_ERROR_LINK_FAILURE
      </Typography>
      <Typography variant="body2">
        Unable to synchronize with telemetry nodes. Infrastructure monitoring offline.
      </Typography>
    </Box>
  );

  const pendingViolations = data?.getViolationReports.filter(v => !v.resolved).length || 0;
  const criticalViolations = data?.getViolationReports.filter(v => v.severity === 'CRITICAL').length || 0;
  const totalEntities = allUsersData?.getAllUsers.length || 0;

  const userOptions = unassignedData?.getUnassignedUsers.map(u => ({ id: u.id, name: `${u.fullName} (@${u.username})` })) || [];
  const roleOptions = [
    { id: 'ADMIN', name: 'Administrator' },
    { id: 'FACULTY', name: 'Faculty' },
    { id: 'STUDENT', name: 'Student' },
    { id: 'LIBRARIAN', name: 'Librarian' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      {/* Enterprise Header */}
      <Card 
        sx={{ 
          p: 3, 
           
          borderRadius: 3 
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ bgcolor: '#111827', color: '#fff', p: 1.5, borderRadius: 2, display: 'flex' }}>
              <SpeedIcon />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 850, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  System Control Hub
                </Typography>
                <Chip 
                  label="Live" 
                  size="small" 
                  color="success" 
                  sx={{ 
                    height: 18, 
                    fontSize: '9px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase',
                    '& .MuiChip-label': { px: 1 } 
                  }} 
                />
              </Box>
            </Box>
          </Box>
          
          {/* <Button 
            variant="contained" 
            color="error" 
            onClick={() => setIsLockdownModalOpen(true)}
            startIcon={<LockIcon />}
            sx={{ 
              fontWeight: 800, 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              borderRadius: 2,
              py: 1.5,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                bgcolor: '#dc2626'
              }
            }}
          >
            Emergency Lockdown
          </Button> */}
        </Box>
      </Card>

      {/* Metrics Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={ShieldAlertIcon} label="Security Violations" value={loading ? '...' : data?.getViolationReports.length || 0} lightBg="#f3f4f6" lightColor="#374151" darkBg="rgba(255,255,255,0.05)" darkColor="#94a3b8" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={AccessTimeIcon} label="Pending Investigation" value={loading ? '...' : pendingViolations} lightBg="#fef3c7" lightColor="#d97706" darkBg="rgba(217, 119, 6, 0.15)" darkColor="#fbbf24" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={WarningIcon} label="Critical Alerts" value={loading ? '...' : criticalViolations} lightBg="#fee2e2" lightColor="#ef4444" darkBg="rgba(239, 68, 68, 0.15)" darkColor="#fca5a5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard icon={PeopleIcon} label="Global Entities" value={usersLoading ? '...' : totalEntities} lightBg="#e0f2fe" lightColor="#0284c7" darkBg="rgba(2, 132, 199, 0.15)" darkColor="#38bdf8" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Table Column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
                Security Violations Engine
              </Typography>
              <Button 
                component={Link} 
                to="/admin/security" 
                endIcon={<ChevronRightIcon />} 
                sx={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  color: 'text.secondary', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  '&:hover': {
                    color: 'text.primary',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Full Audit Log
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Subject</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Priority</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Metric</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Ops</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Synchronizing Telemetry...
                      </TableCell>
                    </TableRow>
                  ) : data?.getViolationReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Zero Violations Detected
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.getViolationReports.slice(0, 5).map((v) => (
                      <TableRow key={v.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: '13px' }}>{v.username}</TableCell>
                        <TableCell>
                          <Chip 
                            label={v.severity} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              fontSize: '9px', 
                              fontWeight: 800,
                              borderRadius: 1.5,
                              borderColor: v.severity === 'CRITICAL' ? '#fecaca' : v.severity === 'HIGH' ? '#fef3c7' : '#e5e7eb',
                              bgcolor: v.severity === 'CRITICAL' ? '#fef2f2' : v.severity === 'HIGH' ? '#fffbeb' : '#f9fafb',
                              color: v.severity === 'CRITICAL' ? '#ef4444' : v.severity === 'HIGH' ? '#d97706' : '#374151'
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '12px', color: 'text.secondary', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.description}
                        </TableCell>
                        <TableCell>
                          {v.resolved ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981' }}>
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                              <Typography sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</Typography>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#f59e0b' }}>
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              <Typography sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button 
                            onClick={() => navigate('/admin/security')} 
                            sx={{ 
                              fontSize: '10px', 
                              fontWeight: 900, 
                              textTransform: 'uppercase', 
                              p: 0,
                              minWidth: 0,
                              color: 'primary.main',
                              '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                            }}
                          >
                            Investigate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Master Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> Infrastructure Master
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  onClick={() => navigate('/admin/departments')}
                  fullWidth
                  variant="outlined"
                  sx={{ 
                    justifyContent: 'space-between', 
                    p: 2, 
                    borderRadius: 2.5, 
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    textAlign: 'left',
                    '&:hover': {
                      borderColor: '#6366f1',
                      bgcolor: 'action.hover',
                    }
                  }}
                  endIcon={<ChevronRightIcon />}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                      <BusinessIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Department Master
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                      Provision academic units
                    </Typography>
                  </Box>
                </Button>

                <Button 
                  onClick={() => setIsRoleModalOpen(true)}
                  fullWidth
                  variant="outlined"
                  sx={{ 
                    justifyContent: 'space-between', 
                    p: 2, 
                    borderRadius: 2.5, 
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    textAlign: 'left',
                    '&:hover': {
                      borderColor: '#6366f1',
                      bgcolor: 'action.hover',
                    }
                  }}
                  endIcon={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {unassignedData?.getUnassignedUsers.length ? (
                        <Box sx={{ px: 1, py: 0.25, bgcolor: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 900, borderRadius: '10px', mr: 1 }}>
                          {unassignedData.getUnassignedUsers.length}
                        </Box>
                      ) : null}
                      <ChevronRightIcon />
                    </Box>
                  }
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                      <AdminPanelSettingsIcon sx={{ fontSize: 16, color: 'primary.main' }} /> Role Authorization
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                      Verify node permissions
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </Card>

            {/* <Card sx={{ bgcolor: '#111827', color: '#ffffff', p: 3, borderRadius: 3, border: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ShieldAlertIcon sx={{ color: '#ef4444' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Protocol Status
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '11px', fontFamily: 'monospace', color: 'text.secondary', lineHeight: 1.6 }}>
                [ACTIVE] Encryption: AES-256-GCM<br/>
                [ACTIVE] Node Auth: OAuth 2.0<br/>
                [STABLE] Connection: Global Telemetry
              </Typography>
            </Card> */}
          </Box>
        </Grid>
      </Grid>

      {/* Role Authorization Modal */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        title="Role Authorization" 
        subtitle="Validate and assign permissions to unassigned users"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
          <CustomSelect 
            label="Pending Entity"
            options={userOptions}
            value={selectedUser}
            onChange={setSelectedUser}
            placeholder="Search pending nodes..."
          />
          <CustomSelect 
            label="Authorization Tier"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Select access level..."
          />
          <Button 
            onClick={handleAssignRole}
            disabled={!selectedUser || !selectedRole}
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
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: 'none'
              },
              '&:disabled': {
                bgcolor: '#e5e7eb',
                color: 'text.secondary'
              }
            }}
          >
            Authorize Access
          </Button>
        </Box>
      </Modal>

      {/* Lockdown Modal */}
      <Modal 
        isOpen={isLockdownModalOpen} 
        onClose={() => setIsLockdownModalOpen(false)} 
        title="CRITICAL: System Lockdown" 
        subtitle="Executing this protocol will sever all active user connections"
      >
        <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box 
            sx={{ 
              w: 80, 
              h: 80, 
              bgcolor: '#fee2e2', 
              color: '#ef4444', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              p: 2
            }}
          >
            <WarningIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 2 }}>
            You are about to initiate a <strong>Global System Lockdown</strong>. This action is irreversible via standard protocols and will require manual infrastructure restart.
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button 
                onClick={() => setIsLockdownModalOpen(false)} 
                fullWidth
                variant="outlined"
                sx={{ 
                  py: 1.75, 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  borderRadius: 3, 
                  color: 'text.secondary',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.default', borderColor: '#d1d5db' }
                }}
              >
                Abort
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button 
                onClick={() => { alert('LOCKDOWN_EXECUTED'); setIsLockdownModalOpen(false); }} 
                fullWidth
                variant="contained"
                color="error"
                sx={{ 
                  py: 1.75, 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  borderRadius: 3,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' }
                }}
              >
                Confirm Lockdown
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};
