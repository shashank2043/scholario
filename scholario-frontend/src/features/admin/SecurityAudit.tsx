import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';

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

export const SecurityAudit = () => {
  const { data, loading, error } = useQuery<ViolationData>(GET_VIOLATIONS);

  if (error) return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
      <h4 className="font-bold flex items-center mb-1 text-sm"><ShieldAlert size={18} className="mr-2" /> AUDIT_LOG_FAILURE</h4>
      <p className="text-sm">Unable to synchronize with security telemetry.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Global Security Violations Engine</h4>
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
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold animate-pulse">Synchronizing Telemetry...</td></tr>
            ) : data?.getViolationReports.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-xs uppercase font-bold tracking-widest">Zero Violations Detected</td></tr>
            ) : data?.getViolationReports.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900 text-[13px]">{v.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded border ${
                    v.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    v.severity === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>{v.severity}</span>
                </td>
                <td className="px-6 py-4 text-[12px] text-slate-600 group-hover:text-slate-900 transition-colors truncate max-w-[400px]">{v.description}</td>
                <td className="px-6 py-4">
                  {v.resolved ? (
                    <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest"><CheckCircle size={12} className="mr-1.5" /> Resolved</span>
                  ) : (
                    <span className="flex items-center text-amber-600 text-[10px] font-black uppercase tracking-widest"><Clock size={12} className="mr-1.5" /> Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 text-[10px] text-slate-500 font-mono uppercase">{new Date(v.detectedAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-indigo-600 font-black text-[10px] uppercase hover:underline">Isolate</button>
                  <button className="text-slate-600 font-black text-[10px] uppercase hover:underline">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
