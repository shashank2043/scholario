import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Clock, Users, Activity, Lock, AlertTriangle, Building2, ChevronRight, ShieldCheck } from 'lucide-react';
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

interface Violation {
  id: string;
  username: string;
  type: string;
  severity: string;
  description: string;
  detectedAt: string;
  resolved: boolean;
}

interface User {
  id: string;
  username: string;
  fullName: string;
}

interface ViolationData {
  getViolationReports: Violation[];
}

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: any, label: string, value: string | number, color: string, delay: string }) => (
  <div 
    className={`bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-4 animate-slide-up opacity-0 card-tactile hover:border-slate-300 transition-colors cursor-default`}
    style={{ animationDelay: delay }}
  >
    <div className={`p-2.5 rounded-md ${color}`}><Icon size={20} /></div>
    <div>
      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { data, loading, error } = useQuery<ViolationData>(GET_VIOLATIONS);
  const { data: allUsersData, loading: usersLoading } = useQuery<{ getAllUsers: any[] }>(GET_ALL_USERS);
  const { data: unassignedData, refetch: refetchUnassigned } = useQuery<{ getUnassignedUsers: User[] }>(GET_UNASSIGNED_USERS);

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
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 animate-slide-up">
      <h4 className="font-bold flex items-center mb-1 text-sm"><ShieldAlert size={18} className="mr-2" /> SYSTEM_ERROR_LINK_FAILURE</h4>
      <p className="text-sm">Unable to synchronize with telemetry nodes. Infrastructure monitoring offline.</p>
    </div>
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
    <div className="space-y-6 bg-slate-50 min-h-screen -m-4 sm:-m-8 p-4 sm:p-8">
      {/* Enterprise Header */}
      <header className="bg-white p-4 sm:p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-slate-900 p-2 rounded-lg text-white shrink-0">
            <Activity size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter uppercase truncate">System Control Hub</h3>
              <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 uppercase">Live</span>
              </div>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium font-mono uppercase truncate">Node ID: SCHOLARIO-PRD-01 // Global Oversight Mode</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsLockdownModalOpen(true)}
          className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 py-2 sm:py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] sm:text-xs uppercase tracking-widest transition-all btn-tactile shadow-sm shadow-rose-200 border border-rose-700 shrink-0"
        >
          <Lock size={14} />
          <span>Emergency Lockdown</span>
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">        <StatCard icon={ShieldAlert} label="Security Violations" value={loading ? '...' : data?.getViolationReports.length || 0} color="bg-slate-100 text-slate-700" delay="100ms" />
        <StatCard icon={Clock} label="Pending Investigation" value={loading ? '...' : pendingViolations} color="bg-amber-100 text-amber-700" delay="200ms" />
        <StatCard icon={AlertTriangle} label="Critical Alerts" value={loading ? '...' : criticalViolations} color="bg-rose-100 text-rose-700" delay="300ms" />
        <StatCard icon={Users} label="Global Entities" value={usersLoading ? '...' : totalEntities} color="bg-sky-100 text-sky-700" delay="400ms" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Security Violations Engine</h4>
            <Link to="/admin/security" className="text-[11px] text-slate-500 font-bold uppercase hover:text-slate-900 transition-colors tracking-widest flex items-center">
              Full Audit Log <ChevronRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold animate-pulse">Synchronizing Telemetry...</td></tr>
                ) : data?.getViolationReports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">Zero Violations Detected</td></tr>
                ) : data?.getViolationReports.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900 text-[13px]">{v.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${
                        v.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        v.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>{v.severity}</span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors truncate max-w-[200px]">{v.description}</td>
                    <td className="px-6 py-4">
                      {v.resolved ? (
                        <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest"><CheckCircle size={12} className="mr-1.5" /> Resolved</span>
                      ) : (
                        <span className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-widest"><Clock size={12} className="mr-1.5" /> Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => navigate('/admin/security')} className="text-indigo-600 font-black text-[10px] uppercase hover:underline">Investigate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 animate-slide-up opacity-0" style={{ animationDelay: '600ms' }}>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter mb-4 flex items-center">
              <Lock size={16} className="mr-2 text-slate-400" /> Infrastructure Master
            </h4>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/departments')}
                className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 transition-all group btn-tactile flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 uppercase tracking-wide group-hover:text-indigo-600 flex items-center">
                    <Building2 size={14} className="mr-2" /> Department Master
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Provision academic units</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400" />
              </button>
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 transition-all group btn-tactile flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-xs text-slate-900 uppercase tracking-wide group-hover:text-indigo-600 flex items-center">
                    <ShieldCheck size={14} className="mr-2" /> Role Authorization
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Verify node permissions</p>
                </div>
                <div className="flex items-center">
                   {unassignedData?.getUnassignedUsers.length ? (
                     <span className="mr-2 px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse">
                       {unassignedData.getUnassignedUsers.length}
                     </span>
                   ) : null}
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400" />
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-lg text-white space-y-4">
             <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-500" />
                <h4 className="text-xs font-black uppercase tracking-widest">Protocol Status</h4>
             </div>
             <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                [ACTIVE] Encryption: AES-256-GCM<br/>
                [ACTIVE] Node Auth: OAuth 2.0<br/>
                [STABLE] Connection: Global Telemetry
             </p>
          </div>
        </div>
      </div>

      {/* Role Authorization Modal */}
      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        title="Role Authorization" 
        subtitle="Validate and assign permissions to unassigned users"
      >
        <div className="space-y-6">
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
          <button 
            onClick={handleAssignRole}
            disabled={!selectedUser || !selectedRole}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs btn-tactile disabled:opacity-50"
          >
            Authorize Access
          </button>
        </div>
      </Modal>

      {/* Lockdown Modal */}
      <Modal 
        isOpen={isLockdownModalOpen} 
        onClose={() => setIsLockdownModalOpen(false)} 
        title="CRITICAL: System Lockdown" 
        subtitle="Executing this protocol will sever all active user connections"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <AlertTriangle size={40} />
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            You are about to initiate a <strong>Global System Lockdown</strong>. This action is irreversible via standard protocols and will require manual infrastructure restart.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setIsLockdownModalOpen(false)} className="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest btn-tactile">Abort</button>
            <button onClick={() => { alert('LOCKDOWN_EXECUTED'); setIsLockdownModalOpen(false); }} className="py-4 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest btn-tactile">Confirm Lockdown</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
