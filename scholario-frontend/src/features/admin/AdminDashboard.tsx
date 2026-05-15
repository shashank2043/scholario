import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Clock, Users, Activity, Lock } from 'lucide-react';

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
  const { data, loading, error } = useQuery<ViolationData>(GET_VIOLATIONS);

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 animate-slide-up">
      <h4 className="font-bold flex items-center mb-1 text-sm"><ShieldAlert size={18} className="mr-2" /> SYSTEM_ERROR_LINK_FAILURE</h4>
      <p className="text-sm">Unable to synchronize with telemetry nodes. Infrastructure monitoring offline.</p>
    </div>
  );

  const pendingViolations = data?.getViolationReports.filter(v => !v.resolved).length || 0;
  const criticalViolations = data?.getViolationReports.filter(v => v.severity === 'CRITICAL').length || 0;

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
        
        <button className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all btn-tactile shadow-sm shadow-rose-200 border border-rose-700">
          <Lock size={14} />
          <span>Emergency Lockdown</span>
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShieldAlert} label="System Violations" value={data?.getViolationReports.length || 0} color="bg-slate-100 text-slate-700" delay="100ms" />
        <StatCard icon={Clock} label="Pending Resolution" value={pendingViolations} color="bg-amber-100 text-amber-700" delay="200ms" />
        <StatCard icon={ShieldAlert} label="Critical Alerts" value={criticalViolations} color="bg-rose-100 text-rose-700" delay="300ms" />
        <StatCard icon={Users} label="Node Users" value="1,248" color="bg-sky-100 text-sky-700" delay="400ms" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-slide-up opacity-0" style={{ animationDelay: '500ms' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Security Violations Engine</h4>
            <Link to="/admin/security" className="text-[11px] text-slate-500 font-bold uppercase hover:text-slate-900 transition-colors tracking-widest">Full Audit Log &rarr;</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected At</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold animate-pulse">Synchronizing Telemetry...</td></tr>
                ) : data?.getViolationReports.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">Zero Violations Detected</td></tr>
                ) : data?.getViolationReports.slice(0, 8).map((v) => (
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
                    <td className="px-6 py-4 text-[11px] text-slate-500 font-mono">{new Date(v.detectedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 space-x-2">
                      <button className="px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded btn-tactile">Isolate</button>
                      <button className="px-2 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded btn-tactile">Resolve</button>
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
              <Lock size={16} className="mr-2 text-slate-400" /> Administrative Access
            </h4>
            <div className="space-y-2">
              <button className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group btn-tactile">
                <p className="font-bold text-xs text-slate-900 uppercase tracking-wide">Infrastructure Auth</p>
                <p className="text-[10px] text-slate-500 font-medium">Verify node permissions</p>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group btn-tactile">
                <p className="font-bold text-xs text-slate-900 uppercase tracking-wide">Audit Protocols</p>
                <p className="text-[10px] text-slate-500 font-medium">Global security override</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
