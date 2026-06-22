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
  Chip,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';

import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { Modal } from '../../components/Modal';
import { CustomSelect } from '../../components/CustomSelect';

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
      code
    }
  }
`;

const GET_FACULTY_LIST = gql`
  query GetFacultyList {
    getFacultyList {
      id
      fullName
      email
      username
      department {
        id
        name
      }
    }
  }
`;

const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($input: DepartmentInput!) {
    createDepartment(input: $input) {
      id
      name
      code
    }
  }
`;

const LINK_FACULTY_TO_DEPT = gql`
  mutation LinkFacultyToDept($facultyId: ID!, $departmentId: ID!) {
    linkFacultyToDepartment(facultyId: $facultyId, departmentId: $departmentId) {
      id
      fullName
      department {
        id
        name
      }
    }
  }
`;

const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($id: ID!, $input: DepartmentInput!) {
    updateDepartment(id: $id, input: $input) {
      id
      name
      code
    }
  }
`;

const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: ID!) {
    deleteDepartment(id: $id)
  }
`;

const departmentValidationSchema = yup.object({
  name: yup.string().required('Department name is required'),
  code: yup.string().required('Registry code is required'),
});

export const DepartmentsManagement = () => {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const { data: deptData, loading: deptLoading, refetch: refetchDepts } = useQuery(GET_DEPARTMENTS);
  const { data: facultyData, loading: facultyLoading, refetch: refetchFaculty } = useQuery(GET_FACULTY_LIST);

  const [createDept] = useMutation(CREATE_DEPARTMENT);
  const [updateDept] = useMutation(UPDATE_DEPARTMENT);
  const [deleteDept] = useMutation(DELETE_DEPARTMENT);
  const [linkFaculty] = useMutation(LINK_FACULTY_TO_DEPT);

  // Formik for Creation
  const createFormik = useFormik({
    initialValues: { name: '', code: '' },
    validationSchema: departmentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createDept({ variables: { input: values } });
        setIsDeptModalOpen(false);
        resetForm();
        refetchDepts();
      } catch (err) {
        console.error(err);
      }
    }
  });

  // Formik for Update
  const updateFormik = useFormik({
    initialValues: { name: '', code: '' },
    validationSchema: departmentValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await updateDept({ 
          variables: { 
            id: selectedDeptId, 
            input: values 
          } 
        });
        setIsEditModalOpen(false);
        resetForm();
        setSelectedDeptId('');
        refetchDepts();
      } catch (err) {
        console.error(err);
      }
    }
  });

  const handleEditDept = (dept) => {
    setSelectedDeptId(dept.id);
    updateFormik.setValues({
      name: dept.name,
      code: dept.code
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to decommission this department? All faculty links will be severed.')) return;
    try {
      await deleteDept({ variables: { id } });
      refetchDepts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkFaculty = async () => {
    if (!selectedFaculty || !selectedDept) return;
    try {
      await linkFaculty({ variables: { facultyId: selectedFaculty, departmentId: selectedDept } });
      setIsLinkModalOpen(false);
      setSelectedFaculty('');
      setSelectedDept('');
      refetchFaculty();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', mb: 0.5 }}>
            Department Registry
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Manage academic units and faculty assignments
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => setIsLinkModalOpen(true)}
            startIcon={<PersonAddIcon />}
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
                borderColor: 'text.secondary', bgcolor: 'action.hover'
              }
            }}
          >
            Assign Faculty
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setIsDeptModalOpen(true)}
            startIcon={<AddIcon />}
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
            New Department
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Table list */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{  borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon sx={{ color: 'text.secondary', fontSize: 18 }} /> Registered Departments
              </Typography>
              <Chip 
                label={`${deptData?.getDepartments.length || 0} Total`} 
                size="small" 
                sx={{ fontSize: '10px', fontWeight: 700, bgcolor: 'action.selected', color: 'text.primary' }} 
              />
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Name</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Code</TableCell>
                    <TableCell sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Faculty Count</TableCell>
                    <TableCell align="right" sx={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ fontFamily: 'monospace' }}>
                  {deptLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Syncing Registry...
                      </TableCell>
                    </TableRow>
                  ) : deptData?.getDepartments.map((dept) => (
                    <TableRow key={dept.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell sx={{ fontWeight: 700, color: 'text.primary', fontSize: '14px' }}>{dept.name}</TableCell>
                      <TableCell sx={{ fontSize: '12px', color: 'text.secondary' }}>{dept.code}</TableCell>
                      <TableCell sx={{ fontSize: '12px', color: 'text.secondary' }}>
                        {facultyData?.getFacultyList.filter((f) => f.department?.id === dept.id).length || 0}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button 
                            onClick={() => handleEditDept(dept)}
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
                            Edit
                          </Button>
                          <Button 
                            onClick={() => handleDeleteDept(dept.id)}
                            sx={{ 
                              fontSize: '10px', 
                              fontWeight: 900, 
                              textTransform: 'uppercase', 
                              p: 0,
                              minWidth: 0,
                              color: '#ef4444',
                              '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' }
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Directory Column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{  borderRadius: 3 }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                <PeopleIcon sx={{ color: 'text.secondary', fontSize: 18 }} /> Faculty Directory
              </Typography>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto' }}>
              {facultyLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : facultyData?.getFacultyList.map((faculty) => (
                <Box 
                  key={faculty.id} 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', borderColor: 'divider', 
                    borderRadius: 2, 
                    bgcolor: 'action.hover',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                      {faculty.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5, display: 'block' }}>
                      @{faculty.username}
                    </Typography>
                  </Box>
                  {faculty.department ? (
                    <Chip 
                      label={faculty.department.name} 
                      size="small" 
                      sx={{ 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        bgcolor: '#ecfdf5', 
                        color: '#047857',
                        borderRadius: 1.5,
                        textTransform: 'uppercase'
                      }} 
                    />
                  ) : (
                    <Chip 
                      label="Unassigned" 
                      size="small" 
                      sx={{ 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        bgcolor: '#fef2f2', 
                        color: '#b91c1c',
                        borderRadius: 1.5,
                        textTransform: 'uppercase'
                      }} 
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Provision Department Modal */}
      <Modal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        title="Provision Department" 
        subtitle="Register a new academic unit"
      >
        <Box 
          component="form" 
          onSubmit={createFormik.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Department Name
            </Typography>
            <TextField 
              fullWidth
              id="name"
              name="name"
              placeholder="e.g. Physics"
              value={createFormik.values.name}
              onChange={createFormik.handleChange}
              error={createFormik.touched.name && Boolean(createFormik.errors.name)}
              helperText={createFormik.touched.name && createFormik.errors.name}
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
              Registry Code
            </Typography>
            <TextField 
              fullWidth
              id="code"
              name="code"
              placeholder="e.g. PHY_01"
              value={createFormik.values.code}
              onChange={createFormik.handleChange}
              error={createFormik.touched.code && Boolean(createFormik.errors.code)}
              helperText={createFormik.touched.code && createFormik.errors.code}
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
            disabled={!createFormik.values.name || !createFormik.values.code}
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
              '&:disabled': { bgcolor: 'action.selected', color: 'text.primary', color: 'text.secondary' }
            }}
          >
            Create Department
          </Button>
        </Box>
      </Modal>

      {/* Edit Department Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          updateFormik.resetForm();
          setSelectedDeptId('');
        }} 
        title="Update Department" 
        subtitle="Modify unit registry data"
      >
        <Box 
          component="form" 
          onSubmit={updateFormik.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Department Name
            </Typography>
            <TextField 
              fullWidth
              id="name"
              name="name"
              placeholder="e.g. Physics"
              value={updateFormik.values.name}
              onChange={updateFormik.handleChange}
              error={updateFormik.touched.name && Boolean(updateFormik.errors.name)}
              helperText={updateFormik.touched.name && updateFormik.errors.name}
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
              Registry Code
            </Typography>
            <TextField 
              fullWidth
              id="code"
              name="code"
              placeholder="e.g. PHY_01"
              value={updateFormik.values.code}
              onChange={updateFormik.handleChange}
              error={updateFormik.touched.code && Boolean(updateFormik.errors.code)}
              helperText={updateFormik.touched.code && updateFormik.errors.code}
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
            disabled={!updateFormik.values.name || !updateFormik.values.code}
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
              '&:disabled': { bgcolor: 'action.selected', color: 'text.primary', color: 'text.secondary' }
            }}
          >
            Update Department
          </Button>
        </Box>
      </Modal>

      {/* Assign Faculty Modal */}
      <Modal 
        isOpen={isLinkModalOpen} 
        onClose={() => setIsLinkModalOpen(false)} 
        title="Assign Faculty" 
        subtitle="Link a faculty member to a department"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <CustomSelect 
            label="Faculty Member"
            options={facultyData?.getFacultyList.map((f) => ({ id: f.id, name: `${f.fullName} (@${f.username})` })) || []}
            value={selectedFaculty}
            onChange={setSelectedFaculty}
            placeholder="Select faculty..."
          />
          <CustomSelect 
            label="Target Department"
            options={deptData?.getDepartments.map((d) => ({ id: d.id, name: d.name })) || []}
            value={selectedDept}
            onChange={setSelectedDept}
            placeholder="Select department..."
          />
          <Button 
            onClick={handleLinkFaculty}
            disabled={!selectedFaculty || !selectedDept}
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
              '&:disabled': { bgcolor: 'action.selected', color: 'text.primary', color: 'text.secondary' }
            }}
          >
            Confirm Assignment
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};
