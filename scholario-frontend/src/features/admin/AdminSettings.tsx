import { useState } from 'react';
import { User, Shield, Database } from 'lucide-react';
import { ProfileManager } from '../shared/ProfileManager';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'nodes'>('profile');

  const tabs = [
    { id: 'profile', label: 'Manage Profile', icon: User },
    { id: 'security', label: 'Access Control', icon: Shield },
    { id: 'nodes', label: 'Node Config', icon: Database },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      <header>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">System Configuration</h3>
        <p className="text-xs text-slate-500 font-medium font-mono uppercase mt-1">Infrastructure Override Mode // Node ID: SCHOLARIO-PRD-01</p>
      </header>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'profile' | 'security' | 'nodes')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'profile' && <ProfileManager />}
        {activeTab === 'security' && (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <Shield className="mx-auto text-slate-300 mb-4" size={48} />
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">RBAC Console Locked</h4>
            <p className="text-xs text-slate-500 mt-2">Access control parameters are managed via the Security Audit tab.</p>
          </div>
        )}
        {activeTab === 'nodes' && (
           <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
            <Database className="mx-auto text-slate-300 mb-4" size={48} />
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Telemetry Node Config</h4>
            <p className="text-xs text-slate-500 mt-2">Node parameters are optimized for production. Manual override disabled.</p>
          </div>
        )}
      </div>
    </div>
  );
};
