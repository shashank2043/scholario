import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Activity, Plus, Trash2, Building2 } from 'lucide-react';
import { Modal } from '../../components/Modal';

const GET_DEPARTMENTS = gql`
  query GetDepartments {
    getDepartments {
      id
      name
      code
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

const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: ID!) {
    deleteDepartment(id: $id)
  }
`;

interface Department {
  id: string;
  name: string;
  code: string;
}

export const DepartmentsMaster = () => {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  const { data, loading, error } = useQuery<{ getDepartments: Department[] }>(GET_DEPARTMENTS);
  const [createDept] = useMutation(CREATE_DEPARTMENT);
  const [deleteDept] = useMutation(DELETE_DEPARTMENT);

  const handleCreateDept = async () => {
    if (!deptName || !deptCode) return;
    try {
      await createDept({ 
        variables: { input: { name: deptName, code: deptCode } },
        refetchQueries: [{ query: GET_DEPARTMENTS }]
      });
      setIsDeptModalOpen(false);
      setDeptName('');
      setDeptCode('');
    } catch (err) {
      console.error('Failed to create department:', err);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Execute PERMANENT_DELETION on this academic unit?')) return;
    try {
      await deleteDept({ 
        variables: { id },
        refetchQueries: [{ query: GET_DEPARTMENTS }]
      });
    } catch (err) {
      console.error('Failed to delete department:', err);
    }
  };

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
      <h4 className="font-bold flex items-center mb-1 text-sm"><Building2 size={18} className="mr-2" /> REGISTRY_FAILURE</h4>
      <p className="text-sm">Unable to synchronize with academic units registry.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Academic Departments Registry</h3>
          <p className="text-xs text-slate-500 font-medium font-mono uppercase">Node Control // Provisioning Mode</p>
        </div>
        <button 
          onClick={() => setIsDeptModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all btn-tactile shadow-sm shadow-indigo-200 border border-indigo-700"
        >
          <Plus size={14} />
          <span>Provision New Unit</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs uppercase font-bold animate-pulse tracking-widest">Synchronizing Registry...</div>
        ) : data?.getDepartments?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs uppercase font-bold tracking-widest border-2 border-dashed border-slate-200 rounded-xl">Zero Units Registered</div>
        ) : (
          data?.getDepartments?.map((dept) => (
            <div key={dept.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all card-tactile">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Activity size={20} />
                </div>
                <button 
                  onClick={() => handleDeleteDept(dept.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{dept.name}</h4>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{dept.code}</p>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isDeptModalOpen} 
        onClose={() => setIsDeptModalOpen(false)} 
        title="Provision Academic Unit" 
        subtitle="Finalize unit parameters in the global registry"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department Name</label>
            <input 
              type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-medium transition-all"
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Code</label>
            <input 
              type="text" value={deptCode} onChange={(e) => setDeptCode(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono transition-all"
              placeholder="e.g. CS_UNIT_01"
            />
          </div>
          <button 
            onClick={handleCreateDept}
            disabled={!deptName || !deptCode}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs btn-tactile disabled:opacity-50 mt-4"
          >
            Finalize Registry
          </button>
        </div>
      </Modal>
    </div>
  );
};
