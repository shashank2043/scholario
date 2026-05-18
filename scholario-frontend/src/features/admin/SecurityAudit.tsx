import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { ShieldAlert, Activity, Filter, Search, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
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
  const [selectedViolation, setSelectedViolation] = useState<any>(null);
  
  const { data, loading, refetch } = useQuery(GET_VIOLATIONS, {
    variables: { username: searchTerm || undefined }
  });

  const { data: patternData, loading: patternLoading } = useQuery(ANALYZE_PATTERNS);

  const violations = data?.getViolationReports || [];
  const patterns = patternData?.analyzeUsagePatterns || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Security Audit Log</h2>
          <p className="text-sm text-slate-500 font-medium">Global infrastructure telemetry & violation monitoring</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
        >
          <Activity size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-xl p-5 text-white">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Security Overview</h4>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-black text-white leading-none">{violations.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Total Incidents</p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div>
                <p className="text-2xl font-black text-rose-500 leading-none">
                  {violations.filter((v: any) => v.severity === 'CRITICAL').length}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Critical Alerts</p>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div>
                <p className="text-2xl font-black text-emerald-500 leading-none">
                  {violations.filter((v: any) => v.resolved).length}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Resolved Nodes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center">
              <Filter size={12} className="mr-2" /> Search Filters
            </h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search Subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg focus:border-indigo-500 outline-none text-xs font-medium"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <ShieldAlert size={16} className="mr-2 text-rose-500" /> Active Violation Registry
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Incident Type</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase animate-pulse">Synchronizing Security Nodes...</td></tr>
                  ) : violations.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No Security Breaches Detected</td></tr>
                  ) : violations.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-[13px]">{v.username}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">Node ID: {v.id.substring(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">{v.type.replace(/_/g, ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase ${getSeverityColor(v.severity)}`}>
                          {v.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-500 uppercase">
                        {new Date(v.detectedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedViolation(v)}
                          className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Info size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <ShieldCheck size={16} className="mr-2 text-indigo-500" /> Usage Pattern Analysis
              </h4>
            </div>
            <div className="p-6">
              {patternLoading ? (
                 <div className="text-center py-4 text-slate-400 text-[10px] uppercase font-bold animate-pulse">Analyzing Patterns...</div>
              ) : patterns.length === 0 ? (
                 <div className="text-center py-4 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-2 border-dashed border-slate-100 rounded-lg">No Suspicious Patterns Detected</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {patterns.map((p: any) => (
                     <div key={p.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-slate-300 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <p className="text-sm font-black text-slate-900">{p.username}</p>
                           <span className={`px-1.5 py-0.5 text-[8px] font-black rounded border uppercase ${getSeverityColor(p.severity)}`}>{p.severity}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{p.description}"</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-3 uppercase">{new Date(p.detectedAt).toLocaleDateString()}</p>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedViolation}
        onClose={() => setSelectedViolation(null)}
        title="Incident Forensics"
        subtitle="Detailed violation breakdown and resolution protocol"
      >
        {selectedViolation && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border flex items-start space-x-4 ${getSeverityColor(selectedViolation.severity)}`}>
               <AlertTriangle size={24} className="shrink-0 mt-1" />
               <div>
                  <h5 className="font-black text-sm uppercase tracking-tight">Security Breach Detected</h5>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed font-medium">{selectedViolation.description}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-sm font-bold text-slate-900">@{selectedViolation.username}</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Type</p>
                  <p className="text-sm font-bold text-slate-900">{selectedViolation.type.replace(/_/g, ' ')}</p>
               </div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl text-white">
               <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-indigo-400" />
                  <h4 className="text-[11px] font-black uppercase tracking-widest">Resolution Protocol</h4>
               </div>
               <div className="space-y-3">
                  <button 
                    onClick={() => { alert('Isolating Node...'); setSelectedViolation(null); }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                  >
                    Isolate Subject Node
                  </button>
                  <button 
                    onClick={() => { alert('Clearing Incident...'); setSelectedViolation(null); }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all"
                  >
                    Mark as False Positive
                  </button>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
