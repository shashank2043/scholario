import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { ShieldAlert, CheckCircle, Clock, LayoutGrid, Users } from 'lucide-react';

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

interface Violation {
  id: string;
  username: string;
  type: string;
  severity: string;
  description: string;
  detectedAt: string;
  resolved: boolean;
}

interface ViolationData {
  getViolationReports: Violation[];
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}><Icon size={24} /></div>
    <div><p className="text-sm text-gray-500 font-medium">{label}</p><p className="text-2xl font-bold text-gray-800">{value}</p></div>
  </div>
);

export const AdminDashboard = () => {
  const { data, loading, error } = useQuery<ViolationData>(GET_VIOLATIONS);

  if (error) return (
    <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-red-700">
      <h4 className="font-bold flex items-center mb-2"><ShieldAlert className="mr-2" /> Data Fetching Error</h4>
      <p>Could not retrieve system metrics. Please ensure the backend services are operational.</p>
      <p className="text-xs mt-2">Error Detail: {error.message}</p>
    </div>
  );

  const pendingViolations = data?.getViolationReports.filter(v => !v.resolved).length || 0;
  const criticalViolations = data?.getViolationReports.filter(v => v.severity === 'CRITICAL').length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800">Administrator Command Center</h3>
        <p className="text-gray-500">Global system monitoring, security audits, and infrastructure management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ShieldAlert} label="Total Violations" value={data?.getViolationReports.length || 0} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Clock} label="Pending Action" value={pendingViolations} color="bg-amber-50 text-amber-600" />
        <StatCard icon={ShieldAlert} label="Critical Alerts" value={criticalViolations} color="bg-red-50 text-red-600" />
        <StatCard icon={Users} label="Total Users" value="Live Data" color="bg-blue-50 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h4 className="font-bold text-gray-800">System Violations Log</h4>
            <button className="text-sm text-indigo-600 font-medium hover:underline">View All Reports</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Issue</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Synchronizing system logs...</td></tr>
              ) : data?.getViolationReports.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No security violations detected.</td></tr>
              ) : data?.getViolationReports.slice(0, 10).map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 text-sm">{v.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      v.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' :
                      v.severity === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>{v.severity}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{v.description}</td>
                  <td className="px-6 py-4">
                    {v.resolved ? (
                      <span className="flex items-center text-green-600 text-xs font-bold"><CheckCircle size={14} className="mr-1" /> SECURE</span>
                    ) : (
                      <span className="flex items-center text-amber-600 text-xs font-bold"><Clock size={14} className="mr-1" /> INVESTIGATING</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center"><LayoutGrid size={18} className="mr-2 text-indigo-600" /> Infrastructure</h4>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-lg border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50 transition-all group">
                <p className="font-bold text-sm text-gray-800 group-hover:text-indigo-700">Department Management</p>
                <p className="text-xs text-gray-500">Configure academic units and codes</p>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-gray-50 hover:border-indigo-100 hover:bg-indigo-50 transition-all group">
                <p className="font-bold text-sm text-gray-800 group-hover:text-indigo-700">User Role Audits</p>
                <p className="text-xs text-gray-500">Review and verify portal permissions</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
