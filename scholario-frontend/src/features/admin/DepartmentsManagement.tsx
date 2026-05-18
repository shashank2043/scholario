import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Users, Plus, Building2, UserPlus, ShieldCheck } from 'lucide-react';
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

export const DepartmentsManagement = () => {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const { data: deptData, loading: deptLoading, refetch: refetchDepts } = useQuery(GET_DEPARTMENTS);
  const { data: facultyData, loading: facultyLoading, refetch: refetchFaculty } = useQuery(GET_FACULTY_LIST);

  const [createDept] = useMutation(CREATE_DEPARTMENT);
  const [updateDept] = useMutation(UPDATE_DEPARTMENT);
  const [deleteDept] = useMutation(DELETE_DEPARTMENT);
  const [linkFaculty] = useMutation(LINK_FACULTY_TO_DEPT);

  const handleCreateDept = async () => {
    if (!deptName || !deptCode) return;
    try {
      await createDept({ variables: { input: { name: deptName, code: deptCode } } });
      setIsDeptModalOpen(false);
      setDeptName('');
      setDeptCode('');
      refetchDepts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDept = (dept: any) => {
    setSelectedDeptId(dept.id);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setIsEditModalOpen(true);
  };

  const handleUpdateDept = async () => {
    if (!deptName || !deptCode || !selectedDeptId) return;
    try {
      await updateDept({ 
        variables: { 
          id: selectedDeptId, 
          input: { name: deptName, code: deptCode } 
        } 
      });
      setIsEditModalOpen(false);
      setDeptName('');
      setDeptCode('');
      setSelectedDeptId('');
      refetchDepts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDept = async (id: string) => {
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
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Department Registry</h2>
          <p className="text-sm text-slate-500 font-medium">Manage academic units and faculty assignments</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsLinkModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <UserPlus size={14} />
            <span>Assign Faculty</span>
          </button>
          <button 
            onClick={() => setIsDeptModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus size={14} />
            <span>New Department</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
              <Building2 size={16} className="mr-2 text-slate-400" /> Registered Departments
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
              {deptData?.getDepartments.length || 0} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Count</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {deptLoading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs uppercase animate-pulse">Syncing Registry...</td></tr>
                ) : deptData?.getDepartments.map((dept: any) => (
                  <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">{dept.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{dept.code}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {facultyData?.getFacultyList.filter((f: any) => f.department?.id === dept.id).length || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-3">
                        <button 
                          onClick={() => handleEditDept(dept)}
                          className="text-indigo-600 font-black text-[10px] uppercase hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteDept(dept.id)}
                          className="text-rose-600 font-black text-[10px] uppercase hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
              <Users size={16} className="mr-2 text-slate-400" /> Faculty Directory
            </h4>
          </div>
          <div className="p-4 space-y-3">
            {facultyLoading ? (
              <div className="text-center py-4 text-slate-400 text-[10px] uppercase font-bold animate-pulse">Loading Faculty...</div>
            ) : facultyData?.getFacultyList.map((faculty: any) => (
              <div key={faculty.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/30 hover:border-slate-300 transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[13px] font-black text-slate-900 leading-none">{faculty.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">@{faculty.username}</p>
                  </div>
                  {faculty.department ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded border border-emerald-100 uppercase">
                      {faculty.department.name}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-black rounded border border-rose-100 uppercase">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        title="Provision Department" 
        subtitle="Register a new academic unit"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Name</label>
            <input 
              type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-medium text-sm"
              placeholder="e.g. Physics"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Code</label>
            <input 
              type="text" value={deptCode} onChange={(e) => setDeptCode(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-mono text-sm"
              placeholder="e.g. PHY_01"
            />
          </div>
          <button 
            onClick={handleCreateDept}
            disabled={!deptName || !deptCode}
            className="w-full py-3 bg-slate-900 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 disabled:opacity-50 mt-2"
          >
            Create Department
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setDeptName('');
          setDeptCode('');
          setSelectedDeptId('');
        }} 
        title="Update Department" 
        subtitle="Modify unit registry data"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Name</label>
            <input 
              type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-medium text-sm"
              placeholder="e.g. Physics"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Code</label>
            <input 
              type="text" value={deptCode} onChange={(e) => setDeptCode(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none font-mono text-sm"
              placeholder="e.g. PHY_01"
            />
          </div>
          <button 
            onClick={handleUpdateDept}
            disabled={!deptName || !deptCode}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 disabled:opacity-50 mt-2"
          >
            Update Department
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isLinkModalOpen} 
        onClose={() => setIsLinkModalOpen(false)} 
        title="Assign Faculty" 
        subtitle="Link a faculty member to a department"
      >
        <div className="space-y-4">
          <CustomSelect 
            label="Faculty Member"
            options={facultyData?.getFacultyList.map((f: any) => ({ id: f.id, name: `${f.fullName} (@${f.username})` })) || []}
            value={selectedFaculty}
            onChange={setSelectedFaculty}
            placeholder="Select faculty..."
          />
          <CustomSelect 
            label="Target Department"
            options={deptData?.getDepartments.map((d: any) => ({ id: d.id, name: d.name })) || []}
            value={selectedDept}
            onChange={setSelectedDept}
            placeholder="Select department..."
          />
          <button 
            onClick={handleLinkFaculty}
            disabled={!selectedFaculty || !selectedDept}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-100 disabled:opacity-50 mt-2"
          >
            Confirm Assignment
          </button>
        </div>
      </Modal>
    </div>
  );
};
