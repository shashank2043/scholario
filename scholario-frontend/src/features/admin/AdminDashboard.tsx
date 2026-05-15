import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Clock, Users, Activity, Lock, AlertTriangle } from 'lucide-react';
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

const GET_UNASSIGNED_USERS = gql`
  query GetUnassignedUsers {
    getUnassignedUsers {
      id
      username
      fullName
    }
  }
`;

const GET_USER_STATS = gql`
  query GetUserStats {
    getFacultyList { id }
    getStudentList { id }
    getUnassignedUsers { id }
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

const StatCard = ({ icon: Icon, label, value, color, delay }: { icon: React.ElementType, label: string, value: string | number, color: string, delay: string }) => (
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
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLockdownModalOpen, setIsLockdownModalOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const { data, loading, error } = useQuery<ViolationData>(GET_VIOLATIONS);
  const { data: unassignedData, refetch: refetchUnassigned } = useQuery<{ getUnassignedUsers: User[] }>(GET_UNASSIGNED_USERS);
  const { data: userStatsData, refetch: refetchUserStats } = useQuery<{
    getFacultyList: { id: string }[];
    getStudentList: { id: string }[];
    getUnassignedUsers: { id: string }[];
  }>(GET_USER_STATS);

  const [assignRole] = useMutation(ASSIGN_ROLE);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    try {
      await assignRole({ variables: { userId: selectedUser, role: selectedRole } });
      setIsRoleModalOpen(false);
      setSelectedUser('');
      setSelectedRole('');
      refetchUnassigned();
      refetchUserStats();
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

  const totalUsersCount = (userStatsData?.getFacultyList?.length || 0) + 
                          (userStatsData?.getStudentList?.length || 0) + 
                          (userStatsData?.getUnassignedUsers?.length || 0);

  const userOptions = unassignedData?.getUnassignedUsers.map(u => ({ id: u.id, name: `${u.fullName} (@${u.username})` })) || [];
  const roleOptions = [
    { id: 'ADMIN', name: 'Administrator' },
    { id: 'FACULTY', name: 'Faculty' },
    { id: 'STUDENT', name: 'Student' },
    { id: 'LIBRARIAN', name: 'Librarian' },
  ];

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen -m-8 p-8">
      {/* Enterprise Header */}
      <header className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center animate-slide-up">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">System Control Hub</h3>
              <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-700 uppercase">Live</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium font-mono uppercase">Node ID: SCHOLARIO-PRD-01 // Global Oversight Mode</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsLockdownModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all btn-tactile shadow-sm shadow-rose-200 border border-rose-700"
        >
          <Lock size={14} />
          <span>Emergency Lockdown</span>
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShieldAlert} label="System Violations" value={data?.getViolationReports.length || 0} color="bg-slate-100 text-slate-700" delay="100ms" />
        <StatCard icon={Clock} label="Pending Resolution" value={pendingViolations} color="bg-amber-100 text-amber-700" delay="200ms" />
        <StatCard icon={ShieldAlert} label="Critical Alerts" value={criticalViolations} color="bg-rose-100 text-rose-700" delay="300ms" />
        <StatCard icon={Users} label="Node Users" value={totalUsersCount || '...'} color="bg-sky-100 text-sky-700" delay="400ms" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Live Security Feed</h4>
            <Link to="/admin/security" className="text-[11px] text-indigo-600 font-black uppercase hover:underline transition-colors tracking-widest">Full Audit Engine &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loading ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold animate-pulse">Synchronizing Telemetry...</td></tr>
                ) : data?.getViolationReports.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">Zero Violations Detected</td></tr>
                ) : data?.getViolationReports.slice(0, 5).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900 text-[13px]">{v.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${
                        v.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        v.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>{v.severity}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 font-black text-[10px] uppercase hover:underline">Inspect</button>
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
              <Lock size={16} className="mr-2 text-slate-400" /> Administrative Ops
            </h4>
            <div className="space-y-2">
              <Link 
                to="/admin/departments"
                className="w-full text-left p-4 block rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 transition-all group btn-tactile"
              >
                <p className="font-bold text-xs text-slate-900 uppercase tracking-wide group-hover:text-indigo-600">Department Registry</p>
                <p className="text-[10px] text-slate-500 font-medium">Manage academic infrastructure</p>
              </Link>
              <button 
                onClick={() => setIsRoleModalOpen(true)}
                className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-indigo-300 hover:bg-slate-50 transition-all group btn-tactile"
              >
                <p className="font-bold text-xs text-slate-900 uppercase tracking-wide group-hover:text-indigo-600">Role Authorization</p>
                <p className="text-[10px] text-slate-500 font-medium">Verify node permissions</p>
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
